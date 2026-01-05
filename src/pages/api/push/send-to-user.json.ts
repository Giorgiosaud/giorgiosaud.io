import { isPushConfigured, sendPushToUser } from '@lib/push-notifications'
import type { APIRoute } from 'astro'
import type { User } from 'better-auth/types'

export const prerender = false

function isAdmin(user: User | null): boolean {
  return (
    (
      user as
        | (User & {
            role?: string
          })
        | null
    )?.role === 'admin'
  )
}

// POST /api/push/send-to-user.json - Send notification to specific user (admin only)
export const POST: APIRoute = async ({ request, locals }) => {
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

  if (!isAdmin(locals.user)) {
    return Response.json(
      {
        error: 'Admin access required',
      },
      {
        status: 403,
      },
    )
  }

  if (!isPushConfigured()) {
    return Response.json(
      {
        error: 'Push notifications not configured',
      },
      {
        status: 503,
      },
    )
  }

  try {
    const body = await request.json()
    const { userId, title, body: messageBody, url } = body

    if (!userId || !title || !messageBody) {
      return Response.json(
        {
          error: 'userId, title, and body are required',
        },
        {
          status: 400,
        },
      )
    }

    const result = await sendPushToUser(userId, {
      title,
      body: messageBody,
      icon: '/favicon.svg',
      tag: `admin-notify-${Date.now()}`,
      data: {
        url: url || '/',
        type: 'admin-notification',
      },
    })

    if (result.sent === 0 && result.failed === 0) {
      return Response.json(
        {
          error: 'User has no active push subscriptions',
          result,
        },
        {
          status: 404,
        },
      )
    }

    return Response.json({
      success: true,
      message: `Sent to ${result.sent} device(s)`,
      result,
    })
  } catch (error) {
    console.error('Send to user error:', error)
    return Response.json(
      {
        error: 'Failed to send notification',
      },
      {
        status: 500,
      },
    )
  }
}
