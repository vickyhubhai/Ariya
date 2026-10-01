const Download = {
  state: 'idle',
  release: null,
  _fetching: null,
  _toastTimer: null,
  variants: [],
  selected: null,

  init() {
    this.btn = document.getElementById('download-btn');
    this.btnMobile = document.getElementById('download-btn-mobile');
    this.errorBanner = document.getElementById('error-banner');
    this.errorText = document.getElementById('error-text');

    this.btn?.addEventListener('click', () => this.startDownload());
    this.btnMobile?.addEventListener('click', () => this.startDownload());

    const variantsGrid = document.getElementById('variants-grid');
    variantsGrid?.addEventListener('click', e => {
      const card = e.target.closest('.variant-card');
      if (card && card.dataset.name) this.selectVariant(card.dataset.name);
    });

    const changelogLink = document.getElementById('changelog-link');
    if (changelogLink) {
      changelogLink.addEventListener('click', e => {
        e.preventDefault();
        if (typeof ReleaseSync !== 'undefined') ReleaseSync.acknowledge();
        this.viewChangelog();
      });
    }

    this.detectOS();
    GitHub.applyRepoLinks();
    News.applyLinks();
  },

  detectOS() {
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const iosBanner = document.getElementById('ios-banner');
    if (isIOS && iosBanner) iosBanner.style.display = 'block';
  },

  async fetchRelease(options = {}) {
    const background = options.background === true;
    const force = options.force !== false;

    if (this._fetching) return this._fetching;

    const run = (async () => {
      if (!background) this.setState('loading');
      try {
        const release = await GitHub.getLatestRelease({ force });
        this.release = release;
        this.setState('idle');
        this.hideError();
        this.populateUI();
        if (typeof ReleaseSync !== 'undefined') ReleaseSync.onReleaseLoaded(release);
      } catch (err) {
        const cached = GitHub.loadCachedRelease();
        if (cached) {
          this.release = cached;
          this.setState('idle');
          this.hideError();
          this.populateUI();
          if (typeof ReleaseSync !== 'undefined') ReleaseSync.onFetchError(err, true);
        } else if (background) {
          if (typeof ReleaseSync !== 'undefined') ReleaseSync.onFetchError(err, false);
        } else {
          this.setState('error');
          const generic = err && ['network', 'timeout', 'offline', 'server_error', 'invalid_json', 'http'].includes(err.code);
          this.showError(generic ? 'Unable to load the latest release.' : ((err && err.message) || 'Unable to load the latest release.'));
        }
      } finally {
        this._fetching = null;
      }
    })();

    this._fetching = run;
    return run;
  },

  populateUI() {
    if (!this.release) return;
    const r = this.release;

    document.querySelectorAll('[data-version]').forEach(el => { el.textContent = r.version; });
    document.querySelectorAll('[data-date]').forEach(el => { el.textContent = GitHub.formatDate(r.publishedAt); });
    document.querySelectorAll('[data-size]').forEach(el => {
      el.textContent = r.apk && r.apk.size ? GitHub.formatSize(r.apk.size) : 'Unknown';
    });
    document.querySelectorAll('[data-title]').forEach(el => {
      el.textContent = r.name || r.version || '';
    });

    const notesBody = document.getElementById('notes-body');
    if (notesBody) {
      const body = r.body || '';
      const keepChangelog = notesBody.dataset.view === 'changelog' && notesBody.dataset.relver === r.version;
      if (!keepChangelog && (notesBody.dataset.body !== body || notesBody.dataset.view !== 'release')) {
        notesBody.innerHTML = body
          ? GitHub.renderMarkdown(body)
          : '<em style="color:var(--text3)">No release notes available.</em>';
        notesBody.dataset.body = body;
        notesBody.dataset.view = 'release';
        notesBody.dataset.relver = r.version;
      }
    }

    document.querySelectorAll('[data-release-url]').forEach(a => {
      if (r.htmlUrl) a.href = r.htmlUrl;
    });

    this.renderVariants();

    const hasApk = !!(r.apk && r.apk.url);
    if (!hasApk && this.state !== 'loading') {
      [this.btn, this.btnMobile].filter(Boolean).forEach(btn => {
        const text = btn.querySelector('.btn-text');
        if (text) text.textContent = 'APK Unavailable';
      });
    }
  },

  getApkAssets() {
    if (!this.release || !Array.isArray(this.release.assets)) return [];
    return this.release.assets.filter(a => a && typeof a.url === 'string' && a.url && /\.apk$/i.test(a.name));
  },

  variantInfo(name) {
    const n = String(name || '').toLowerCase();
    const flavor = n.includes('foss') ? 'FOSS' : 'GMS';
    const arch = n.includes('arm64') || n.includes('aarch64') ? 'ARM64'
      : n.includes('armv7') || n.includes('armeabi') ? 'ARMv7'
      : n.includes('universal') ? 'Universal' : 'Universal';
    return { flavor, arch };
  },

  variantDesc({ flavor, arch }) {
    const flavorNote = flavor === 'FOSS' ? 'No Google services' : 'With Google services support';
    const archNote = arch === 'Universal' ? 'Works on every Android device'
      : arch === 'ARM64' ? 'Smaller build for most modern phones'
      : arch === 'ARMv7' ? 'For older 32-bit devices' : arch;
    return `${flavorNote} \u00b7 ${archNote}`;
  },

  isRecommended(asset) {
    const { flavor, arch } = this.variantInfo(asset.name);
    return flavor === 'GMS' && arch === 'ARM64';
  },

  downloadTarget() {
    return this.selected || (this.release && this.release.apk) || null;
  },

  renderVariants() {
    const wrap = document.getElementById('apk-variants');
    const grid = document.getElementById('variants-grid');
    if (!wrap || !grid) return;

    const assets = this.getApkAssets();
    if (assets.length < 2) {
      wrap.hidden = true;
      grid.innerHTML = '';
      this.variants = assets;
      this.selected = assets[0] || null;
      return;
    }

    const stillValid = this.selected && assets.find(a => a.name === this.selected.name);
    const recommended = assets.find(a => this.isRecommended(a)) || null;
    this.variants = assets;
    this.selected = stillValid || recommended || assets[0];

    const sub = document.getElementById('variants-sub');
    if (sub && this.release) {
      sub.textContent = '';
      sub.append('All builds are the latest ');
      const v = document.createElement('strong');
      v.textContent = this.release.version;
      sub.append(v, ' release \u2014 same app, different packaging.');
    }

    grid.innerHTML = '';
    assets.forEach(a => {
      const info = this.variantInfo(a.name);
      const isSelected = this.selected && a.name === this.selected.name;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'variant-card' + (isSelected ? ' selected' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      btn.dataset.name = a.name;

      const head = document.createElement('div');
      head.className = 'variant-head';
      const nameEl = document.createElement('span');
      nameEl.className = 'variant-name';
      nameEl.textContent = `${info.flavor} \u00b7 ${info.arch}`;
      const check = document.createElement('span');
      check.className = 'variant-check';
      check.setAttribute('aria-hidden', 'true');
      head.append(nameEl, check);

      const desc = document.createElement('span');
      desc.className = 'variant-desc';
      desc.textContent = this.variantDesc(info);

      const meta = document.createElement('span');
      meta.className = 'variant-meta';
      const size = document.createElement('span');
      size.className = 'variant-size';
      size.textContent = GitHub.formatSize(a.size);
      meta.append(size);
      if (recommended && a.name === recommended.name) {
        const badge = document.createElement('span');
        badge.className = 'variant-badge';
        badge.textContent = 'Recommended';
        meta.append(badge);
      }

      btn.append(head, desc, meta);
      grid.appendChild(btn);
    });
    wrap.hidden = false;
  },

  selectVariant(name) {
    const v = this.variants.find(a => a.name === name);
    if (!v) return;
    this.selected = v;
    document.querySelectorAll('#variants-grid .variant-card').forEach(card => {
      const on = card.dataset.name === name;
      card.classList.toggle('selected', on);
      card.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  },

  async viewChangelog() {
    const notesBody = document.getElementById('notes-body');
    if (!notesBody) return;

    if (!this.release) {
      await this.fetchRelease();
      if (!this.release) {
        notesBody.innerHTML = '<em style="color:var(--text3)">Changelog is not available for this release.</em>';
        return;
      }
    }

    const version = this.release.version;
    notesBody.dataset.body = '';
    notesBody.dataset.view = 'changelog';
    notesBody.dataset.relver = version;
    notesBody.innerHTML = '<em style="color:var(--text3)">Loading changelog...</em>';

    let result;
    try {
      result = await News.resolveChangelog(version, { force: true });
    } catch (err) {
      const notFound = err && (err.code === 'not_found');
      notesBody.innerHTML = notFound
        ? '<em style="color:var(--text3)">Changelog is not available for this release.</em>'
        : '<em style="color:var(--text3)">Unable to load the changelog. Please try again.</em>';
      Debug.log('changelog load failed:', err && err.code);
      return;
    }

    if (result.found && result.markdown) {
      notesBody.innerHTML = GitHub.renderMarkdown(result.markdown);
      Debug.log('changelog loaded for', version, '->', result.url);
    } else {
      notesBody.innerHTML = '<em style="color:var(--text3)">Changelog is not available for this release.</em>';
      Debug.log('no changelog found for', version);
    }
  },

  async checkAgain() {
    News.invalidate();
    await this.fetchRelease({ background: true, force: true });
  },

  async startDownload() {
    if (this.state === 'loading') return;

    if (!this.release) {
      this.setState('loading');
      try {
        this.release = await GitHub.getLatestRelease({ force: true });
        this.setState('idle');
        this.populateUI();
      } catch (err) {
        this.setState('error');
        const generic = err && ['network', 'timeout', 'offline', 'server_error', 'invalid_json', 'http'].includes(err.code);
        this.showError(generic ? 'Unable to load the latest release.' : ((err && err.message) || 'Unable to load the latest release.'));
        return;
      }
    }

    if (!this.release?.apk?.url && !this.downloadTarget()) {
      this.showError('APK is not available for this release.');
      return;
    }

    const target = this.downloadTarget();
    this.setState('downloading');
    this.hideError();

    try {
      const link = document.createElement('a');
      link.href = target.url;
      link.download = target.name || 'Ariya.apk';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (typeof ReleaseSync !== 'undefined') ReleaseSync.acknowledge();
      this.showToast(`Downloading ${target.name}...`);
      setTimeout(() => this.setState('idle'), 2000);
    } catch {
      this.setState('error');
      this.showError('Download failed. Please try again.');
      window.open(target.url, '_blank');
    }
  },

  setState(state) {
    this.state = state;
    const btns = [this.btn, this.btnMobile].filter(Boolean);
    btns.forEach(btn => {
      btn.classList.remove('loading');
      const spinner = btn.querySelector('.spinner');
      const text = btn.querySelector('.btn-text');

      switch (state) {
        case 'loading':
          btn.classList.add('loading');
          if (text) text.textContent = 'Preparing download...';
          if (!spinner) { const s = document.createElement('span'); s.className = 'spinner'; btn.appendChild(s); }
          break;
        case 'downloading':
          if (text) text.textContent = 'Downloading...';
          if (!spinner) { const s = document.createElement('span'); s.className = 'spinner'; btn.appendChild(s); }
          break;
        case 'error':
          if (text) text.textContent = 'Download unavailable';
          if (spinner) spinner.remove();
          break;
        default:
          if (text) text.textContent = 'Download Ariya';
          if (spinner) spinner.remove();
      }
    });
  },

  showError(msg) {
    if (this.errorBanner && this.errorText) {
      this.errorText.textContent = msg;
      this.errorBanner.classList.add('show');
    }
  },

  hideError() {
    this.errorBanner?.classList.remove('show');
  },

  showToast(msg, actions) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    clearTimeout(this._toastTimer);
    toast.textContent = '';

    const msgEl = document.createElement('span');
    msgEl.className = 'toast-msg';
    msgEl.textContent = msg;
    toast.appendChild(msgEl);

    if (actions && actions.length) {
      const wrap = document.createElement('div');
      wrap.className = 'toast-actions';
      actions.forEach(action => {
        let el;
        if (action.href) {
          el = document.createElement('a');
          el.href = action.href;
          el.target = '_blank';
          el.rel = 'noopener';
        } else {
          el = document.createElement('button');
          el.type = 'button';
        }
        el.className = 'toast-btn';
        el.textContent = action.label;
        el.addEventListener('click', () => {
          this.hideToast();
          if (typeof action.onClick === 'function') action.onClick();
        });
        wrap.appendChild(el);
      });
      toast.appendChild(wrap);
    }

    toast.classList.add('show');
    this._toastTimer = setTimeout(
      () => this.hideToast(),
      actions && actions.length ? 10000 : 3000
    );
  },

  hideToast() {
    clearTimeout(this._toastTimer);
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');
  }
};
