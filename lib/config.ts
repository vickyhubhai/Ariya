/**
 * Site + integration configuration.
 *
 * Ported from the static site's `js/config.js`. Every value is unchanged so
 * the Next.js build talks to the exact same GitHub repository, the same
 * changelog (`Ariya_news`) content source and the same Discord webhooks.
 *
 * The old file used getters on a global object; here they are plain derived
 * helpers so the module is importable from both server and client components.
 */

export const siteConfig = {
  name: 'Ariya',
  title: 'Ariya - Free Android Music Player with Lyrics & FLAC',
  description:
    'Download Ariya, a free open-source Android music player with synced lyrics, FLAC lossless audio, playlists, queue controls, and music discovery. Android 8.0+.',
  url: 'https://ariyamusic.us.ci',
  locale: 'en_US',
  themeColor: '#7c5cfc',
  author: 'Vicky',
  logo: '/assets/icon-512.png',
  googleSiteVerification: 'A0MBim06UR5d2XxNNIYDtlCQQVUTa5zhuB6wD-JacaQ',
  googleAdsense: {
    client: 'ca-pub-3517753255172590',
    slot: '5061982269',
  },
  monetag: {
    meta: '2853482bb09b38b61d12eb1928e482f6',
    zone: '285973',
    src: 'https://quge5.com/88/tag.min.js',
  },
} as const;

export const githubConfig = {
  appName: 'Ariya',
  owner: 'vickyhubhai',
  repository: 'Ariya',

  releaseCheckInterval: 5 * 60 * 1000,
  minRefreshGap: 60 * 1000,
  requestTimeout: 10000,
  cacheTtl: 5 * 60 * 1000,

  includeDrafts: false,
  includePrereleases: false,

  storageKeys: {
    releaseCache: 'ariya_release_cache_v1',
    lastReleaseTag: 'ariya_last_release_tag_v1',
    acknowledgedTag: 'ariya_acknowledged_release_tag_v1',
    notifiedTag: 'ariya_notified_release_tag_v1',
  },
} as const;

export const repoUrls = {
  repo: `https://github.com/${githubConfig.owner}/${githubConfig.repository}`,
  releases: `https://github.com/${githubConfig.owner}/${githubConfig.repository}/releases`,
  license: `https://github.com/${githubConfig.owner}/${githubConfig.repository}/blob/main/LICENSE`,
  latest: `https://github.com/${githubConfig.owner}/${githubConfig.repository}/releases/latest`,
  apiLatest: `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repository}/releases/latest`,
  apiReleases: `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repository}/releases`,
} as const;

export const newsConfig = {
  owner: 'vickyhubhai',
  repository: 'Ariya_news',
  branch: 'neww',
  cacheTtl: 5 * 60 * 1000,

  get rawBaseUrl(): string {
    return `https://raw.githubusercontent.com/${this.owner}/${this.repository}/${this.branch}`;
  },
  get repoUrl(): string {
    return `https://github.com/${this.owner}/${this.repository}`;
  },
  get metadataUrl(): string {
    return `${this.rawBaseUrl}/metadata.json`;
  },
  get contentBrowseUrl(): string {
    return `https://github.com/${this.owner}/${this.repository}/tree/${this.branch}/content`;
  },
  contentUrl(id: string): string {
    return `${this.rawBaseUrl}/content/${String(id).replace(/^\/+/, '')}`;
  },
};

export const discordConfig = {
  supportUrl: 'https://discord.gg/CxMV79wrMP',
  inviteSlug: 'discord.gg/CxMV79wrMP',
  updatesWebhook:
    'https://discord.com/api/webhooks/1552604999308025866/qH_HHjO2r1XRGBLxnixJ1qJQ7pHVe1qQcgCPQT36zpAlwp7EcUZI0yGAAk-iHqThLplh',
  bugWebhook:
    'https://discord.com/api/webhooks/1552605324731482132/FO-oXFmM1M-rXKCHuDwoHjOJBfTiO12As2c9U-EcRWHl_K-kcsK0SmL4fQcDN-quq5c9',
  updatesUsername: 'Ariya Updates',
  bugUsername: 'Ariya Reports',
  newsCheckInterval: 5 * 60 * 1000,
  announceIfPublishedWithinDays: 7,
  bugCooldownMs: 30 * 1000,
  bugMinLength: 10,
  bugMaxLength: 1000,
  storageKeys: {
    announcedRelease: 'ariya_disc_announced_release_v1',
    announcedNews: 'ariya_disc_announced_news_v1',
    bugCooldown: 'ariya_disc_bug_cooldown_v1',
  },
} as const;

/**
 * Debug logging, on by default only for local/file origins or `?debug=1`,
 * exactly like the original `Debug` helper.
 */
function detectDebug(): boolean {
  if (typeof window === 'undefined') return false;
  const { protocol, hostname, search } = window.location;
  return (
    protocol === 'file:' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    /[?&]debug=1(?:&|$)/.test(search)
  );
}

let debugEnabled: boolean | null = null;

export const Debug = {
  get enabled(): boolean {
    if (debugEnabled === null) debugEnabled = detectDebug();
    return debugEnabled;
  },
  log(...args: unknown[]): void {
    if (this.enabled) console.log('[Ariya]', ...args);
  },
};
