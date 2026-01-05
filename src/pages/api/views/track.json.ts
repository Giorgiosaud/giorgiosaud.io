import { db } from '@db'
import { postViews } from '@db/schema'
import type { APIRoute } from 'astro'

export const prerender = false

// Event types supported by the tracking API
type TrackEventType =
  | 'scroll_depth'
  | 'page_view'
  | 'engagement'
  | 'click'
  | 'video'
  | 'custom'

interface TrackEvent {
  type: TrackEventType
  noteId: string
  // Common fields
  language?: string
  sessionId?: string
  // Scroll tracking
  scrollDepth?: number
  viewDuration?: number
  // Click tracking (future)
  elementId?: string
  elementType?: string
  // Video tracking (future)
  videoId?: string
  videoProgress?: number
  // Custom data (extensible)
  metadata?: Record<string, unknown>
}

// Validate scroll depth event
function validateScrollEvent(event: TrackEvent): string | null {
  if (
    typeof event.scrollDepth !== 'number' ||
    event.scrollDepth < 0 ||
    event.scrollDepth > 1
  ) {
    return 'Invalid scroll depth (must be 0-1)'
  }
  return null
}

// Validate based on event type
function validateEvent(event: TrackEvent): string | null {
  if (!event.noteId || typeof event.noteId !== 'string') {
    return 'Note ID required'
  }

  if (!event.type) {
    return 'Event type required'
  }

  switch (event.type) {
    case 'scroll_depth':
      return validateScrollEvent(event)
    case 'page_view':
    case 'engagement':
    case 'click':
    case 'video':
    case 'custom':
      // Basic validation - can be extended per type
      return null
    default:
      return `Unknown event type: ${event.type}`
  }
}

// POST /api/views/track.json - Record tracking events (extensible)
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = (await request.json()) as TrackEvent

    // Validate event
    const error = validateEvent(body)
    if (error) {
      return Response.json(
        {
          error,
        },
        {
          status: 400,
        },
      )
    }

    // Handle different event types
    switch (body.type) {
      case 'scroll_depth':
      case 'page_view':
      case 'engagement': {
        // Record to post_views table
        await db.insert(postViews).values({
          noteSelfHealing: body.noteId,
          userId: locals.user?.id || null,
          scrollDepth: body.scrollDepth ?? 0,
          viewDuration: body.viewDuration || null,
          language: body.language || 'en',
          sessionId: body.sessionId || null,
          referrer: request.headers.get('referer') || null,
          userAgent: request.headers.get('user-agent') || null,
        })
        break
      }
      case 'click':
      case 'video':
      case 'custom': {
        // Future: store in separate tables or generic events table
        // For now, log and acknowledge
        console.log('Track event:', body.type, body.noteId, body.metadata)
        break
      }
    }

    return Response.json(
      {
        success: true,
        type: body.type,
      },
      {
        status: 201,
      },
    )
  } catch (error) {
    console.error('Failed to track event:', error)
    return Response.json(
      {
        error: 'Failed to track event',
      },
      {
        status: 500,
      },
    )
  }
}
