'use client';

import type { MouseEvent as ReactMouseEvent } from 'react';
import { repoUrls } from '@/lib/config';
import { useRelease } from '@/lib/release-context';
import { CheckIcon, DownloadIcon } from '@/components/icons';

interface DownloadButtonProps {
  id: string;
  /** Idle label; the hero and the release card word it slightly differently. */
  label?: string;
  className?: string;
}

/**
 * The real download control.
 *
 * `Download -> Preparing -> Downloading -> Downloaded`, driven by the store.
 * The percentage is only rendered when the byte stream really reports progress:
 * on low-tier devices (and whenever the CDN refuses CORS) the file is handed to
 * the browser directly and the button honestly stays unquantified.
 */
export default function DownloadButton({ id, label = 'Download Ariya', className = 'btn-primary' }: DownloadButtonProps) {
  const { selected, release, unavailable, startDownload, cancelDownload, downloadPhase, downloadProgress, downloadMode, tier } =
    useRelease();

  const asset = selected ?? release?.apk ?? null;
  const href = asset?.url ?? repoUrls.releases;
  const canDownload = !!asset?.url && !unavailable;
  const busy = downloadPhase === 'preparing' || downloadPhase === 'downloading';
  // Streaming is what makes a download cancellable; a direct hand-off to the
  // browser is already out of our hands.
  const canCancel = downloadPhase === 'downloading' && tier !== 'low';
  // The store reports a 0-1 fraction (null = real progress is unavailable).
  const pct = downloadProgress === null ? null : Math.round(downloadProgress * 100);

  const text = (() => {
    if (downloadPhase === 'preparing') return 'Preparing download\u2026';
    if (downloadPhase === 'downloading') {
      return pct === null ? 'Downloading\u2026' : `Downloading\u2026 ${pct}%`;
    }
    if (downloadPhase === 'done') {
      // A direct hand-off only starts the browser download; we cannot observe
      // when the file lands, so the button must not claim it finished.
      return downloadMode === 'direct' ? 'Download started' : 'Downloaded';
    }
    if (downloadPhase === 'error') return 'Download failed';
    return canDownload ? label : 'APK Unavailable';
  })();

  const stateClass =
    downloadPhase === 'preparing'
      ? 'is-preparing'
      : downloadPhase === 'downloading'
        ? `is-downloading${canCancel ? ' is-cancellable' : ''}`
        : downloadPhase === 'done'
          ? 'is-done'
          : downloadPhase === 'error'
            ? 'is-error'
            : '';

  const onClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    // Without an APK the link degrades to the releases page instead of blocking.
    if (!canDownload) return;
    e.preventDefault();
    if (busy) {
      if (canCancel) cancelDownload();
      return;
    }
    startDownload();
  };

  return (
    <a
      id={id}
      href={href}
      target={canDownload ? undefined : '_blank'}
      rel={canDownload ? undefined : 'noopener'}
      className={[className, stateClass, !canDownload ? 'is-disabled' : ''].filter(Boolean).join(' ')}
      onClick={onClick}
      title={canCancel ? 'Click to cancel the download' : undefined}
      aria-label={canCancel ? 'Cancel download' : undefined}
      aria-disabled={(busy && !canCancel) || undefined}
      data-phase={downloadPhase}
    >
      {downloadPhase === 'done' ? <CheckIcon className="dl-check" /> : <DownloadIcon />}
      <span className="btn-text">{text}</span>
      {busy ? (
        <span className="dl-track" aria-hidden="true">
          <span
            className={`dl-fill${pct === null ? ' indeterminate' : ''}`}
            style={pct === null ? undefined : { width: `${pct}%` }}
          />
        </span>
      ) : null}
    </a>
  );
}
