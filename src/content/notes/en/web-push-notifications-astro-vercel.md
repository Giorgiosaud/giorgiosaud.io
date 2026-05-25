---
draft: false
selfHealing: "wbpshn"
starred: false
title: "Web Push Notifications with Astro and Vercel"
description: "How to implement Web Push Notifications in an Astro site deployed to Vercel — VAPID keys, service workers, subscription management, and everything that can go wrong."
publishDate: 2026-05-24T00:00:00.000Z
category: development
author: giorgio-saud
collections:
  - frontend
  - backend
tags:
  - astro
  - vercel
  - web-push
  - service-worker
  - notifications
cover: ../../../assets/images/web-push-notifications-astro-vercel.png
coverAlt: "Web Push Notifications with Astro and Vercel"
lang: en
---

Web Push lets you send notifications to users even when they're not on your site. I added it to this blog so readers can opt in to new post alerts. The implementation is straightforward in principle — but there are enough moving parts that it's worth walking through all of them, including what breaks when one is missing.

## How Web Push works

The flow has four actors:

1. **Browser** — subscribes to a push service and gives you its endpoint
2. **Push service** — a browser vendor's server (FCM for Chrome, Mozilla's for Firefox) that delivers the message
3. **Your server** — sends the push message to the push service
4. **Service worker** — receives the push event and displays the notification

You never talk to the user's browser directly. You send a message to the push service, which delivers it to the browser, which wakes up the service worker.

### VAPID keys

VAPID (Voluntary Application Server Identification) is how you prove to the push service that you're the one who created the subscription. You generate a public/private key pair once and keep the private key secret on the server.

Generate them with:

```bash
bunx web-push generate-vapid-keys
```

This gives you two values:
- `VAPID_PUBLIC_KEY` — shared with the browser at subscription time
- `VAPID_PRIVATE_KEY` — used server-side to sign push messages, never exposed

## Environment setup

In `astro.config.mjs`, declare the VAPID env vars using Astro's typed env system:

```javascript
env: {
  schema: {
    VAPID_PUBLIC_KEY: envField.string({
      context: 'client',
      access: 'public',
      optional: true,
    }),
    VAPID_PRIVATE_KEY: envField.string({
      context: 'server',
      access: 'secret',
      optional: true,
    }),
    VAPID_SUBJECT: envField.string({
      context: 'server',
      access: 'public',
      optional: true,
      default: 'mailto:you@example.com',
    }),
  },
}
```

`VAPID_PUBLIC_KEY` is `context: 'client'` because the browser needs it to create the subscription. `VAPID_PRIVATE_KEY` is `context: 'server'` — it never leaves the server.

Add both to Vercel's environment variables. Without them, the VAPID key endpoint returns 503 and subscriptions silently fail.

## The subscription flow

### Step 1: Serve the public VAPID key

```typescript
// src/pages/api/push/vapid-key.json.ts
import { VAPID_PUBLIC_KEY } from 'astro:env/client'

export const GET: APIRoute = async () => {
  if (!VAPID_PUBLIC_KEY) {
    return new Response(JSON.stringify({ error: 'Not configured' }), { status: 503 })
  }
  return new Response(JSON.stringify({ vapidKey: VAPID_PUBLIC_KEY }))
}
```

### Step 2: Client-side subscription

```typescript
// src/lib/push-client.ts
export async function subscribeToPush(): Promise<boolean> {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return false

  // Fetch the public key
  const res = await fetch('/api/push/vapid-key.json')
  const { vapidKey } = await res.json()

  // Register service worker and subscribe
  const reg = await navigator.serviceWorker.ready
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  })

  // Send subscription to your server
  await fetch('/api/push/subscribe.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: subscription.toJSON().keys,
    }),
  })

  return true
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}
```

### Step 3: Store the subscription

```typescript
// src/pages/api/push/subscribe.json.ts
export const POST: APIRoute = async ({ request, locals }) => {
  const { endpoint, keys, expirationTime, lang } = await request.json()

  const existing = await db.query.pushSubscriptions.findFirst({
    where: eq(pushSubscriptions.endpoint, endpoint),
  })

  if (existing) {
    await db.update(pushSubscriptions)
      .set({ p256dh: keys.p256dh, auth: keys.auth, isActive: true, failureCount: 0 })
      .where(eq(pushSubscriptions.endpoint, endpoint))
    return new Response(JSON.stringify({ success: true }))
  }

  await db.insert(pushSubscriptions).values({
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    lang: lang ?? 'en',
    userId: locals.user?.id ?? null,
    userAgent: request.headers.get('user-agent'),
  })

  return new Response(JSON.stringify({ success: true }), { status: 201 })
}
```

### Step 4: Service worker receives push events

```javascript
// public/service-worker.js
self.addEventListener('push', event => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/favicon-96x96.png',
      badge: '/icons/favicon-32x32.png',
      data: { url: data.url },
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url
  if (url) {
    event.waitUntil(clients.openWindow(url))
  }
})
```

### Step 5: Send a broadcast from the server

```typescript
// src/pages/api/push/broadcast.json.ts
import webpush from 'web-push'
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } from 'astro:env/server'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user?.isAdmin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { title, body, url } = await request.json()

  const subscriptions = await db.query.pushSubscriptions.findMany({
    where: eq(pushSubscriptions.isActive, true),
  })

  let sent = 0, failed = 0

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, url }),
      )
      sent++
    } catch (err: any) {
      failed++
      // 410 Gone = subscription expired, mark inactive
      if (err.statusCode === 410) {
        await db.update(pushSubscriptions)
          .set({ isActive: false })
          .where(eq(pushSubscriptions.endpoint, sub.endpoint))
      }
    }
  }

  return new Response(JSON.stringify({ success: true, result: { sent, failed } }))
}
```

## Database schema

```typescript
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  lang: text('lang').notNull().default('en'),
  expirationTime: timestamp('expiration_time', { withTimezone: true }),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').notNull().default(true),
  failureCount: integer('failure_count').notNull().default(0),
  lastError: text('last_error'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
```

Storing `isActive` and `failureCount` matters — push subscriptions expire and the push service returns HTTP 410 when they do. Marking them inactive instead of deleting lets you audit them later.

## What goes wrong

### VAPID keys missing → 503 on subscription

If `VAPID_PUBLIC_KEY` isn't set in Vercel's environment, the `/api/push/vapid-key.json` endpoint returns 503. The subscription fails silently from the user's perspective — the notification toggle appears to work but nothing is saved.

**Debug**: open DevTools Network tab, click the notification toggle, watch for the VAPID key request. 503 there means the env var is missing.

### Service worker not registered → no push events

Push requires a registered service worker with `pushManager` access. If your service worker registration fails (HTTPS required, scope issues, registration error), subscriptions can be created but push events are never received.

**Debug**: check `navigator.serviceWorker.ready` — if it never resolves, the service worker isn't registering.

### `userVisibleOnly: true` is mandatory

Chrome requires `userVisibleOnly: true` in the `subscribe()` call. Without it, the subscription fails with a `DOMException`. This is a browser-enforced requirement — background push without a notification is not allowed.

### 410 Gone means the subscription is dead

When the push service returns HTTP 410 for a subscription, the user has revoked permission or the subscription expired. Mark it `isActive: false` immediately — retrying a 410 subscription wastes resources and some push services will rate-limit you.

### Safari on iOS requires a user gesture

On iOS, `Notification.requestPermission()` must be called inside a direct user interaction handler (a click event). Calling it on page load or after an async delay fails silently. The notification button in this site's avatar menu works because it's called directly in the `onclick` handler.

## The admin interface

A simple broadcast page queries active subscriptions and POSTs to the broadcast endpoint:

```typescript
const activeSubscriptions = await db.query.pushSubscriptions.findMany({
  where: eq(pushSubscriptions.isActive, true),
})
const subscriberCount = activeSubscriptions.length
```

The count is shown on the page before sending so you know how many devices will receive the notification. After sending, the response includes `{ sent, failed }` so you can spot stale subscriptions.

## Summary

The pieces:

| What | Where |
|------|-------|
| VAPID keys | Vercel env vars |
| Public key endpoint | `/api/push/vapid-key.json` |
| Subscribe endpoint | `/api/push/subscribe.json` (POST/DELETE) |
| Subscription storage | Postgres via Drizzle |
| Push event handler | `public/service-worker.js` |
| Broadcast endpoint | `/api/push/broadcast.json` |
| Admin UI | `/admin/notifications` |

The main failure mode is always the same: a missing environment variable or a service worker registration problem. Check those two first before digging anywhere else.
