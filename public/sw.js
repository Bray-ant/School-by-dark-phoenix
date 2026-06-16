const CACHE_NAME = 'school-dark-phoenix-v3';
const STATIC_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
];

// Install: cache only truly static assets (icons, manifest)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean ALL old caches so stale assets are purged
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for HTML/JS/CSS, cache-first for images/fonts
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API calls: network only (don't cache dynamic data)
  if (url.pathname.startsWith('/api/')) return;

  // HTML and hashed JS/CSS bundles: network-first (always get fresh code)
  if (request.mode === 'navigate' || url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || new Response('Offline', { status: 503 })))
    );
    return;
  }

  // Images, fonts, other static: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && url.pathname.match(/\.(png|jpg|svg|woff2?|ico)$/)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    }).catch(() => new Response('Offline', { status: 503 }))
  );
});
