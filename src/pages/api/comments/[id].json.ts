import { db } from '@db'
import { comments } from '@db/schema'
import type { APIRoute } from 'astro'
import { and, eq, isNull } from 'drizzle-orm'

export const prerender = false

// PUT /api/comments/[id].json - Update a comment
export const PUT: APIRoute = async ({ params, request, locals }) => {
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

  const { id } = params
  if (!id) {
    return Response.json(
      {
        error: 'Comment ID required',
      },
      {
        status: 400,
      },
    )
  }

  try {
    // Find the comment
    const [existing] = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        deletedAt: comments.deletedAt,
      })
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1)

    if (!existing) {
      return Response.json(
        {
          error: 'Comment not found',
        },
        {
          status: 404,
        },
      )
    }

    if (existing.deletedAt) {
      return Response.json(
        {
          error: 'Comment has been deleted',
        },
        {
          status: 410,
        },
      )
    }

    // Check ownership (or admin)
    const isOwner = existing.userId === locals.user.id
    const isAdmin = locals.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return Response.json(
        {
          error: 'Not authorized to edit this comment',
        },
        {
          status: 403,
        },
      )
    }

    const body = await request.json()
    const { content } = body

    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return Response.json(
        {
          error: 'Comment content required',
        },
        {
          status: 400,
        },
      )
    }

    if (content.length > 5000) {
      return Response.json(
        {
          error: 'Comment too long (max 5000 characters)',
        },
        {
          status: 400,
        },
      )
    }

    // Update the comment
    const [updated] = await db
      .update(comments)
      .set({
        content: content.trim(),
        isEdited: true,
        editedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning({
        id: comments.id,
        content: comments.content,
        isEdited: comments.isEdited,
        editedAt: comments.editedAt,
      })

    return Response.json({
      comment: updated,
    })
  } catch (error) {
    console.error('Failed to update comment:', error)
    return Response.json(
      {
        error: 'Failed to update comment',
      },
      {
        status: 500,
      },
    )
  }
}

// DELETE /api/comments/[id].json - Soft delete a comment
export const DELETE: APIRoute = async ({ params, request, locals }) => {
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

  const { id } = params
  if (!id) {
    return Response.json(
      {
        error: 'Comment ID required',
      },
      {
        status: 400,
      },
    )
  }

  try {
    // Find the comment
    const [existing] = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        deletedAt: comments.deletedAt,
      })
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1)

    if (!existing) {
      return Response.json(
        {
          error: 'Comment not found',
        },
        {
          status: 404,
        },
      )
    }

    if (existing.deletedAt) {
      return Response.json(
        {
          error: 'Comment already deleted',
        },
        {
          status: 410,
        },
      )
    }

    // Check ownership (or admin)
    const isOwner = existing.userId === locals.user.id
    const isAdmin = locals.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return Response.json(
        {
          error: 'Not authorized to delete this comment',
        },
        {
          status: 403,
        },
      )
    }

    // Get optional reason from body
    let reason: string | undefined
    try {
      const body = await request.json()
      reason = body.reason
    } catch {
      // No body provided, that's fine
    }

    // Soft delete
    await db
      .update(comments)
      .set({
        deletedAt: new Date(),
        deletedBy: locals.user.id,
        deletedReason:
          reason || (isAdmin && !isOwner ? 'Removed by moderator' : null),
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))

    return Response.json({
      success: true,
    })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return Response.json(
      {
        error: 'Failed to delete comment',
      },
      {
        status: 500,
      },
    )
  }
}
