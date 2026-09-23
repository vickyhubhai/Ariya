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
