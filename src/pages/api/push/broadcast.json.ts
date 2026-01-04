import type { APIRoute } from 'astro'
import { broadcastNotification, sendNewPostNotification, isPushConfigured } from '@lib/push-notifications'
import type { User } from 'better-auth/types'

export const prerender = false

// Check if user is admin
function isAdmin(user: User | null): boolean {
  return (user as (User & { role?: string }) | null)?.role === 'admin'
}

// POST /api/push/broadcast.json - Send notification to all subscribers (admin only)
export const POST: APIRoute = async ({ request, locals }) => {
  // Must be logged in as admin
  if (!locals.user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  if (!isAdmin(locals.user)) {
    return Response.json({ error: 'Admin access required' }, { status: 403 })
  }

  if (!isPushConfigured()) {
    return Response.json({ error: 'Push notifications not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { type, title, body: messageBody, postSlug, postTitle, postExcerpt } = body

    let result: { sent: number; failed: number }

    if (type === 'new-post') {
      // New post notification
      if (!postSlug || !postTitle) {
        return Response.json({ error: 'postSlug and postTitle required for new-post type' }, { status: 400 })
      }
      result = await sendNewPostNotification(postTitle, postSlug, postExcerpt)
    } else if (type === 'custom') {
      // Custom broadcast
      if (!title || !messageBody) {
        return Response.json({ error: 'title and body required for custom type' }, { status: 400 })
      }
      result = await broadcastNotification({
        title,
        body: messageBody,
        icon: '/favicon.svg',
        tag: `broadcast-${Date.now()}`,
        data: { url: '/', type: 'broadcast' },
      })
    } else {
      return Response.json({ error: 'Invalid type. Use "new-post" or "custom"' }, { status: 400 })
    }

    return Response.json({
      success: true,
      message: `Broadcast sent to ${result.sent} subscriber(s)`,
      result,
    })
  } catch (error) {
    console.error('Broadcast error:', error)
    return Response.json({ error: 'Failed to send broadcast' }, { status: 500 })
  }
}
