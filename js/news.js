const News = {
  metadata: null,
  metadataTime: 0,
  metadataInflight: null,
  changelogCache: new Map(),

  get CACHE_TTL() {
    return newsConfig.cacheTtl;
  },

  applyLinks() {
    document.querySelectorAll('[data-news-content-link]').forEach(a => {
      a.href = newsConfig.contentBrowseUrl;
    });
  },

  async getMetadata(options = {}) {
    const force = options.force === true;
    const now = Date.now();

    if (!force && this.metadata && now - this.metadataTime < this.CACHE_TTL) {
      return this.metadata;
    }
    if (this.metadataInflight) {
      return this.metadataInflight;
    }

    Debug.log('news metadata url:', newsConfig.metadataUrl);

    this.metadataInflight = fetch(newsConfig.metadataUrl, { cache: 'no-store' })
      .then(async res => {
        if (res.status === 404) {
          const e = new Error('News metadata is not available.');
          e.code = 'not_found';
          throw e;
        }
        if (res.status === 403 || res.status === 429) {
          const e = new Error('News is temporarily unavailable. Please try again later.');
          e.code = 'rate_limit';
          throw e;
        }
        if (res.status >= 500) {
          const e = new Error(`News is temporarily unavailable (HTTP ${res.status}).`);
          e.code = 'server_error';
          throw e;
        }
        if (!res.ok) {
          const e = new Error(`Unable to load news metadata (HTTP ${res.status}).`);
          e.code = 'http';
          throw e;
        }
        let data;
        try {
          data = await res.json();
        } catch {
          const e = new Error('Received invalid news metadata.');
          e.code = 'invalid_json';
          throw e;
        }
        const items = this.normalizeMetadata(data);
        if (!items) {
          const e = new Error('Received invalid news metadata.');
          e.code = 'invalid_json';
          throw e;
        }
        this.metadata = items;
        this.metadataTime = Date.now();
        Debug.log('news items loaded:', items.length);
        return items;
      })
      .catch(err => {
        if (err && err.code) throw err;
        const e = new Error('Unable to load news. Check your connection and try again.');
        e.code = 'network';
        throw e;
      })
      .finally(() => {
        this.metadataInflight = null;
      });

    return this.metadataInflight;
  },

  normalizeMetadata(data) {
    let list = null;
    if (Array.isArray(data)) {
      list = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.items)) list = data.items;
      else if (typeof data.id === 'string' && data.id) list = [data];
      else list = Object.values(data).filter(v => v && typeof v === 'object');
    }
    if (!list) return null;
    return list.filter(it => it && typeof it === 'object' && typeof it.id === 'string' && it.id);
  },

  versionFromId(id) {
    if (typeof id !== 'string' || !id) return '';
    const s = id.trim().toLowerCase();
    const m = s.match(/\d+(?:[.-]\d+)*/);
    return m ? m[0].replace(/[.-]/g, '.') : '';
  },

  findItemForVersion(items, version) {
    if (!Array.isArray(items) || !items.length) return null;
    let best = null;
    let bestSegments = -1;
    for (const item of items) {
      const idVersion = this.versionFromId(item.id);
      if (!idVersion) continue;
      if (GitHub.compareVersions(idVersion, version) !== 0) continue;
      const segments = idVersion.split('.').length;
      if (segments > bestSegments) {
        best = item;
        bestSegments = segments;
      }
    }
    return best;
  },

  async resolveChangelog(version, options = {}) {
    const force = options.force === true;
    const cacheKey = `${force ? 'f' : 'c'}:${version}`;
    if (!force && this.changelogCache.has(cacheKey)) {
      return this.changelogCache.get(cacheKey);
    }

    const items = await this.getMetadata({ force });
    const item = this.findItemForVersion(items, version);
    if (!item) {
      const result = { found: false, item: null, url: '', markdown: '' };
      this.changelogCache.set(cacheKey, result);
      return result;
    }

    const url = newsConfig.contentUrl(item.id);
    Debug.log('resolved changelog url:', url);

    let res;
    try {
      res = await fetch(url, { cache: 'no-store' });
    } catch {
      const e = new Error('Unable to load the changelog. Check your connection and try again.');
      e.code = 'network';
      throw e;
    }

    if (res.status === 404) {
      const result = { found: false, item, url, markdown: '' };
      this.changelogCache.set(cacheKey, result);
      return result;
    }
    if (res.status >= 500) {
      const e = new Error(`Changelog is temporarily unavailable (HTTP ${res.status}).`);
      e.code = 'server_error';
      throw e;
    }
    if (!res.ok) {
      const e = new Error(`Unable to load the changelog (HTTP ${res.status}).`);
      e.code = 'http';
      throw e;
    }

    let markdown;
    try {
      markdown = await res.text();
    } catch {
      const e = new Error('Unable to load the changelog.');
      e.code = 'invalid_json';
      throw e;
    }
    if (typeof markdown !== 'string' || !markdown.trim()) {
      const result = { found: false, item, url, markdown: '' };
      this.changelogCache.set(cacheKey, result);
      return result;
    }

    const result = { found: true, item, url, markdown };
    this.changelogCache.set(cacheKey, result);
    return result;
  },

  invalidate() {
    this.metadata = null;
    this.metadataTime = 0;
    this.changelogCache.clear();
  },

  async applyNewsImage(version) {
    const img = document.getElementById('news-image');
    if (!img || !version) return;

    let src = '';
    try {
      const items = await this.getMetadata({ force: false });
      const item = this.findItemForVersion(items, version);
      if (item) {
        let raw = item.ImageURL;
        if (typeof raw === 'string') raw = [raw];
        if (Array.isArray(raw) && raw.length) {
          src = GitHub.safeUrl(raw[0], ['https:', 'http:']) || '';
        }
      }
    } catch {
      src = '';
    }

    if (!src) {
      img.hidden = true;
      img.removeAttribute('src');
      return;
    }

    if (img.getAttribute('src') === src) {
      if (img.complete && img.naturalWidth > 0) img.hidden = false;
      return;
    }

    Debug.log('news image url:', src);
    img.hidden = true;
    img.onload = () => { img.hidden = false; };
    img.onerror = () => { img.hidden = true; img.removeAttribute('src'); };
    img.src = src;
  }
};
