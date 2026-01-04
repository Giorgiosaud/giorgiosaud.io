// Service worker for push notifications only
// No caching - network requests go directly to server

self.addEventListener('install', event => {
  // Activate immediately
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  // Clean up any old caches from previous versions
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }).then(() => self.clients.claim())
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
