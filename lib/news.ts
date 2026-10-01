import { Debug, newsConfig } from './config';
import { ApiError, type ChangelogResult, type NewsItem } from './types';
import { compareVersions, safeUrl } from './utils';

let metadata: NewsItem[] | null = null;
let metadataTime = 0;
let metadataInflight: Promise<NewsItem[]> | null = null;
const changelogCache = new Map<string, ChangelogResult>();

function normalizeMetadata(data: unknown): NewsItem[] | null {
  let list: unknown[] | null = null;

  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === 'object') {
    const obj = data as { items?: unknown; id?: unknown };
    if (Array.isArray(obj.items)) list = obj.items;
    else if (typeof obj.id === 'string' && obj.id) list = [data];
    else list = Object.values(data).filter((v) => v && typeof v === 'object');
  }

  if (!list) return null;
  return list.filter(
    (it): it is NewsItem => !!it && typeof it === 'object' && typeof (it as NewsItem).id === 'string' && !!(it as NewsItem).id,
  );
}

/**
 * News metadata from the `Ariya_news` repository (`metadata.json` on the
 * configured branch), TTL-cached and de-duplicated like `News.getMetadata`.
 */
export async function getMetadata(options: { force?: boolean } = {}): Promise<NewsItem[]> {
  const force = options.force === true;
  const now = Date.now();

  if (!force && metadata && now - metadataTime < newsConfig.cacheTtl) return metadata;
  if (metadataInflight) return metadataInflight;

  Debug.log('news metadata url:', newsConfig.metadataUrl);

  metadataInflight = fetch(newsConfig.metadataUrl, { cache: 'no-store' })
    .then(async (res) => {
      if (res.status === 404) throw new ApiError('News metadata is not available.', 'not_found');
      if (res.status === 403 || res.status === 429) {
        throw new ApiError('News is temporarily unavailable. Please try again later.', 'rate_limit');
      }
      if (res.status >= 500) throw new ApiError(`News is temporarily unavailable (HTTP ${res.status}).`, 'server_error');
      if (!res.ok) throw new ApiError(`Unable to load news metadata (HTTP ${res.status}).`, 'http');

      let data: unknown;
      try {
        data = await res.json();
      } catch {
        throw new ApiError('Received invalid news metadata.', 'invalid_json');
      }

      const items = normalizeMetadata(data);
      if (!items) throw new ApiError('Received invalid news metadata.', 'invalid_json');

      metadata = items;
      metadataTime = Date.now();
      Debug.log('news items loaded:', items.length);
      return items;
    })
    .catch((err: unknown) => {
      if (err instanceof ApiError && err.code) throw err;
      throw new ApiError('Unable to load news. Check your connection and try again.', 'network');
    })
    .finally(() => {
      metadataInflight = null;
    });

  return metadataInflight;
}

export function versionFromId(id: string): string {
  if (typeof id !== 'string' || !id) return '';
  const s = id.trim().toLowerCase();
  const m = s.match(/\d+(?:[.-]\d+)*/);
  return m ? m[0].replace(/[.-]/g, '.') : '';
}

/** Best changelog item for a version: equal version, most complete id wins. */
export function findItemForVersion(items: NewsItem[], version: string): NewsItem | null {
  if (!Array.isArray(items) || !items.length) return null;
  let best: NewsItem | null = null;
  let bestSegments = -1;

  for (const item of items) {
    const idVersion = versionFromId(item.id);
    if (!idVersion) continue;
    if (compareVersions(idVersion, version) !== 0) continue;
    const segments = idVersion.split('.').length;
    if (segments > bestSegments) {
      best = item;
      bestSegments = segments;
    }
  }

  return best;
}

/** Resolves the markdown changelog file for a release version. */
export async function resolveChangelog(version: string, options: { force?: boolean } = {}): Promise<ChangelogResult> {
  const force = options.force === true;
  const cacheKey = `${force ? 'f' : 'c'}:${version}`;
  if (!force && changelogCache.has(cacheKey)) {
    return changelogCache.get(cacheKey) as ChangelogResult;
  }

  const items = await getMetadata({ force });
  const item = findItemForVersion(items, version);

  if (!item) {
    const result: ChangelogResult = { found: false, item: null, url: '', markdown: '' };
    changelogCache.set(cacheKey, result);
    return result;
  }

  const url = newsConfig.contentUrl(item.id);
  Debug.log('resolved changelog url:', url);

  let res: Response;
  try {
    res = await fetch(url, { cache: 'no-store' });
  } catch {
    throw new ApiError('Unable to load the changelog. Check your connection and try again.', 'network');
  }

  if (res.status === 404) {
    const result: ChangelogResult = { found: false, item, url, markdown: '' };
    changelogCache.set(cacheKey, result);
    return result;
  }
  if (res.status >= 500) throw new ApiError(`Changelog is temporarily unavailable (HTTP ${res.status}).`, 'server_error');
  if (!res.ok) throw new ApiError(`Unable to load the changelog (HTTP ${res.status}).`, 'http');

  let markdown: string;
  try {
    markdown = await res.text();
  } catch {
    throw new ApiError('Unable to load the changelog.', 'invalid_json');
  }

  if (typeof markdown !== 'string' || !markdown.trim()) {
    const result: ChangelogResult = { found: false, item, url, markdown: '' };
    changelogCache.set(cacheKey, result);
    return result;
  }

  const result: ChangelogResult = { found: true, item, url, markdown };
  changelogCache.set(cacheKey, result);
  return result;
}

export function invalidateNews(): void {
  metadata = null;
  metadataTime = 0;
  changelogCache.clear();
}

/**
 * Release artwork for the What's New card, from the matching news item.
 * The static site pushed this into `#news-image`; here it is returned as data
 * so the component can render it (and stay hidden when there is none).
 */
export async function imageForVersion(version: string): Promise<{ src: string; alt: string } | null> {
  if (!version) return null;
  try {
    const items = await getMetadata({ force: false });
    const item = findItemForVersion(items, version);
    if (!item) return null;

    let raw: unknown = item.ImageURL;
    if (typeof raw === 'string') raw = [raw];
    if (!Array.isArray(raw) || !raw.length) return null;

    const src = safeUrl(raw[0], ['https:', 'http:']);
    if (!src) return null;

    const title = item.Title || item.title;
    return { src, alt: title ? String(title) : 'Ariya release image' };
  } catch {
    return null;
  }
}
