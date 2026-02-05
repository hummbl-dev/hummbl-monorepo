// Service Worker for PWA support and offline functionality

const CACHE_VERSION = 'hummbl-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

// Static assets to cache immediately
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json', '/favicon.ico'];

// Maximum cache size for dynamic content
const MAX_CACHE_SIZE = 50;

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith('hummbl-') &&
              name !== STATIC_CACHE &&
              name !== DYNAMIC_CACHE &&
              name !== DATA_CACHE
          )
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  self.clients.claim();
});

/**
 * Fetch event - network-first strategy for data, cache-first for assets
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Data files - network first, fallback to cache
  if (url.pathname.includes('/data/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response before caching
          const responseClone = response.clone();

          caches.open(DATA_CACHE).then((cache) => {
            cache.put(request, responseClone);
            limitCacheSize(DATA_CACHE, MAX_CACHE_SIZE);
          });

          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Don't cache if not successful
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone response before caching
        const responseClone = response.clone();

        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
          limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE);
        });

        return response;
      });
    })
  );
});

/**
 * Message event - handle commands from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      })
    );
  }
});

/**
 * Limit cache size by removing oldest entries
 */
function limitCacheSize(cacheName, maxSize) {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > maxSize) {
        cache.delete(keys[0]).then(() => {
          limitCacheSize(cacheName, maxSize);
        });
      }
    });
  });
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-notes') {
    event.waitUntil(
      // This would sync queued notes when online
      Promise.resolve()
    );
  }
});

/**
 * Push notification support (for future use)
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    tag: 'hummbl-notification',
  };

  event.waitUntil(self.registration.showNotification('HUMMBL', options));
});
