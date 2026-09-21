const CACHE = 'ariya-dl-v1';
const ASSETS = ['/', '/index.html', '/css/style.css', '/js/github.js', '/js/download.js', '/js/app.js', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const live = fetch(e.request).then(r => {
        if (r && r.status === 200) { const c = r.clone(); caches.open(CACHE).then(cache => cache.put(e.request, c)); }
        return r;
      }).catch(() => cached);
      return cached || live;
    })
  );
});
