const GitHub = {
  cache: null,
  cacheTime: 0,
  inflight: null,

  get API_URL() {
    return githubConfig.apiLatestReleaseUrl;
  },

  get CACHE_TTL() {
    return githubConfig.cacheTtl;
  },

  async getLatestRelease(options = {}) {
    const force = options.force === true;
    const now = Date.now();

    if (!force && this.cache && now - this.cacheTime < this.CACHE_TTL) {
      return this.cache;
    }
    if (this.inflight) {
      return this.inflight;
    }

    this.inflight = this._fetchLatest()
      .then(result => {
        let chosen = result;
        const cached = this.loadCachedRelease();
        if (cached && this.compareVersions(cached.version, result.version) > 0) {
          chosen = cached;
        }
        this.cache = chosen;
        this.cacheTime = Date.now();
        this.saveCachedRelease(chosen);
        return chosen;
      })
      .finally(() => {
        this.inflight = null;
      });

    return this.inflight;
  },

  async _fetchLatest() {
    let latest = null;
    Debug.log('release api url:', githubConfig.apiLatestReleaseUrl);

    try {
      const data = await this.fetchJSON(githubConfig.apiLatestReleaseUrl);
      if (data && typeof data === 'object' && !Array.isArray(data) && typeof data.tag_name === 'string' && data.tag_name) {
        const isDraft = !!data.draft;
        const isPrerelease = !!data.prerelease;
        const usable = (!isDraft || githubConfig.includeDrafts) && (!isPrerelease || githubConfig.includePrereleases);
        if (usable) latest = data;
      }
    } catch (err) {
      if (err.code !== 'not_found' && err.code !== 'invalid_json') throw err;
    }

    if (latest) return this.parseRelease(latest);

    const listUrl = `${githubConfig.apiReleasesUrl}?per_page=30`;
    Debug.log('release list fallback url:', listUrl);
    const listData = await this.fetchJSON(listUrl);
    if (!Array.isArray(listData)) {
      const e = new Error('Received an invalid response from GitHub.');
      e.code = 'invalid_json';
      throw e;
    }

    const candidates = listData.filter(r =>
      r &&
      typeof r === 'object' &&
      typeof r.tag_name === 'string' &&
      r.tag_name &&
      (!r.draft || githubConfig.includeDrafts) &&
      (!r.prerelease || githubConfig.includePrereleases)
    );

    if (!candidates.length) {
      const e = new Error('No releases found for this repository.');
      e.code = 'no_releases';
      throw e;
    }

    candidates.sort((a, b) => {
      const byVersion = this.compareVersions(b.tag_name, a.tag_name);
      if (byVersion !== 0) return byVersion;
      return String(b.published_at || b.created_at || '').localeCompare(String(a.published_at || a.created_at || ''));
    });

    return this.parseRelease(candidates[0]);
  },

  async fetchJSON(url) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const e = new Error("You're offline. Check your connection and try again.");
      e.code = 'offline';
      throw e;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), githubConfig.requestTimeout);

    let res;
    try {
      res = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store',
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        const e = new Error('Request timed out. Check your connection.');
        e.code = 'timeout';
        throw e;
      }
      const e = new Error('Unable to reach GitHub. Check your connection.');
      e.code = 'network';
      throw e;
    }
    clearTimeout(timeout);

    if (res.status === 404) {
      const e = new Error('No releases found for this repository.');
      e.code = 'not_found';
      throw e;
    }
    if (res.status === 429) {
      const e = new Error('Too many requests. Please wait and try again.');
      e.code = 'rate_limit';
      throw e;
    }
    if (res.status === 403) {
      const remaining = res.headers.get('x-ratelimit-remaining');
      const rateLimited = remaining === '0';
      const e = new Error(rateLimited
        ? 'GitHub API rate limit exceeded. Try again later.'
        : 'GitHub access denied. Please try again later.');
      e.code = rateLimited ? 'rate_limit' : 'forbidden';
      throw e;
    }
    if (res.status >= 500) {
      const e = new Error(`GitHub is temporarily unavailable (HTTP ${res.status}). Please try again later.`);
      e.code = 'server_error';
      throw e;
    }
    if (!res.ok) {
      const e = new Error(`GitHub API error (${res.status})`);
      e.code = 'http';
      throw e;
    }

    try {
      return await res.json();
    } catch {
      const e = new Error('Received an invalid response from GitHub.');
      e.code = 'invalid_json';
      throw e;
    }
  },

  parseRelease(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data) ||
        typeof data.tag_name !== 'string' || !data.tag_name.trim()) {
      const e = new Error('Received an invalid response from GitHub.');
      e.code = 'invalid_release';
      throw e;
    }

    const assets = Array.isArray(data.assets) ? data.assets : [];
    const apkAsset = this.findApk(assets, data.tag_name);
    const mapAsset = a => ({
      name: a && typeof a.name === 'string' ? a.name : '',
      size: a && typeof a.size === 'number' ? a.size : 0,
      url: a && typeof a.browser_download_url === 'string' ? a.browser_download_url : '',
      contentType: a && typeof a.content_type === 'string' ? a.content_type : ''
    });

    const result = {
      version: data.tag_name,
      name: (typeof data.name === 'string' && data.name) || data.tag_name,
      body: typeof data.body === 'string' ? data.body : '',
      publishedAt: data.published_at || data.created_at || '',
      createdAt: data.created_at || '',
      htmlUrl: typeof data.html_url === 'string' ? data.html_url : '',
      author: (data.author && data.author.login) || '',
      draft: !!data.draft,
      prerelease: !!data.prerelease,
      assets: assets.map(mapAsset),
      apk: apkAsset ? mapAsset(apkAsset) : null
    };

    Debug.log('latest release tag:', result.version);
    Debug.log('release html url:', result.htmlUrl);
    if (result.apk) {
      Debug.log('apk asset:', result.apk.name);
      Debug.log('apk browser_download_url:', result.apk.url);
    }

    return result;
  },

  findApk(assets, version) {
    if (!Array.isArray(assets) || !assets.length) return null;
    const apks = assets.filter(a =>
      a &&
      typeof a.name === 'string' &&
      /\.apk$/i.test(a.name) &&
      typeof a.browser_download_url === 'string' &&
      a.browser_download_url
    );
    if (!apks.length) return null;

    const ver = this.normalizeVersion(version);
    if (ver) {
      const versioned = apks.find(a => a.name.includes(ver));
      if (versioned) return versioned;
    }
    return apks[0];
  },

  normalizeVersion(v) {
    return String(v == null ? '' : v).trim().replace(/^v/i, '');
  },

  parseVersion(v) {
    let s = this.normalizeVersion(v);
    const plus = s.indexOf('+');
    if (plus !== -1) s = s.slice(0, plus);
    let prerelease = '';
    const dash = s.indexOf('-');
    if (dash !== -1) {
      prerelease = s.slice(dash + 1);
      s = s.slice(0, dash);
    }
    const nums = s.split('.').map(part => {
      const n = parseInt(part, 10);
      return Number.isFinite(n) ? n : 0;
    });
    return { nums, prerelease };
  },

  comparePrerelease(a, b) {
    const pa = a.split('.');
    const pb = b.split('.');
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      if (pa[i] === undefined) return -1;
      if (pb[i] === undefined) return 1;
      if (pa[i] === pb[i]) continue;
      const na = /^\d+$/.test(pa[i]);
      const nb = /^\d+$/.test(pb[i]);
      if (na && nb) return parseInt(pa[i], 10) < parseInt(pb[i], 10) ? -1 : 1;
      if (na && !nb) return -1;
      if (!na && nb) return 1;
      return pa[i] < pb[i] ? -1 : 1;
    }
    return 0;
  },

  compareVersions(a, b) {
    const sa = this.normalizeVersion(a);
    const sb = this.normalizeVersion(b);
    if (sa === sb) return 0;

    const va = this.parseVersion(a);
    const vb = this.parseVersion(b);
    const len = Math.max(va.nums.length, vb.nums.length);
    for (let i = 0; i < len; i++) {
      const x = va.nums[i] || 0;
      const y = vb.nums[i] || 0;
      if (x !== y) return x < y ? -1 : 1;
    }

    if (va.prerelease === vb.prerelease) return 0;
    if (!va.prerelease) return 1;
    if (!vb.prerelease) return -1;
    return this.comparePrerelease(va.prerelease, vb.prerelease);
  },

  loadCachedRelease() {
    try {
      const raw = localStorage.getItem(githubConfig.storageKeys.releaseCache);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      const release = parsed.release && typeof parsed.release === 'object' ? parsed.release : parsed;
      if (!release || typeof release.version !== 'string' || !release.version) return null;
      return release;
    } catch {
      return null;
    }
  },

  saveCachedRelease(release) {
    if (!release || typeof release.version !== 'string' || !release.version) return;
    try {
      localStorage.setItem(
        githubConfig.storageKeys.releaseCache,
        JSON.stringify({ release, checkedAt: Date.now() })
      );
    } catch {
      return;
    }
  },

  applyRepoLinks() {
    document.querySelectorAll('[data-repo-link]').forEach(a => { a.href = githubConfig.repoUrl; });
    document.querySelectorAll('[data-repo-releases-link]').forEach(a => { a.href = githubConfig.releasesUrl; });
    document.querySelectorAll('[data-repo-license-link]').forEach(a => { a.href = githubConfig.licenseUrl; });
  },

  formatSize(bytes) {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `~${mb.toFixed(1)} MB`;
  },

  formatDate(iso) {
    if (!iso) return 'Unknown';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Unknown';
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  },

  safeUrl(url, schemes) {
    const u = String(url == null ? '' : url).trim();
    if (!u) return null;
    if (/[\u0000-\u001f]/.test(u)) return null;
    for (const scheme of schemes) {
      if (scheme === '#') {
        if (u.startsWith('#')) return u;
      } else if (u.toLowerCase().startsWith(scheme)) {
        return u;
      }
    }
    return null;
  },

  renderMarkdown(text) {
    if (!text) return '';
    let out = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    out = out
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => {
        const safe = this.safeUrl(url, ['https:', 'http:']);
        if (!safe) return alt || '';
        return `<img src="${safe}" alt="${alt}" loading="lazy" style="max-width:100%;border-radius:12px;margin:12px 0" onerror="this.style.display='none'">`;
      })
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
        const safe = this.safeUrl(url, ['https:', 'http:', 'mailto:', '#']);
        if (!safe) return label;
        return `<a href="${safe}" target="_blank" rel="noopener">${label}</a>`;
      })
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^### (.+)$/gm, '<strong>$1</strong>')
      .replace(/^## (.+)$/gm, '<strong>$1</strong>')
      .replace(/^# (.+)$/gm, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '  \u2022 $1')
      .replace(/\n/g, '<br>');

    return out;
  }
};
