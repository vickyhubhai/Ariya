const githubConfig = {
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
    notifiedTag: 'ariya_notified_release_tag_v1'
  },

  get repoUrl() {
    return `https://github.com/${this.owner}/${this.repository}`;
  },
  get releasesUrl() {
    return `${this.repoUrl}/releases`;
  },
  get licenseUrl() {
    return `${this.repoUrl}/blob/main/LICENSE`;
  },
  get apiLatestReleaseUrl() {
    return `https://api.github.com/repos/${this.owner}/${this.repository}/releases/latest`;
  },
  get apiReleasesUrl() {
    return `https://api.github.com/repos/${this.owner}/${this.repository}/releases`;
  }
};

const newsConfig = {
  owner: 'vickyhubhai',
  repository: 'Ariya_news',
  branch: 'neww',

  cacheTtl: 5 * 60 * 1000,

  get rawBaseUrl() {
    return `https://raw.githubusercontent.com/${this.owner}/${this.repository}/${this.branch}`;
  },
  get repoUrl() {
    return `https://github.com/${this.owner}/${this.repository}`;
  },
  get metadataUrl() {
    return `${this.rawBaseUrl}/metadata.json`;
  },
  get contentBrowseUrl() {
    return `https://github.com/${this.owner}/${this.repository}/tree/${this.branch}/content`;
  },
  contentUrl(id) {
    return `${this.rawBaseUrl}/content/${String(id).replace(/^\/+/, '')}`;
  }
};

const discordConfig = {
  supportUrl: 'https://discord.gg/CxMV79wrMP',
  updatesWebhook: 'https://discord.com/api/webhooks/1552604999308025866/qH_HHjO2r1XRGBLxnixJ1qJQ7pHVe1qQcgCPQT36zpAlwp7EcUZI0yGAAk-iHqThLplh',
  bugWebhook: 'https://discord.com/api/webhooks/1552605324731482132/FO-oXFmM1M-rXKCHuDwoHjOJBfTiO12As2c9U-EcRWHl_K-kcsK0SmL4fQcDN-quq5c9',
  avatarUrl: 'https://ariyamusic.us.ci/assets/icon-512.png',
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
    bugCooldown: 'ariya_disc_bug_cooldown_v1'
  }
};

const Debug = (() => {
  let enabled;
  if (typeof githubConfig.debug === 'boolean') {
    enabled = githubConfig.debug;
  } else if (typeof location !== 'undefined') {
    enabled =
      location.protocol === 'file:' ||
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1' ||
      location.hostname === '[::1]' ||
      /[?&]debug=1(?:&|$)/.test(location.search);
  } else {
    enabled = false;
  }

  return {
    get enabled() { return enabled; },
    log(...args) {
      if (enabled && typeof console !== 'undefined') console.log('[Ariya]', ...args);
    }
  };
})();
