const CACHE_NAME = 'harmony-forge-relic-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Outfit:wght@800&family=Space+Mono:wght@400;700&display=swap'
];

// Install Event
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // console.log removed (production leak)
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            // console.log removed (production leak)
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', e => {
  // Only cache GET requests
  if (e.request.method !== 'GET') {
    return; // let browser handle it natively
  }

  // Bypass caching for CORTEX API and local server API requests
  const url = new URL(e.request.url);
  if (url.port === '8009' || url.pathname.includes('/memory/') || url.pathname.includes('/health/')) {
    return; // let network handle it natively
  }

  // Static Cache-First strategy for assets
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
