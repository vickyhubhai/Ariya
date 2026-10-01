import { Debug, githubConfig, repoUrls } from './config';
import { ApiError, type ApkAsset, type Release } from './types';
import { compareVersions, formatSize, isOffline, normalizeVersion, storageGet, storageSet } from './utils';

/** Loose shape of the GitHub release payload we actually read. */
interface ReleaseJson {
  tag_name?: unknown;
  name?: unknown;
  body?: unknown;
  published_at?: unknown;
  created_at?: unknown;
  html_url?: unknown;
  author?: { login?: unknown } | null;
  draft?: unknown;
  prerelease?: unknown;
  assets?: unknown;
}

interface AssetJson {
  name?: unknown;
  size?: unknown;
  browser_download_url?: unknown;
  content_type?: unknown;
}

let cache: Release | null = null;
let cacheTime = 0;
let inflight: Promise<Release> | null = null;

function mapAsset(a: AssetJson | null | undefined): ApkAsset {
  return {
    name: a && typeof a.name === 'string' ? a.name : '',
    size: a && typeof a.size === 'number' ? a.size : 0,
    url: a && typeof a.browser_download_url === 'string' ? a.browser_download_url : '',
    contentType: a && typeof a.content_type === 'string' ? a.content_type : '',
  };
}

/** GETs JSON with a hard timeout plus the same error codes as the static site. */
export async function fetchJSON<T = unknown>(url: string): Promise<T> {
  if (isOffline()) {
    throw new ApiError("You're offline. Check your connection and try again.", 'offline');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), githubConfig.requestTimeout);

  let res: Response;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('Request timed out. Check your connection.', 'timeout');
    }
    throw new ApiError('Unable to reach GitHub. Check your connection.', 'network');
  }
  clearTimeout(timeout);

  if (res.status === 404) throw new ApiError('No releases found for this repository.', 'not_found');
  if (res.status === 429) throw new ApiError('Too many requests. Please wait and try again.', 'rate_limit');
  if (res.status === 403) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    const rateLimited = remaining === '0';
    throw new ApiError(
      rateLimited
        ? 'GitHub API rate limit exceeded. Try again later.'
        : 'GitHub access denied. Please try again later.',
      rateLimited ? 'rate_limit' : 'forbidden',
    );
  }
  if (res.status >= 500) {
    throw new ApiError(`GitHub is temporarily unavailable (HTTP ${res.status}). Please try again later.`, 'server_error');
  }
  if (!res.ok) throw new ApiError(`GitHub API error (${res.status})`, 'http');

  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError('Received an invalid response from GitHub.', 'invalid_json');
  }
}

/** Picks the APK to advertise: prefer one whose name contains the version tag. */
export function findApk(assets: ApkAsset[], version: string): ApkAsset | null {
  if (!Array.isArray(assets) || !assets.length) return null;
  const apks = assets.filter((a) => a && /\.apk$/i.test(a.name) && a.url);
  if (!apks.length) return null;

  const ver = normalizeVersion(version);
  if (ver) {
    const versioned = apks.find((a) => a.name.includes(ver));
    if (versioned) return versioned;
  }
  return apks[0];
}

export function parseRelease(data: ReleaseJson): Release {
  if (!data || typeof data !== 'object' || Array.isArray(data) || typeof data.tag_name !== 'string' || !data.tag_name.trim()) {
    throw new ApiError('Received an invalid response from GitHub.', 'invalid_release');
  }

  const rawAssets: unknown[] = Array.isArray(data.assets) ? data.assets : [];
  const assets = rawAssets.map((a) => mapAsset(a as AssetJson));
  const apkAsset = findApk(assets, data.tag_name);

  const result: Release = {
    version: data.tag_name,
    name: (typeof data.name === 'string' && data.name) || data.tag_name,
    body: typeof data.body === 'string' ? data.body : '',
    publishedAt: String(data.published_at || data.created_at || ''),
    createdAt: String(data.created_at || ''),
    htmlUrl: typeof data.html_url === 'string' ? data.html_url : '',
    author: (data.author && typeof data.author.login === 'string' && data.author.login) || '',
    draft: !!data.draft,
    prerelease: !!data.prerelease,
    assets,
    apk: apkAsset ?? null,
  };

  Debug.log('latest release tag:', result.version);
  Debug.log('release html url:', result.htmlUrl);
  if (result.apk) {
    Debug.log('apk asset:', result.apk.name);
    Debug.log('apk browser_download_url:', result.apk.url);
    Debug.log('apk size:', formatSize(result.apk.size));
  }

  return result;
}

async function fetchLatest(): Promise<Release> {
  Debug.log('release api url:', repoUrls.apiLatest);

  let latest: ReleaseJson | null = null;

  try {
    const data = await fetchJSON<ReleaseJson>(repoUrls.apiLatest);
    if (data && typeof data === 'object' && !Array.isArray(data) && typeof data.tag_name === 'string' && data.tag_name) {
      const isDraft = !!data.draft;
      const isPrerelease = !!data.prerelease;
      const usable = (!isDraft || githubConfig.includeDrafts) && (!isPrerelease || githubConfig.includePrereleases);
      if (usable) latest = data;
    }
  } catch (err) {
    if (err instanceof ApiError && err.code !== 'not_found' && err.code !== 'invalid_json') throw err;
  }

  if (latest) return parseRelease(latest);

  const listUrl = `${repoUrls.apiReleases}?per_page=30`;
  Debug.log('release list fallback url:', listUrl);
  const listData = await fetchJSON<ReleaseJson[]>(listUrl);
  if (!Array.isArray(listData)) throw new ApiError('Received an invalid response from GitHub.', 'invalid_json');

  const candidates = listData.filter(
    (r) =>
      r &&
      typeof r === 'object' &&
      typeof r.tag_name === 'string' &&
      r.tag_name &&
      (!r.draft || githubConfig.includeDrafts) &&
      (!r.prerelease || githubConfig.includePrereleases),
  );

  if (!candidates.length) throw new ApiError('No releases found for this repository.', 'no_releases');

  candidates.sort((a, b) => {
    const byVersion = compareVersions(String(b.tag_name), String(a.tag_name));
    if (byVersion !== 0) return byVersion;
    return String(b.published_at || b.created_at || '').localeCompare(String(a.published_at || a.created_at || ''));
  });

  return parseRelease(candidates[0]);
}

/**
 * Latest release with in-memory TTL, in-flight de-duplication and a
 * localStorage copy, identical to `GitHub.getLatestRelease`.
 * A locally cached newer tag always wins over a stale API answer.
 */
export async function getLatestRelease(options: { force?: boolean } = {}): Promise<Release> {
  const force = options.force === true;
  const now = Date.now();

  if (!force && cache && now - cacheTime < githubConfig.cacheTtl) return cache;
  if (inflight) return inflight;

  inflight = fetchLatest()
    .then((result) => {
      let chosen = result;
      const cached = loadCachedRelease();
      if (cached && compareVersions(cached.version, result.version) > 0) chosen = cached;
      cache = chosen;
      cacheTime = Date.now();
      saveCachedRelease(chosen);
      return chosen;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function loadCachedRelease(): Release | null {
  try {
    const raw = storageGet(githubConfig.storageKeys.releaseCache);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const wrapper = parsed as { release?: unknown };
    const release = (wrapper.release && typeof wrapper.release === 'object' ? wrapper.release : parsed) as Release;
    if (!release || typeof release.version !== 'string' || !release.version) return null;
    return release;
  } catch {
    return null;
  }
}

export function saveCachedRelease(release: Release): void {
  if (!release || typeof release.version !== 'string' || !release.version) return;
  storageSet(githubConfig.storageKeys.releaseCache, JSON.stringify({ release, checkedAt: Date.now() }));
}

/** Forgets the in-memory cache (used by "Check again"). */
export function clearReleaseCache(): void {
  cache = null;
  cacheTime = 0;
}
