const Discord = {
  initialized: false,
  _sending: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.applyLinks();
    this.bindForm();
    this.startNewsWatcher();
    if (typeof Download !== 'undefined' && Download.release) {
      this.announceRelease(Download.release);
    }
  },

  applyLinks() {
    document.querySelectorAll('[data-discord-link]').forEach(a => {
      a.href = discordConfig.supportUrl;
    });
  },

  storageGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },

  storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch { return; }
  },

  clip(text, max) {
    const s = String(text == null ? '' : text);
    return s.length > max ? s.slice(0, max - 1) + '\u2026' : s;
  },

  async post(webhookUrl, payload) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const e = new Error("You're offline. Check your connection and try again.");
      e.code = 'offline';
      throw e;
    }

    let res;
    try {
      res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      const e = new Error('Unable to send. Check your connection and try again.');
      e.code = 'network';
      throw e;
    }

    if (res.status === 429) {
      const e = new Error('Too many requests. Please wait a moment and try again.');
      e.code = 'rate_limit';
      throw e;
    }
    if (!res.ok) {
      const e = new Error('Unable to send right now. Please try again later.');
      e.code = 'http';
      throw e;
    }
    return true;
  },

  publishedWithinDays(iso, days) {
    const t = Date.parse(iso || '');
    if (Number.isNaN(t)) return false;
    return Date.now() - t <= days * 86400000;
  },

  announceRelease(release) {
    if (!release || typeof release.version !== 'string' || !release.version) return;

    const key = discordConfig.storageKeys.announcedRelease;
    const stored = this.storageGet(key);

    if (!stored) {
      this.storageSet(key, release.version);
      return;
    }
    if (GitHub.compareVersions(release.version, stored) <= 0) return;

    if (!this.publishedWithinDays(release.publishedAt, discordConfig.announceIfPublishedWithinDays)) {
      this.storageSet(key, release.version);
      return;
    }

    const body = String(release.body || '').replace(/\s+/g, ' ').trim();
    const fields = [
      { name: 'Version', value: this.clip(release.version, 256), inline: true },
      { name: 'Size', value: release.apk && release.apk.size ? GitHub.formatSize(release.apk.size) : 'Unknown', inline: true },
      { name: 'Released', value: GitHub.formatDate(release.publishedAt), inline: true }
    ];
    if (release.htmlUrl) {
      fields.push({ name: 'Release Page', value: this.clip(release.htmlUrl, 256), inline: false });
    }

    const embed = {
      title: this.clip(`\u{1F680} New Release: ${githubConfig.appName} ${release.version}`, 256),
      description: this.clip(body || 'A new version is now available.', 500),
      color: 0x7c5cfc,
      fields,
      footer: { text: `${githubConfig.appName} Updates` },
      timestamp: new Date().toISOString()
    };
    if (release.htmlUrl) embed.url = release.htmlUrl;

    this.post(discordConfig.updatesWebhook, {
      username: discordConfig.updatesUsername,
      embeds: [embed],
      allowed_mentions: { parse: [] }
    })
      .then(() => {
        this.storageSet(key, release.version);
        Debug.log('release announced:', release.version);
      })
      .catch(err => Debug.log('release announce failed:', err && err.code));
  },

  newsTime(item) {
    const t = Number(item && item.Date);
    if (!Number.isFinite(t) || t <= 0) return 0;
    return t < 1e12 ? t * 1000 : t;
  },

  announceNews(item) {
    if (!item || typeof item.id !== 'string' || !item.id) return Promise.resolve();

    const embed = {
      title: this.clip(String(item.Title || 'Ariya News'), 256),
      color: 0xa78bfa,
      footer: { text: `${githubConfig.appName} News${item.Author ? ' \u2022 ' + this.clip(item.Author, 100) : ''}` },
      timestamp: new Date(this.newsTime(item) || Date.now()).toISOString()
    };

    const desc = String(item.Description || '').trim();
    if (desc) embed.description = this.clip(desc, 800);

    let img = item.ImageURL;
    if (typeof img === 'string') img = [img];
    if (Array.isArray(img) && img.length) {
      const safe = GitHub.safeUrl(img[0], ['https:', 'http:']);
      if (safe) embed.image = { url: safe };
    }

    return this.post(discordConfig.updatesWebhook, {
      username: discordConfig.updatesUsername,
      embeds: [embed],
      allowed_mentions: { parse: [] }
    }).then(() => Debug.log('news announced:', item.id));
  },

  startNewsWatcher() {
    const boot = () => {
      this.checkNews();
      clearInterval(this._newsTimer);
      this._newsTimer = setInterval(() => this.checkNews(), discordConfig.newsCheckInterval);
    };
    if (document.readyState === 'complete') boot();
    else window.addEventListener('load', boot, { once: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.checkNews();
    });
  },

  async checkNews() {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

    let items;
    try {
      items = await News.getMetadata({ force: false });
    } catch {
      return;
    }
    if (!Array.isArray(items) || !items.length) return;

    const key = discordConfig.storageKeys.announcedNews;
    const raw = this.storageGet(key);
    let seen;

    if (!raw) {
      seen = new Set(items.map(i => i.id));
      this.storageSet(key, JSON.stringify([...seen].slice(-50)));
      return;
    }

    try {
      const arr = JSON.parse(raw);
      seen = new Set(Array.isArray(arr) ? arr : []);
    } catch {
      seen = new Set();
    }

    const fresh = items
      .filter(i => i && i.id && !seen.has(i.id))
      .sort((a, b) => this.newsTime(a) - this.newsTime(b));
    if (!fresh.length) return;

    for (const item of fresh) {
      try {
        await this.announceNews(item);
        seen.add(item.id);
      } catch (err) {
        Debug.log('news announce failed:', err && err.code);
        break;
      }
    }
    this.storageSet(key, JSON.stringify([...seen].slice(-50)));
  },

  bindForm() {
    const form = document.getElementById('bug-form');
    if (!form) return;

    const messageEl = document.getElementById('bug-message');
    const countEl = document.getElementById('bug-count');
    const errorEl = document.getElementById('bug-error');
    const resetBtn = document.getElementById('bug-reset');

    if (messageEl && countEl) {
      const updateCount = () => { countEl.textContent = `${messageEl.value.length} / ${discordConfig.bugMaxLength}`; };
      messageEl.addEventListener('input', () => {
        updateCount();
        if (errorEl) errorEl.textContent = '';
      });
      updateCount();
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      this.submitForm(form, errorEl);
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        if (countEl && messageEl) countEl.textContent = `0 / ${discordConfig.bugMaxLength}`;
        if (errorEl) errorEl.textContent = '';
        form.hidden = false;
        document.getElementById('bug-success').hidden = true;
        messageEl?.focus();
      });
    }
  },

  showError(errorEl, msg) {
    if (errorEl) errorEl.textContent = msg;
  },

  async submitForm(form, errorEl) {
    if (this._sending) return;

    const type = document.getElementById('bug-type')?.value || 'bug';
    const name = (document.getElementById('bug-name')?.value || '').trim();
    const contact = (document.getElementById('bug-contact')?.value || '').trim();
    const message = (document.getElementById('bug-message')?.value || '').trim();
    const honeypot = document.getElementById('bug-website')?.value || '';

    this.showError(errorEl, '');

    if (honeypot) {
      this.showSuccess(form);
      return;
    }

    if (message.length < discordConfig.bugMinLength) {
      this.showError(errorEl, `Please enter at least ${discordConfig.bugMinLength} characters.`);
      document.getElementById('bug-message')?.focus();
      return;
    }

    const last = Number(this.storageGet(discordConfig.storageKeys.bugCooldown) || 0);
    if (last && Date.now() - last < discordConfig.bugCooldownMs) {
      this.showError(errorEl, 'Please wait a moment before sending another report.');
      return;
    }

    const labels = { bug: '\u{1F41B} Bug Report', feedback: '\u{1F4AC} Feedback', question: '\u2753 Question' };
    const colors = { bug: 0xf87171, feedback: 0x7c5cfc, question: 0xfbbf24 };

    const fields = [
      { name: 'Type', value: labels[type] || labels.bug, inline: true },
      { name: 'App Version', value: this.clip((typeof Download !== 'undefined' && Download.release && Download.release.version) || 'Unknown', 256), inline: true },
      { name: 'From', value: this.clip(name || 'Anonymous', 256), inline: true },
      { name: 'Page', value: this.clip(location.href, 256), inline: false },
      { name: 'Browser', value: this.clip(navigator.userAgent || 'Unknown', 256), inline: false }
    ];
    if (contact) {
      fields.splice(3, 0, { name: 'Contact', value: this.clip(contact, 256), inline: false });
    }

    const embed = {
      title: labels[type] || labels.bug,
      description: this.clip(message, discordConfig.bugMaxLength),
      color: colors[type] || colors.bug,
      fields,
      footer: { text: `${githubConfig.appName} Website \u2022 ${navigator.language || 'en'}` },
      timestamp: new Date().toISOString()
    };

    this._sending = true;
    const btn = document.getElementById('bug-submit');
    const btnText = btn?.querySelector('.btn-text');
    let spinner = null;
    if (btn) {
      btn.disabled = true;
      btn.classList.add('loading');
      if (btnText) btnText.textContent = 'Sending...';
      if (!btn.querySelector('.spinner')) {
        spinner = document.createElement('span');
        spinner.className = 'spinner';
        btn.appendChild(spinner);
      }
    }

    try {
      await this.post(discordConfig.bugWebhook, {
        username: discordConfig.bugUsername,
        embeds: [embed],
        allowed_mentions: { parse: [] }
      });
      this.storageSet(discordConfig.storageKeys.bugCooldown, String(Date.now()));
      this.showSuccess(form);
      if (typeof Download !== 'undefined') {
        Download.showToast('\u2705 Report sent! Thanks for helping improve Ariya.');
      }
    } catch (err) {
      this.showError(errorEl, (err && err.message) || 'Unable to send your report. Please try again.');
      Debug.log('bug report failed:', err && err.code);
    } finally {
      this._sending = false;
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('loading');
        if (btnText) btnText.textContent = 'Send Report';
        spinner?.remove();
      }
    }
  },

  showSuccess(form) {
    form.reset();
    form.hidden = true;
    const success = document.getElementById('bug-success');
    if (success) {
      success.hidden = false;
      success.focus?.();
    }
    const countEl = document.getElementById('bug-count');
    if (countEl) countEl.textContent = `0 / ${discordConfig.bugMaxLength}`;
  }
};
