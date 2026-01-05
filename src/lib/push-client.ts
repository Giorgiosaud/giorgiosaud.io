/**
 * Client-side utilities for Web Push notifications
 */

/**
 * Check if push notifications are supported by the browser
 */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

/**
 * Get the current push notification permission state
 */
export function getPermissionState(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

/**
 * Request permission for push notifications
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported')
  }
  return Notification.requestPermission()
}

/**
 * Get the public VAPID key from the server
 */
async function getVapidKey(): Promise<string | null> {
  try {
    const response = await fetch('/api/push/vapid-key.json')
    if (!response.ok) return null
    const data = await response.json()
    return data.vapidKey || null
  } catch {
    return null
  }
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Subscribe to push notifications
 * Returns true if successful, false otherwise
 */
export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported()) {
    console.error('Push notifications not supported')
    return false
  }

  try {
    // Request permission if not granted
    const permission = await requestPermission()
    if (permission !== 'granted') {
      console.log('Push notification permission denied')
      return false
    }

    // Get VAPID key
    const vapidKey = await getVapidKey()
    if (!vapidKey) {
      console.error('Push notifications not configured on server')
      return false
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })

    // Send subscription to server
    const response = await fetch('/api/push/subscribe.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription.toJSON()),
      credentials: 'include',
    })

    if (!response.ok) {
      console.error('Failed to save subscription on server')
      return false
    }

    console.log('Successfully subscribed to push notifications')
    return true
  } catch (error) {
    console.error('Error subscribing to push:', error)
    return false
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      return true // Already unsubscribed
    }

    // Unsubscribe from browser
    await subscription.unsubscribe()

    // Notify server
    await fetch('/api/push/subscribe.json', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
      credentials: 'include',
    })

    console.log('Successfully unsubscribed from push notifications')
    return true
  } catch (error) {
    console.error('Error unsubscribing from push:', error)
    return false
  }
}

/**
 * Check if currently subscribed to push notifications
 */
export async function isSubscribed(): Promise<boolean> {
  if (!isPushSupported()) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return subscription !== null
  } catch {
    return false
  }
}
