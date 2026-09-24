const CACHE = 'ariya-dl-v7';
const ASSETS = [
  '/', '/index.html', '/css/style.css',
  '/js/config.js', '/js/github.js', '/js/news.js', '/js/discord.js',
  '/js/release-sync.js', '/js/download.js', '/js/app.js',
  '/manifest.json',
  '/assets/ariya-logo-64.png', '/assets/ariya-logo-240.png',
  '/assets/ariya-logo-64.webp', '/assets/ariya-logo-120.webp',
  '/assets/ariya-logo-180.webp', '/assets/ariya-logo-240.webp',
  '/assets/ariya-logo-320.webp'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  let url;
  try { url = new URL(e.request.url); } catch { return; }
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first so users get fresh HTML, cache fallback offline
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(r => {
        if (r && r.status === 200) {
          const c = r.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, c));
        }
        return r;
      }).catch(() => caches.match(e.request).then(x => x || caches.match('/index.html')))
    );
    return;
  }

  // Static assets: cache-first, update in background (stale-while-revalidate)
  e.respondWith(
    caches.match(e.request).then(cached => {
      const live = fetch(e.request).then(r => {
        if (r && r.status === 200) {
          const c = r.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, c));
        }
        return r;
      }).catch(() => cached);
      return cached || live;
    })
  );
});
