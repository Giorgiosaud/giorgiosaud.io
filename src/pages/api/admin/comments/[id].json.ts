import type { APIRoute } from 'astro'
import { db } from '@db'
import { eq } from 'drizzle-orm'
import { comments } from '@db/schema'
import type { User } from 'better-auth/types'

export const prerender = false

function isAdmin(user: User | null): boolean {
  return (user as (User & { role?: string }) | null)?.role === 'admin'
}

// DELETE /api/admin/comments/[id].json - Soft delete a comment
export const DELETE: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  if (!isAdmin(locals.user)) {
    return Response.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { id } = params
  if (!id) {
    return Response.json({ error: 'Comment ID required' }, { status: 400 })
  }

  try {
    // Soft delete by setting deletedAt
    await db.update(comments)
      .set({
        deletedAt: new Date(),
        deletedBy: locals.user.id,
        deletedReason: 'Deleted by admin',
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))

    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return Response.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
