import { VAPID_PUBLIC_KEY } from 'astro:env/client'
import type { APIRoute } from 'astro'

export const prerender = false

// Returns public VAPID key for push subscription
export const GET: APIRoute = async () => {
  if (!VAPID_PUBLIC_KEY) {
    return new Response(
      JSON.stringify({
        error: 'Push notifications not configured',
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }

  return new Response(
    JSON.stringify({
      vapidKey: VAPID_PUBLIC_KEY,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}
