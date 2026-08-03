const CACHE_NAME = 'pathpal-offline-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Offline emergency fallback data
const OFFLINE_EMERGENCY_DATA = {
  version: '1.0',
  sosNumber: '911',
  campusSecurity: '1-800-555-0199',
  emergencyGuide: 'In case of hospital signal loss: Find the nearest blue-light emergency station or reception desk.',
  cachedAt: new Date().toISOString()
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[PathPal SW] Pre-caching offline app shell & emergency data');
      // Store static shell
      await cache.addAll(OFFLINE_URLS).catch((err) => console.warn('[PathPal SW] Pre-cache warning:', err));
      
      // Store offline emergency fallback response
      const emergencyResponse = new Response(JSON.stringify(OFFLINE_EMERGENCY_DATA), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put('/api/offline-emergency-data', emergencyResponse);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[PathPal SW] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background refresh if online (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          }
        }).catch(() => {/* Offline fallback active */});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          return networkResponse;
        })
        .catch(async () => {
          // If network fails and request is for emergency offline API
          if (event.request.url.includes('/api/offline-emergency-data')) {
            const emergencyCache = await caches.match('/api/offline-emergency-data');
            if (emergencyCache) return emergencyCache;
          }
          // Default fallback to cached index.html for navigation requests
          if (event.request.mode === 'navigate') {
            const indexCache = await caches.match('/index.html');
            if (indexCache) return indexCache;
          }
          return new Response('PathPal Offline Mode Active. Hospital Emergency Services are cached.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
});
