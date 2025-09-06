const CACHE_NAME = 'dnd-spellbook-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  // Cache spell API GET requests
  if (url.startsWith('${SPELL_API_PREFIX}') && event.request.method === 'GET') {
    event.respondWith(
      caches.open('${CACHE_NAME}').then(async cache => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch (err) {
          // If offline and not cached, return a fallback response
          return new Response(JSON.stringify({ error: "Offline and not cached." }), {
            status: 503,
            headers: { "Content-Type": "application/json" }
          });
        }
      })
    );
    return;
  }
  // Cache static assets
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});