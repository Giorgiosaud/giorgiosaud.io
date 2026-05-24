import { VAPID_PUBLIC_KEY } from 'astro:env/client'
import { VAPID_PRIVATE_KEY, VAPID_SUBJECT } from 'astro:env/server'
import { db } from '@db'
import { pushSubscriptions } from '@db/schema'
import { and, eq, or } from 'drizzle-orm'
import webpush from 'web-push'

// Configure web-push with VAPID keys
function configureWebPush() {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return false
  }
  webpush.setVapidDetails(
    VAPID_SUBJECT || 'mailto:noreply@giorgiosaud.io',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  )
  return true
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  tag?: string
  data?: {
    url?: string
    type?: string
    [key: string]: unknown
  }
}

// Max failures before deactivating subscription
const MAX_FAILURES = 3

/**
 * Send push notification to a specific user
 */
export async function sendPushToUser(
  userId: string,
  payload: NotificationPayload,
): Promise<{
  sent: number
  failed: number
}> {
  if (!configureWebPush()) {
    console.warn('Push notifications not configured')
    return {
      sent: 0,
      failed: 0,
    }
  }

  // Get all active subscriptions for user
  const subscriptions = await db.query.pushSubscriptions.findMany({
    where: and(
      eq(pushSubscriptions.userId, userId),
      eq(pushSubscriptions.isActive, true),
    ),
  })

  let sent = 0
  let failed = 0

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(payload),
      )

      // Update last used timestamp
      await db
        .update(pushSubscriptions)
        .set({
          lastUsedAt: new Date(),
          failureCount: 0,
        })
        .where(eq(pushSubscriptions.id, sub.id))

      sent++
    } catch (error) {
      failed++
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      const statusCode = (
        error as {
          statusCode?: number
        }
      ).statusCode

      // If subscription is gone (expired/unsubscribed), deactivate it
      if (statusCode === 404 || statusCode === 410) {
        await db
          .update(pushSubscriptions)
          .set({
            isActive: false,
            lastError: `Subscription expired (${statusCode})`,
            updatedAt: new Date(),
          })
          .where(eq(pushSubscriptions.id, sub.id))
      } else {
        // Increment failure count
        const newFailureCount = sub.failureCount + 1
        await db
          .update(pushSubscriptions)
          .set({
            failureCount: newFailureCount,
            lastError: errorMessage,
            isActive: newFailureCount < MAX_FAILURES,
            updatedAt: new Date(),
          })
          .where(eq(pushSubscriptions.id, sub.id))
      }

      console.error(
        `Push notification failed for subscription ${sub.id}:`,
        errorMessage,
      )
    }
  }

  return {
    sent,
    failed,
  }
}

/**
 * Send notification when someone replies to a comment
 */
export async function sendCommentReplyNotification(
  parentAuthorId: string,
  replierName: string,
  commentPreview: string,
  postSlug: string,
  commentId: string,
): Promise<void> {
  const payload: NotificationPayload = {
    title: 'New reply to your comment',
    body: `${replierName} replied: "${commentPreview.slice(0, 100)}${commentPreview.length > 100 ? '...' : ''}"`,
    icon: '/favicon.svg',
    tag: `comment-reply-${commentId}`,
    data: {
      url: `/notebook/${postSlug}#comment-${commentId}`,
      type: 'comment-reply',
      commentId,
    },
  }

  await sendPushToUser(parentAuthorId, payload)
}

/**
 * Check if push notifications are configured
 */
export function isPushConfigured(): boolean {
  return !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY)
}

/**
 * Send notification to ALL active subscribers (for new posts, announcements)
 */
export async function broadcastNotification(
  payload: NotificationPayload,
): Promise<{
  sent: number
  failed: number
}> {
  if (!configureWebPush()) {
    console.warn('Push notifications not configured')
    return {
      sent: 0,
      failed: 0,
    }
  }

  // Get all active subscriptions
  const subscriptions = await db.query.pushSubscriptions.findMany({
    where: eq(pushSubscriptions.isActive, true),
  })

  let sent = 0
  let failed = 0

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(payload),
      )

      await db
        .update(pushSubscriptions)
        .set({
          lastUsedAt: new Date(),
          failureCount: 0,
        })
        .where(eq(pushSubscriptions.id, sub.id))

      sent++
    } catch (error) {
      failed++
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      const statusCode = (
        error as {
          statusCode?: number
        }
      ).statusCode

      if (statusCode === 404 || statusCode === 410) {
        await db
          .update(pushSubscriptions)
          .set({
            isActive: false,
            lastError: `Subscription expired (${statusCode})`,
            updatedAt: new Date(),
          })
          .where(eq(pushSubscriptions.id, sub.id))
      } else {
        const newFailureCount = sub.failureCount + 1
        await db
          .update(pushSubscriptions)
          .set({
            failureCount: newFailureCount,
            lastError: errorMessage,
            isActive: newFailureCount < MAX_FAILURES,
            updatedAt: new Date(),
          })
          .where(eq(pushSubscriptions.id, sub.id))
      }
    }
  }

  return {
    sent,
    failed,
  }
}

/**
 * Broadcast to subscribers of a specific language only
 */
export async function broadcastToLang(
  lang: 'en' | 'es',
  payload: NotificationPayload,
): Promise<{
  sent: number
  failed: number
}> {
  if (!configureWebPush()) {
    console.warn('Push notifications not configured')
    return {
      sent: 0,
      failed: 0,
    }
  }

  const subscriptions = await db.query.pushSubscriptions.findMany({
    where: and(
      eq(pushSubscriptions.isActive, true),
      eq(pushSubscriptions.lang, lang),
    ),
  })

  let sent = 0
  let failed = 0

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(payload),
      )
      await db
        .update(pushSubscriptions)
        .set({
          lastUsedAt: new Date(),
          failureCount: 0,
        })
        .where(eq(pushSubscriptions.id, sub.id))
      sent++
    } catch (error) {
      failed++
      const statusCode = (
        error as {
          statusCode?: number
        }
      ).statusCode
      const lastError = error instanceof Error ? error.message : 'Unknown error'
      if (statusCode === 404 || statusCode === 410) {
        await db
          .update(pushSubscriptions)
          .set({
            isActive: false,
            lastError: `Subscription expired (${statusCode})`,
            updatedAt: new Date(),
          })
          .where(eq(pushSubscriptions.id, sub.id))
      } else {
        const newFailureCount = sub.failureCount + 1
        await db
          .update(pushSubscriptions)
          .set({
            failureCount: newFailureCount,
            lastError,
            isActive: newFailureCount < MAX_FAILURES,
            updatedAt: new Date(),
          })
          .where(eq(pushSubscriptions.id, sub.id))
      }
    }
  }

  return {
    sent,
    failed,
  }
}

/**
 * Send notification for a new blog post, language-aware
 */
export async function sendNewPostNotification(
  en: {
    title: string
    slug: string
    excerpt?: string
  },
  es: {
    title: string
    slug: string
    excerpt?: string
  },
): Promise<{
  sent: number
  failed: number
}> {
  const [enResult, esResult] = await Promise.all([
    broadcastToLang('en', {
      title: 'New Post Published',
      body: en.excerpt || en.title,
      icon: '/favicon.svg',
      tag: `new-post-${en.slug}`,
      data: {
        url: `/notebook/${en.slug}`,
        type: 'new-post',
      },
    }),
    broadcastToLang('es', {
      title: 'Nueva publicación',
      body: es.excerpt || es.title,
      icon: '/favicon.svg',
      tag: `new-post-${es.slug}`,
      data: {
        url: `/es/cuaderno/${es.slug}`,
        type: 'new-post',
      },
    }),
  ])
  return {
    sent: enResult.sent + esResult.sent,
    failed: enResult.failed + esResult.failed,
  }
}
