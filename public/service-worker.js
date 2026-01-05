// Service worker for push notifications + minimal page cache
const CACHE_NAME = 'pages-v1'

// Configurable via postMessage from client
let config = {
  maxPages: 4,
  ttlMs: 10 * 60 * 1000, // 10 minutes
}

// Track cached page URLs with timestamps (stored in memory, reset on SW update)
const pageTimestamps = new Map()

// Listen for config updates from client
self.addEventListener('message', event => {
  if (event.data?.type === 'CACHE_CONFIG') {
    if (typeof event.data.maxPages === 'number') {
      config.maxPages = event.data.maxPages
    }
    if (typeof event.data.ttlMs === 'number') {
      config.ttlMs = event.data.ttlMs
    }
  }
})

self.addEventListener('install', event => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  // Clean up old caches except current
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

// Check if a URL is a cacheable page (HTML, not API)
function isPageRequest(request) {
  const url = new URL(request.url)
  // Only cache same-origin GET requests
  if (request.method !== 'GET') return false
  if (url.origin !== self.location.origin) return false
  // Don't cache API routes or assets
  if (url.pathname.startsWith('/api/')) return false
  if (url.pathname.includes('.')) return false // Has file extension = asset
  return true
}

// Enforce LRU: keep only last N pages
async function enforceLRU() {
  if (pageTimestamps.size <= config.maxPages) return

  // Sort by timestamp, oldest first
  const sorted = [...pageTimestamps.entries()].sort((a, b) => a[1] - b[1])
  const toRemove = sorted.slice(0, sorted.length - config.maxPages)

  const cache = await caches.open(CACHE_NAME)
  for (const [url] of toRemove) {
    pageTimestamps.delete(url)
    await cache.delete(url)
  }
}

// Check if cached response is still valid
function isExpired(url) {
  const timestamp = pageTimestamps.get(url)
  if (!timestamp) return true
  return Date.now() - timestamp > config.ttlMs
}

self.addEventListener('fetch', event => {
  if (!isPageRequest(event.request)) return

  event.respondWith(
    fetch(event.request)
      .then(async networkResponse => {
        // Only cache successful HTML responses
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME)
          const url = event.request.url
          pageTimestamps.set(url, Date.now())
          cache.put(event.request, networkResponse.clone())
          enforceLRU()
        }
        return networkResponse
      })
      .catch(async () => {
        // Network failed, try cache if not expired
        const url = event.request.url
        if (!isExpired(url)) {
          const cached = await caches.match(event.request)
          if (cached) return cached
        }
        // Return offline fallback or let it fail
        return new Response('Offline - page not cached', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        })
      })
  )
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
      data: data.data,
      tag: data.tag,
    }),
  )
})

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow(url)
    }),
  )
})
