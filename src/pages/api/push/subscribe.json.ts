import { db } from '@db'
import { pushSubscriptions } from '@db/schema'
import type { APIRoute } from 'astro'
import { eq } from 'drizzle-orm'

export const prerender = false

interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  expirationTime?: number | null
}

// Subscribe to push notifications
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = (await request.json()) as PushSubscriptionData

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return new Response(
        JSON.stringify({
          error: 'Invalid subscription data',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }

    const userId = locals.user?.id || null
    const userAgent = request.headers.get('user-agent') || null

    // Check if subscription already exists
    const existing = await db.query.pushSubscriptions.findFirst({
      where: eq(pushSubscriptions.endpoint, body.endpoint),
    })

    if (existing) {
      // Update existing subscription
      await db
        .update(pushSubscriptions)
        .set({
          userId,
          p256dh: body.keys.p256dh,
          auth: body.keys.auth,
          expirationTime: body.expirationTime
            ? new Date(body.expirationTime)
            : null,
          userAgent,
          isActive: true,
          failureCount: 0,
          lastError: null,
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.endpoint, body.endpoint))

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Subscription updated',
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }

    // Create new subscription
    await db.insert(pushSubscriptions).values({
      userId,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      expirationTime: body.expirationTime
        ? new Date(body.expirationTime)
        : null,
      userAgent,
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscribed successfully',
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Push subscription error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to subscribe',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
}

// Unsubscribe from push notifications
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as {
      endpoint: string
    }

    if (!body.endpoint) {
      return new Response(
        JSON.stringify({
          error: 'Endpoint required',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }

    // Mark subscription as inactive instead of deleting
    const result = await db
      .update(pushSubscriptions)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(pushSubscriptions.endpoint, body.endpoint))

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Unsubscribed successfully',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Push unsubscribe error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to unsubscribe',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
}
