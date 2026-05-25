---
draft: false
selfHealing: "wbpshn"
starred: false
title: "Web Push Notifications con Astro y Vercel"
description: "Cómo implementar Web Push Notifications en un sitio Astro desplegado en Vercel — VAPID keys, service workers, gestión de suscripciones y todo lo que puede salir mal."
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
coverAlt: "Web Push Notifications con Astro y Vercel"
lang: es
---

Web Push te permite enviar notificaciones a usuarios incluso cuando no están en tu sitio. Lo agregué a este blog para que los lectores puedan optar por recibir alertas de nuevos posts. La implementación es directa en principio — pero hay suficientes piezas móviles como para que valga la pena recorrerlas todas, incluyendo qué se rompe cuando falta una.

## Cómo funciona Web Push

El flujo tiene cuatro actores:

1. **Navegador** — se suscribe a un push service y te da su endpoint
2. **Push service** — el servidor del vendor del navegador (FCM para Chrome, Mozilla para Firefox) que entrega el mensaje
3. **Tu servidor** — envía el mensaje al push service
4. **Service worker** — recibe el evento push y muestra la notificación

Nunca hablás directamente con el navegador del usuario. Enviás un mensaje al push service, que lo entrega al navegador, que despierta al service worker.

### VAPID keys

VAPID (Voluntary Application Server Identification) es cómo probás al push service que sos quien creó la suscripción. Generás un par de claves pública/privada una vez y mantenés la privada secreta.

```bash
bunx web-push generate-vapid-keys
```

Esto te da dos valores:
- `VAPID_PUBLIC_KEY` — compartida con el navegador al suscribirse
- `VAPID_PRIVATE_KEY` — usada del lado del servidor para firmar mensajes, nunca expuesta

## Configuración del entorno

En `astro.config.mjs`, declarar las env vars de VAPID con el sistema de env tipado de Astro:

```javascript
VAPID_PUBLIC_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
VAPID_PRIVATE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
VAPID_SUBJECT: envField.string({ context: 'server', access: 'public', optional: true }),
```

`VAPID_PUBLIC_KEY` es `context: 'client'` porque el navegador la necesita para crear la suscripción. `VAPID_PRIVATE_KEY` es `context: 'server'` — nunca sale del servidor.

Agregar ambas a las variables de entorno de Vercel. Sin ellas, el endpoint de la key VAPID devuelve 503 y las suscripciones fallan silenciosamente.

## El flujo de suscripción

### Paso 1: Servir la clave VAPID pública

```typescript
// src/pages/api/push/vapid-key.json.ts
export const GET: APIRoute = async () => {
  if (!VAPID_PUBLIC_KEY) {
    return new Response(JSON.stringify({ error: 'Not configured' }), { status: 503 })
  }
  return new Response(JSON.stringify({ vapidKey: VAPID_PUBLIC_KEY }))
}
```

### Paso 2: Suscripción del lado del cliente

```typescript
const res = await fetch('/api/push/vapid-key.json')
const { vapidKey } = await res.json()

const reg = await navigator.serviceWorker.ready
const subscription = await reg.pushManager.subscribe({
  userVisibleOnly: true,  // obligatorio en Chrome
  applicationServerKey: urlBase64ToUint8Array(vapidKey),
})

await fetch('/api/push/subscribe.json', {
  method: 'POST',
  body: JSON.stringify({ endpoint: subscription.endpoint, keys: subscription.toJSON().keys }),
})
```

### Paso 3: Guardar la suscripción en la base de datos

```typescript
await db.insert(pushSubscriptions).values({
  endpoint, p256dh: keys.p256dh, auth: keys.auth,
  lang, userId: locals.user?.id ?? null,
})
```

### Paso 4: Service worker recibe eventos push

```javascript
self.addEventListener('push', event => {
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/favicon-96x96.png',
      data: { url: data.url },
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  }
})
```

### Paso 5: Enviar un broadcast desde el servidor

```typescript
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

for (const sub of activeSubscriptions) {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify({ title, body, url }),
    )
  } catch (err: any) {
    // 410 Gone = suscripción expirada, marcar inactiva
    if (err.statusCode === 410) {
      await db.update(pushSubscriptions)
        .set({ isActive: false })
        .where(eq(pushSubscriptions.endpoint, sub.endpoint))
    }
  }
}
```

## Qué sale mal

### VAPID keys faltantes → 503

Si `VAPID_PUBLIC_KEY` no está en Vercel, el endpoint devuelve 503. La suscripción falla silenciosamente.

**Debug**: abrir DevTools Network, hacer click en el toggle de notificaciones, ver si la request de la VAPID key devuelve 503.

### `userVisibleOnly: true` es obligatorio

Chrome requiere `userVisibleOnly: true` en el `subscribe()`. Sin ello, la suscripción falla con `DOMException`.

### 410 Gone significa suscripción muerta

Cuando el push service devuelve 410, el usuario revocó el permiso o la suscripción expiró. Marcar `isActive: false` inmediatamente — reintentar una suscripción 410 desperdicia recursos.

### Safari en iOS requiere un gesto del usuario

En iOS, `Notification.requestPermission()` debe llamarse dentro de un handler de interacción directa del usuario. Llamarlo en page load o después de un delay asíncrono falla silenciosamente.

## Resumen

| Qué | Dónde |
|-----|-------|
| VAPID keys | Variables de entorno de Vercel |
| Endpoint clave pública | `/api/push/vapid-key.json` |
| Endpoint suscripción | `/api/push/subscribe.json` |
| Storage | Postgres via Drizzle |
| Handler de eventos push | `public/service-worker.js` |
| Endpoint broadcast | `/api/push/broadcast.json` |
| UI admin | `/admin/notifications` |

El principal modo de falla siempre es el mismo: una variable de entorno faltante o un problema de registro del service worker. Revisar esas dos primero antes de ir a buscar el problema en otro lugar.
