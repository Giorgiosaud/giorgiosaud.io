import { isPushConfigured, sendPushToUser } from '@lib/push-notifications'
import type { APIRoute } from 'astro'

export const prerender = false

// POST /api/push/test.json - Send a test notification (requires auth)
export const POST: APIRoute = async ({ locals }) => {
  // Must be logged in
  if (!locals.user) {
    return Response.json(
      {
        error: 'Authentication required',
      },
      {
        status: 401,
      },
    )
  }

  if (!isPushConfigured()) {
    return Response.json(
      {
        error: 'Push notifications not configured. Add VAPID keys to .env',
      },
      {
        status: 503,
      },
    )
  }

  try {
    const result = await sendPushToUser(locals.user.id, {
      title: 'Test Notification',
      body: 'If you see this, push notifications are working!',
      icon: '/favicon.svg',
      tag: 'test-notification',
      data: {
        url: '/',
        type: 'test',
      },
    })

    if (result.sent === 0 && result.failed === 0) {
      return Response.json(
        {
          error:
            'No active subscriptions found. Enable notifications in your profile menu first.',
          result,
        },
        {
          status: 404,
        },
      )
    }

    return Response.json({
      success: true,
      message: `Sent ${result.sent} notification(s)`,
      result,
    })
  } catch (error) {
    console.error('Test notification error:', error)
    return Response.json(
      {
        error: 'Failed to send test notification',
      },
      {
        status: 500,
      },
    )
  }
}
