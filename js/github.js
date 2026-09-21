const GitHub = {
  API_URL: 'https://api.github.com/repos/vickyhubhai/Ariya/releases/latest',
  cache: null,
  cacheTime: 0,
  CACHE_TTL: 5 * 60 * 1000,

  async getLatestRelease() {
    if (this.cache && Date.now() - this.cacheTime < this.CACHE_TTL) {
      return this.cache;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(this.API_URL, {
        signal: controller.signal,
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      clearTimeout(timeout);

      if (res.status === 403) throw new Error('GitHub API rate limit exceeded. Try again later.');
      if (res.status === 404) throw new Error('No releases found for this repository.');
      if (res.status === 429) throw new Error('Too many requests. Please wait and try again.');
      if (!res.ok) throw new Error(`GitHub API error (${res.status})`);

      const data = await res.json();

      if (data.draft) throw new Error('Latest release is a draft.');
      if (data.prerelease) throw new Error('Latest release is a prerelease.');

      const apk = this.findApk(data.assets);
      if (!apk) throw new Error('No APK file found in the latest release.');

      const result = {
        version: data.tag_name || 'Unknown',
        name: data.name || data.tag_name || 'Ariya',
        body: data.body || '',
        publishedAt: data.published_at,
        htmlUrl: data.html_url,
        apk: {
          name: apk.name,
          size: apk.size,
          url: apk.browser_download_url,
          contentType: apk.content_type
        }
      };

      this.cache = result;
      this.cacheTime = Date.now();
      return result;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') throw new Error('Request timed out. Check your connection.');
      throw err;
    }
  },

  findApk(assets) {
    if (!assets || !assets.length) return null;
    const exact = assets.find(a => a.name === 'Ariya.apk' && a.name.endsWith('.apk'));
    if (exact) return exact;
    const anyApk = assets.find(a => a.name && a.name.endsWith('.apk'));
    if (anyApk) return anyApk;
    return null;
  },

  formatSize(bytes) {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `~${mb.toFixed(1)} MB`;
  },

  formatDate(iso) {
    if (!iso) return 'Unknown';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  },

  renderMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/^### (.+)$/gm, '<strong>$1</strong>')
      .replace(/^## (.+)$/gm, '<strong>$1</strong>')
      .replace(/^# (.+)$/gm, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '  \u2022 $1')
      .replace(/\n/g, '<br>');
  }
};
