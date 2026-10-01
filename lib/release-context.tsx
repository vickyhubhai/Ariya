'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { discordConfig, githubConfig } from './config';
import { announceRelease, checkNewsNow } from './discord';
import { downloadAsset } from './downloader';
import { clearReleaseCache, getLatestRelease, loadCachedRelease } from './github';
import { useDeviceTier } from './hooks';
import { imageForVersion, invalidateNews } from './news';
import { ApiError, type ApkAsset, type DeviceTier, type DownloadPhase, type Release, type ToastAction, type ToastPayload } from './types';
import {
  compareVersions,
  isOffline,
  isRecommendedAsset,
  storageGet,
  storageSet,
  whenIdle,
} from './utils';

/** Codes where the UI shows a generic "Unable to load the latest release." */
const GENERIC_CODES = new Set(['network', 'timeout', 'offline', 'server_error', 'invalid_json', 'http']);

export interface ReleaseContextValue {
  release: Release | null;
  /** True once a release (live or cached) has been resolved. */
  synced: boolean;
  /** True when the first fetch failed with nothing cached to show. */
  unavailable: boolean;
  /** The "Checking the latest release…" chip. */
  fetching: boolean;
  /** Text inside the red error banner ('' = hidden). */
  error: string;
  status: { message: string; warn: boolean; visible: boolean };
  hasUpdate: boolean;
  toast: ToastPayload | null;
  tier: DeviceTier;
  apkAssets: ApkAsset[];
  selected: ApkAsset | null;
  recommended: ApkAsset | null;
  newsImage: { src: string; alt: string } | null;
  downloadPhase: DownloadPhase;
  /** 0-1 fraction of bytes received, or null when no real progress exists. */
  downloadProgress: number | null;
  /** How the in-flight/last download is being carried out, or null when idle. */
  downloadMode: 'streamed' | 'direct' | null;
  selectVariant: (name: string) => void;
  startDownload: (asset?: ApkAsset) => void;
  /** Aborts a streaming download in progress (a direct hand-off cannot be undone). */
  cancelDownload: () => void;
  showToast: (message: string, actions?: ToastAction[]) => void;
  hideToast: () => void;
  acknowledge: () => void;
  checkAgain: () => void;
}

const ReleaseContext = createContext<ReleaseContextValue | null>(null);

export function useRelease(): ReleaseContextValue {
  const ctx = useContext(ReleaseContext);
  if (!ctx) throw new Error('useRelease() must be used inside <ReleaseProvider>');
  return ctx;
}

/**
 * Single source of truth for everything the old `Download` + `ReleaseSync`
 * globals did: release fetching and caching, the update badge, the release
 * status line, the error banner, the toast queue and the download itself.
 */
export function ReleaseProvider({ children }: { children: ReactNode }) {
  const tier = useDeviceTier();

  const [release, setRelease] = useState<Release | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatusState] = useState<{ message: string; warn: boolean; visible: boolean }>({
    message: '',
    warn: false,
    visible: false,
  });
  const [hasUpdate, setHasUpdate] = useState(false);
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [newsImage, setNewsImage] = useState<{ src: string; alt: string } | null>(null);
  const [downloadPhase, setDownloadPhase] = useState<DownloadPhase>('idle');
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadMode, setDownloadMode] = useState<'streamed' | 'direct' | null>(null);

  const releaseRef = useRef<Release | null>(null);
  const phaseRef = useRef<DownloadPhase>('idle');
  const inflightRef = useRef<Promise<Release | null> | null>(null);
  const toastIdRef = useRef(0);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const tierRef = useRef<DeviceTier>(tier);

  useEffect(() => {
    tierRef.current = tier;
  }, [tier]);

  const setPhase = useCallback((phase: DownloadPhase) => {
    phaseRef.current = phase;
    setDownloadPhase(phase);
  }, []);

  const hideToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = null;
    setToast(null);
  }, []);

  const showToast = useCallback((message: string, actions: ToastAction[] = []) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ id: ++toastIdRef.current, message, actions });
    toastTimerRef.current = setTimeout(hideToast, actions.length ? 10000 : 3000);
  }, [hideToast]);

  const showError = useCallback((message: string) => setError(message), []);
  const hideError = useCallback(() => setError(''), []);

  const setStatus = useCallback((message: string, warn = false) => {
    setStatusState({ message, warn: !!warn, visible: !!message });
  }, []);

  const acknowledge = useCallback(() => {
    const keys = githubConfig.storageKeys;
    const tag = releaseRef.current?.version ?? storageGet(keys.lastReleaseTag);
    if (tag) {
      storageSet(keys.acknowledgedTag, tag);
      storageSet(keys.notifiedTag, tag);
    }
    setHasUpdate(false);
  }, []);

  // Keeps the toast action stable without re-creating startDownload in evaluate().
  const startDownloadRef = useRef<(asset?: ApkAsset) => Promise<void>>(async () => {});

  /** Update badge + "new release" toast bookkeeping (was ReleaseSync.evaluate). */
  const evaluate = useCallback(
    (rel: Release) => {
      if (!rel || typeof rel.version !== 'string' || !rel.version) return;
      const keys = githubConfig.storageKeys;
      const tag = rel.version;
      const last = storageGet(keys.lastReleaseTag);

      if (!last) {
        storageSet(keys.lastReleaseTag, tag);
        storageSet(keys.acknowledgedTag, tag);
        storageSet(keys.notifiedTag, tag);
        setHasUpdate(false);
        return;
      }

      storageSet(keys.lastReleaseTag, tag);
      const ack = storageGet(keys.acknowledgedTag) || last;
      const isNewer = compareVersions(tag, ack) > 0;
      setHasUpdate(isNewer);

      if (isNewer && storageGet(keys.notifiedTag) !== tag) {
        const actions: ToastAction[] = [];
        if (rel.htmlUrl) actions.push({ label: 'View Release', href: rel.htmlUrl, onClick: acknowledge });
        if (rel.apk && rel.apk.url) {
          actions.push({
            label: 'Download APK',
            onClick: () => {
              acknowledge();
              startDownloadRef.current(rel.apk ?? undefined);
            },
          });
        }
        showToast(`\u{1F389} ${githubConfig.appName} ${tag} is now available!`, actions);
        storageSet(keys.notifiedTag, tag);
      }
    },
    [acknowledge, showToast],
  );

  const onReleaseLoaded = useCallback(
    (rel: Release) => {
      evaluate(rel);
      announceRelease(rel);

      const version = rel.version;
      void imageForVersion(version).then((img) => {
        if (img) setNewsImage(img);
      });

      if (rel.apk && rel.apk.url) setStatus('');
      else setStatus('APK is not available for this release.', true);
    },
    [evaluate, setStatus],
  );

  const errorMessageFor = (err: unknown): string => {
    const code = err instanceof ApiError ? err.code : undefined;
    if (code && GENERIC_CODES.has(code)) return 'Unable to load the latest release.';
    return (err instanceof Error && err.message) || 'Unable to load the latest release.';
  };

  const fetchRelease = useCallback(
    async (options: { background?: boolean; force?: boolean } = {}): Promise<Release | null> => {
      const background = options.background === true;
      const force = options.force !== false;

      if (inflightRef.current) return inflightRef.current;

      const run = async (): Promise<Release | null> => {
        if (!background) {
          setFetching(true);
          setPhase('preparing');
        }
        try {
          const rel = await getLatestRelease({ force });
          releaseRef.current = rel;
          setRelease(rel);
          setUnavailable(false);
          setPhase('idle');
          hideError();
          onReleaseLoaded(rel);
          return rel;
        } catch (err) {
          const cached = loadCachedRelease();
          if (cached) {
            releaseRef.current = cached;
            setRelease(cached);
            hideError();
            if (!background) onReleaseLoaded(cached);
            const offline = err instanceof ApiError && err.code === 'offline' ? true : isOffline();
            setStatus(
              offline
                ? "You're offline. Showing the last available release."
                : 'Unable to check for new releases. Showing the last available release.',
              true,
            );
            return cached;
          }
          if (!background) {
            setPhase('error');
            setUnavailable(true);
            showError(errorMessageFor(err));
          }
          return null;
        } finally {
          inflightRef.current = null;
          if (!background) {
            setFetching(false);
            if (phaseRef.current === 'preparing') setPhase('idle');
          }
        }
      };

      const promise = run();
      inflightRef.current = promise;
      return promise;
    },
    [hideError, onReleaseLoaded, setPhase, showError],
  );

  const startDownload = useCallback(
    async (asset?: ApkAsset) => {
      if (phaseRef.current === 'preparing' || phaseRef.current === 'downloading') return;

      let rel = releaseRef.current;
      if (!rel) {
        rel = await fetchRelease({ background: false, force: true });
        if (!rel) return;
      }

      const assets = getApkAssets(rel);
      // Priority: the asset that was clicked, the selected variant, the
      // recommended build, the release's own APK, then any APK at all.
      let chosen: ApkAsset | null = null;
      if (asset) chosen = asset;
      else if (selectedName) chosen = assets.find((a) => a.name === selectedName) ?? null;
      if (!chosen) chosen = recommendedOf(assets);
      if (!chosen) chosen = rel.apk;
      if (!chosen) chosen = assets[0] ?? null;

      if (!chosen || !chosen.url) {
        showError('APK is not available for this release.');
        return;
      }

      setPhase('downloading');
      setDownloadProgress(0);
      setDownloadMode(null);
      hideError();

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const result = await downloadAsset(chosen, {
          // A ~30 MB blob in memory is wasted effort on phones and save-data runs.
          stream: tierRef.current !== 'low',
          signal: controller.signal,
          onProgress: (received, total) => {
            setDownloadProgress(total && total > 0 ? Math.min(0.995, received / total) : null);
          },
        });

        setDownloadProgress(1);
        setDownloadMode(result.mode);
        setPhase('done');
        acknowledge();
        showToast(
          result.mode === 'streamed'
            ? `\u2705 ${result.filename} downloaded`
            : `Downloading ${result.filename}...`,
        );
        setTimeout(() => {
          setDownloadProgress(null);
          setPhase('idle');
        }, 2600);
      } catch {
        setDownloadProgress(null);
        setDownloadMode(null);
        if (controller.signal.aborted) {
          // Cancelled by the visitor: no error banner and no fallback download.
          setPhase('idle');
          showToast('Download cancelled');
          return;
        }
        setPhase('error');
        showError('Download failed. Please try again.');
        window.open(chosen.url, '_blank', 'noopener');
      } finally {
        abortRef.current = null;
      }
    },
    [acknowledge, fetchRelease, hideError, selectedName, setPhase, showError, showToast],
  );

  useEffect(() => {
    startDownloadRef.current = startDownload;
  }, [startDownload]);

  const checkAgain = useCallback(() => {
    invalidateNews();
    clearReleaseCache();
    void fetchRelease({ background: true, force: true });
  }, [fetchRelease]);

  const selectVariant = useCallback((name: string) => setSelectedName(name), []);

  const cancelDownload = useCallback(() => {
    if (phaseRef.current !== 'downloading') return;
    abortRef.current?.abort();
  }, []);

  /** Boot + background re-check + news watcher + connectivity listeners. */
  useEffect(() => {
    const cached = loadCachedRelease();
    if (cached) {
      releaseRef.current = cached;
      setRelease(cached);
      onReleaseLoaded(cached);
    }

    if (isOffline()) setStatus("You're offline. Showing the last available release.", true);

    let checkTimer: ReturnType<typeof setInterval> | undefined;
    let newsTimer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      void fetchRelease({ background: true, force: false });
      void checkNewsNow();

      checkTimer = setInterval(() => {
        if (isOffline()) {
          setStatus("You're offline. Showing the last available release.", true);
          return;
        }
        void fetchRelease({ background: true, force: true });
      }, githubConfig.releaseCheckInterval);

      newsTimer = setInterval(() => {
        if (!isOffline()) void checkNewsNow();
      }, discordConfig.newsCheckInterval);
    };

    whenIdle(start, 3000);

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      void fetchRelease({ background: true, force: false });
      void checkNewsNow();
    };
    const onOnline = () => void fetchRelease({ background: true, force: true });
    const onOffline = () => setStatus("You're offline. Showing the last available release.", true);

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      if (checkTimer) clearInterval(checkTimer);
      if (newsTimer) clearInterval(newsTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apkAssets = useMemo(() => (release ? getApkAssets(release) : []), [release]);
  const recommended = useMemo(() => recommendedOf(apkAssets), [apkAssets]);
  const selected = useMemo(() => {
    if (!apkAssets.length) return release?.apk ?? null;
    return (
      (selectedName ? apkAssets.find((a) => a.name === selectedName) : null) ??
      recommended ??
      apkAssets[0] ??
      release?.apk ??
      null
    );
  }, [apkAssets, recommended, release, selectedName]);

  const value: ReleaseContextValue = {
    release,
    synced: !!release,
    unavailable,
    fetching,
    error,
    status,
    hasUpdate,
    toast,
    tier,
    apkAssets,
    selected,
    recommended,
    newsImage,
    downloadPhase,
    downloadProgress,
    downloadMode,
    selectVariant,
    startDownload: (asset?: ApkAsset) => void startDownload(asset),
    cancelDownload,
    showToast,
    hideToast,
    acknowledge,
    checkAgain,
  };

  return <ReleaseContext.Provider value={value}>{children}</ReleaseContext.Provider>;
}

/** APK assets of a release - the builds the picker can offer. */
function getApkAssets(release: Release): ApkAsset[] {
  if (!release || !Array.isArray(release.assets)) return [];
  return release.assets.filter((a) => a && a.url && /\.apk$/i.test(a.name));
}

function recommendedOf(assets: ApkAsset[]): ApkAsset | null {
  return assets.find(isRecommendedAsset) ?? null;
}
