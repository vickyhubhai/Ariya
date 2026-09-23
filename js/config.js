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
