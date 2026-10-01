'use client';

import { useRelease } from '@/lib/release-context';
import { formatDate, formatSize } from '@/lib/utils';

interface ValueProps {
  className?: string;
  /** Text shown before the release resolves. */
  fallback?: string;
  /** Show the shimmer skeleton until sync completes. */
  shimmer?: boolean;
}

function stateClass(shimmer: boolean, synced: boolean, unavailable: boolean): string {
  if (synced) return 'pop-in';
  if (shimmer && !unavailable) return 'skel';
  return '';
}

/** `<span data-version>` from the static markup. */
export function Version({ className = '', fallback = 'v1.1.0', shimmer = false }: ValueProps) {
  const { release, synced, unavailable } = useRelease();
  const text = release?.version ?? (unavailable ? 'Unavailable' : shimmer ? 'loading...' : fallback);
  return <span className={[stateClass(shimmer, synced, unavailable), className].filter(Boolean).join(' ')}>{text}</span>;
}

/** `<span data-size>` - APK download size. */
export function Size({ className = '', fallback = '~28 MB', shimmer = false }: ValueProps) {
  const { release, synced, unavailable } = useRelease();
  const text =
    release
      ? release.apk && release.apk.size
        ? formatSize(release.apk.size)
        : 'Unknown'
      : unavailable
        ? 'Unavailable'
        : shimmer
          ? 'loading...'
          : fallback;
  return <span className={[stateClass(shimmer, synced, unavailable), className].filter(Boolean).join(' ')}>{text}</span>;
}

/** `<span data-date>` - human readable release date. */
export function ReleaseDate({ className = '', shimmer = true }: ValueProps) {
  const { release, synced, unavailable } = useRelease();
  const text = release
    ? formatDate(release.publishedAt)
    : unavailable
      ? 'Unavailable'
      : 'loading...';
  return <span className={[stateClass(shimmer, synced, unavailable), className].filter(Boolean).join(' ')}>{text}</span>;
}

/** `<div data-title>` - the GitHub release name. */
export function ReleaseTitle({ className = '' }: ValueProps) {
  const { release } = useRelease();
  if (!release) return null;
  return <div className={className}>{release.name || release.version || ''}</div>;
}
