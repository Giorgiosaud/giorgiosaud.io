import type { APIRoute } from 'astro'
import { db } from '@db'
import { comments } from '@db/schema'
import { eq, and, isNull } from 'drizzle-orm'

export const prerender = false

const MAX_DEPTH = 3 // Limit reply nesting

// POST /api/comments.json - Create a new comment
export const POST: APIRoute = async ({ request, locals }) => {
  // Check authentication
  if (!locals.user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { noteId, content, parentId } = body

    // Validate required fields
    if (!noteId || typeof noteId !== 'string') {
      return Response.json({ error: 'Note ID required' }, { status: 400 })
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return Response.json({ error: 'Comment content required' }, { status: 400 })
    }

    if (content.length > 5000) {
      return Response.json({ error: 'Comment too long (max 5000 characters)' }, { status: 400 })
    }

    // Calculate depth if replying
    let depth = 0
    if (parentId) {
      const parentComment = await db
        .select({ depth: comments.depth })
        .from(comments)
        .where(
          and(
            eq(comments.id, parentId),
            isNull(comments.deletedAt)
          )
        )
        .limit(1)

      if (parentComment.length === 0) {
        return Response.json({ error: 'Parent comment not found' }, { status: 404 })
      }

      depth = parentComment[0].depth + 1

      if (depth > MAX_DEPTH) {
        return Response.json(
          { error: `Maximum reply depth (${MAX_DEPTH}) exceeded` },
          { status: 400 }
        )
      }
    }

    // Create the comment
    const [newComment] = await db
      .insert(comments)
      .values({
        noteSelfHealing: noteId,
        content: content.trim(),
        parentId: parentId || null,
        depth,
        userId: locals.user.id,
        isApproved: true, // Auto-approve for now
      })
      .returning({
        id: comments.id,
        content: comments.content,
        parentId: comments.parentId,
        depth: comments.depth,
        userId: comments.userId,
        createdAt: comments.createdAt,
      })

    return Response.json({
      comment: {
        ...newComment,
        isEdited: false,
        editedAt: null,
        replies: [],
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return Response.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
