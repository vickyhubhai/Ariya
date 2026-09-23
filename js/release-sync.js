const ReleaseSync = {
  intervalId: null,
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.bindBadge();
    this.bindReleaseLinks();
    this.bindCheckButton();

    const cached = GitHub.loadCachedRelease();
    if (cached) {
      Download.release = cached;
      Download.populateUI();
      this.onReleaseLoaded(cached);
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.setStatus("You're offline. Showing the last available release.", true);
    }

    Download.fetchRelease();

    this.intervalId = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        this.setStatus("You're offline. Showing the last available release.", true);
        return;
      }
      Download.fetchRelease({ background: true, force: true });
    }, githubConfig.releaseCheckInterval);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        Download.fetchRelease({ background: true, force: false });
      }
    });

    window.addEventListener('online', () => {
      Download.fetchRelease({ background: true, force: true });
    });

    window.addEventListener('offline', () => {
      this.setStatus("You're offline. Showing the last available release.", true);
    });
  },

  onReleaseLoaded(release) {
    if (!release || typeof release.version !== 'string' || !release.version) return;
    this.evaluate(release);
    if (typeof News !== 'undefined') News.applyNewsImage(release.version);
    if (release.apk && release.apk.url) {
      this.setStatus('');
    } else {
      this.setStatus('APK is not available for this release.', true);
    }
  },

  onFetchError(err, hasCachedRelease) {
    if (!hasCachedRelease) return;
    const offline = (err && err.code === 'offline') ||
      (typeof navigator !== 'undefined' && navigator.onLine === false);
    this.setStatus(
      offline
        ? "You're offline. Showing the last available release."
        : 'Unable to check for new releases. Showing the last available release.',
      true
    );
  },

  evaluate(release) {
    const tag = release.version;
    const keys = githubConfig.storageKeys;
    const last = this.storageGet(keys.lastReleaseTag);

    if (!last) {
      this.storageSet(keys.lastReleaseTag, tag);
      this.storageSet(keys.acknowledgedTag, tag);
      this.storageSet(keys.notifiedTag, tag);
      this.setBadge(false);
      return;
    }

    this.storageSet(keys.lastReleaseTag, tag);

    const ack = this.storageGet(keys.acknowledgedTag) || last;
    const isNewer = GitHub.compareVersions(tag, ack) > 0;

    this.setBadge(isNewer);

    if (isNewer && this.storageGet(keys.notifiedTag) !== tag) {
      this.notify(release);
      this.storageSet(keys.notifiedTag, tag);
    }
  },

  notify(release) {
    const actions = [];
    if (release.htmlUrl) {
      actions.push({
        label: 'View Release',
        href: release.htmlUrl,
        onClick: () => this.acknowledge()
      });
    }
    if (release.apk && release.apk.url) {
      actions.push({
        label: 'Download APK',
        onClick: () => {
          this.acknowledge();
          Download.startDownload();
        }
      });
    }
    Download.showToast(
      `\u{1F389} ${githubConfig.appName} ${release.version} is now available!`,
      actions
    );
  },

  acknowledge() {
    const keys = githubConfig.storageKeys;
    const tag = (Download.release && Download.release.version) ||
      this.storageGet(keys.lastReleaseTag);
    if (tag) {
      this.storageSet(keys.acknowledgedTag, tag);
      this.storageSet(keys.notifiedTag, tag);
    }
    this.setBadge(false);
  },

  bindBadge() {
    const badge = document.getElementById('update-badge');
    if (badge) badge.addEventListener('click', () => this.acknowledge());
  },

  bindReleaseLinks() {
    document.querySelectorAll('[data-release-url]').forEach(a => {
      a.addEventListener('click', () => this.acknowledge());
    });
  },

  bindCheckButton() {
    const btn = document.getElementById('status-check-btn');
    if (btn) btn.addEventListener('click', () => Download.checkAgain());
  },

  setBadge(show) {
    const badge = document.getElementById('update-badge');
    if (!badge) return;
    badge.hidden = !show;
  },

  setStatus(message, warn) {
    const el = document.getElementById('release-status');
    if (!el) return;
    const textEl = document.getElementById('release-status-text');
    const btn = document.getElementById('status-check-btn');
    if (!message) {
      if (textEl) textEl.textContent = '';
      if (btn) btn.hidden = true;
      el.hidden = true;
      el.classList.remove('warn');
      return;
    }
    if (textEl) textEl.textContent = message;
    else el.textContent = message;
    if (btn) btn.hidden = !warn;
    el.hidden = false;
    el.classList.toggle('warn', !!warn);
  },

  storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      return;
    }
  }
};
