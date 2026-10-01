// ARIYA service worker.
// Strategy is unchanged from the static site (network-first documents so a new
// release is visible immediately, cache-first + background revalidation for
// assets), but the precache list now matches the Next.js build: there is no
// /index.html, /css/style.css or /js/*.js any more - those live under /_next.
const CACHE = 'ariya-dl-v12';
const ASSETS = [
  '/',
  '/about',
  '/manifest.json',
  '/assets/ariya-logo-64.png',
  '/assets/ariya-logo-240.png',
  '/assets/ariya-logo-64.webp',
  '/assets/ariya-logo-120.webp',
  '/assets/ariya-logo-180.webp',
  '/assets/ariya-logo-240.webp',
  '/assets/ariya-logo-320.webp',
  '/assets/icon-512.png'
];

self.addEventListener('install', e => {
  // A missing optional asset must not block installation.
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(ASSETS.map(url => cache.add(url).catch(() => undefined)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(x => x !== CACHE).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  let url;
  try { url = new URL(e.request.url); } catch { return; }
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first so users get fresh HTML, cache fallback offline.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(r => {
        if (r && r.status === 200) {
          const c = r.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, c));
        }
        return r;
      }).catch(() => caches.match(e.request).then(x => x || caches.match('/')))
    );
    return;
  }

  // Hashed build files are immutable, so serve them straight from the cache.
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached =>
          cached || fetch(e.request).then(r => {
            if (r && r.status === 200) cache.put(e.request, r.clone());
            return r;
          })
        )
      )
    );
    return;
  }

  // Everything else: cache-first, updated in the background.
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
