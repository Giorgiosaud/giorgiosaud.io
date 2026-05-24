// Service worker for push notifications only — no page caching

async function purgeAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map(name => caches.delete(name)))
}

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(purgeAllCaches().then(() => self.clients.claim()))
})

self.addEventListener('message', event => {
  if (event.data?.type === 'PURGE_CACHE') {
    event.waitUntil(purgeAllCaches())
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
      data: data.data,
      tag: data.tag,
    }),
  )
})

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Prefer a tab already on the exact URL (ignoring hash)
      const targetPath = new URL(url).pathname
      const match = clientList.find(c => new URL(c.url).pathname === targetPath)

      if (match) {
        // Navigate to the full URL (including hash) then focus
        return match.navigate(url).then(c => c?.focus())
      }

      // No matching tab — open a new one
      return clients.openWindow(url)
    }),
  )
})
