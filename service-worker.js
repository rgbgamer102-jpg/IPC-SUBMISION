const CACHE_NAME = 'ifi-kitchen-v1';
const APP_SHELL = [
  './',
  './index.html',
  './work.html',
  './manifest.json',
  './service-worker.js',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/assets/') || url.pathname.endsWith('/work.html') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/manifest.json') || url.pathname.endsWith('/service-worker.js') || url.pathname === '/') {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((networkResponse) => {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return networkResponse;
          })
          .catch(() => caches.match('./work.html') || caches.match('./index.html') || caches.match('./assets/css/style.css'));
      })
    );
  }
});
