// Name of the cache used in this version of the service worker.
const PRECACHE = 'precache-v21'

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
// Only GET requests can be cached - POST, PUT, DELETE etc are not cacheable.

self.addEventListener('fetch', event => {
  // Only handle same-origin GET requests
  if (
    event.request.url.startsWith(self.location.origin) &&
    event.request.method === 'GET'
  ) {
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

// Push notification received
self.addEventListener('push', event => {
  const defaultData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/favicon.svg',
  }

  let data = defaultData
  try {
    data = event.data?.json() ?? defaultData
  } catch {
    data = defaultData
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/favicon.svg',
      badge: '/favicon.svg',
      data: data.data, // URL and metadata to use on click
      tag: data.tag, // Deduplicate notifications with same tag
    }),
  )
})

// Notification click handler - opens the relevant page
self.addEventListener('notificationclick', event => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Try to focus an existing tab with the URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      // Open a new tab if no matching tab found
      return clients.openWindow(url)
    }),
  )
})
