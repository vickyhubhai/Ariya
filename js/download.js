const Download = {
  state: 'idle',
  release: null,

  init() {
    this.btn = document.getElementById('download-btn');
    this.btnMobile = document.getElementById('download-btn-mobile');
    this.errorBanner = document.getElementById('error-banner');
    this.errorText = document.getElementById('error-text');

    this.btn?.addEventListener('click', () => this.startDownload());
    this.btnMobile?.addEventListener('click', () => this.startDownload());

    this.detectOS();
    this.fetchRelease();
  },

  detectOS() {
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const iosBanner = document.getElementById('ios-banner');
    if (isIOS && iosBanner) iosBanner.style.display = 'block';
  },

  async fetchRelease() {
    this.setState('loading');
    try {
      this.release = await GitHub.getLatestRelease();
      this.setState('idle');
      this.populateUI();
    } catch (err) {
      this.setState('error');
      this.showError(err.message);
    }
  },

  populateUI() {
    if (!this.release) return;
    const r = this.release;

    document.querySelectorAll('[data-version]').forEach(el => el.textContent = r.version);
    document.querySelectorAll('[data-date]').forEach(el => el.textContent = GitHub.formatDate(r.publishedAt));
    document.querySelectorAll('[data-size]').forEach(el => el.textContent = GitHub.formatSize(r.apk.size));

    const notesBody = document.getElementById('notes-body');
    if (notesBody && r.body) {
      notesBody.innerHTML = GitHub.renderMarkdown(r.body);
    } else if (notesBody) {
      notesBody.innerHTML = '<em style="color:var(--text3)">No release notes available.</em>';
    }

    const notesLink = document.getElementById('notes-link');
    if (notesLink) notesLink.href = r.htmlUrl;
  },

  async startDownload() {
    if (this.state === 'loading') return;

    if (!this.release) {
      this.setState('loading');
      try {
        this.release = await GitHub.getLatestRelease();
        this.setState('idle');
        this.populateUI();
      } catch (err) {
        this.setState('error');
        this.showError(err.message);
        return;
      }
    }

    if (!this.release?.apk?.url) {
      this.showError('No APK available for download.');
      return;
    }

    this.setState('downloading');
    this.hideError();

    try {
      const link = document.createElement('a');
      link.href = this.release.apk.url;
      link.download = this.release.apk.name || 'Ariya.apk';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.showToast(`Downloading ${this.release.apk.name}...`);
      setTimeout(() => this.setState('idle'), 2000);
    } catch {
      this.setState('error');
      this.showError('Download failed. Please try again.');
      window.open(this.release.apk.url, '_blank');
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

  showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
};
