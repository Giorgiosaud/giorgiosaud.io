// Name of the cache used in this version of the service worker.
const PRECACHE = 'precache-v20'

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  './', // Alias for index.html
]

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting()),
  )
})

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return cacheNames.filter(cacheName => cacheName !== PRECACHE)
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete)
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// The fetch handler serves responses for same-origin resources from a cache.

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Only cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone()
            caches.open(PRECACHE).then(cache => {
              cache.put(event.request, responseClone)
            })
          }
          return networkResponse
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
        }),
    )
  }
})
