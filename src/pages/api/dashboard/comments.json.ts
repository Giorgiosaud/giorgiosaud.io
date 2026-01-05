import { db } from '@db'
import { comments } from '@db/schema'
import { getPublishedNotes } from '@helpers/collections'
import type { APIRoute } from 'astro'
import { desc, eq } from 'drizzle-orm'

export const prerender = false

// GET /api/dashboard/comments.json - Get user's comments with note info
export const GET: APIRoute = async ({ locals }) => {
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

  try {
    // Get user's comments
    const userComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        noteSelfHealing: comments.noteSelfHealing,
        isApproved: comments.isApproved,
        isEdited: comments.isEdited,
        createdAt: comments.createdAt,
        deletedAt: comments.deletedAt,
      })
      .from(comments)
      .where(eq(comments.userId, locals.user.id))
      .orderBy(desc(comments.createdAt))

    // Get note titles for self-healing codes
    // Try to get notes in English first, fallback to Spanish
    const enNotes = await getPublishedNotes('en')
    const esNotes = await getPublishedNotes('es')

    // Build a map of selfHealing -> note info
    const noteMap = new Map<
      string,
      {
        title: string
        slug: string
        lang: string
      }
    >()

    for (const note of enNotes) {
      if (note.data.selfHealing) {
        noteMap.set(note.data.selfHealing, {
          title: note.data.title,
          slug: note.id,
          lang: 'en',
        })
      }
    }

    for (const note of esNotes) {
      if (note.data.selfHealing && !noteMap.has(note.data.selfHealing)) {
        noteMap.set(note.data.selfHealing, {
          title: note.data.title,
          slug: note.id,
          lang: 'es',
        })
      }
    }

    // Enrich comments with note info
    const enrichedComments = userComments.map(comment => {
      const noteInfo = noteMap.get(comment.noteSelfHealing)
      return {
        ...comment,
        note: noteInfo
          ? {
              title: noteInfo.title,
              url:
                noteInfo.lang === 'en'
                  ? `/notebook/${noteInfo.slug}`
                  : `/es/cuaderno/${noteInfo.slug}`,
            }
          : null,
      }
    })

    return Response.json({
      comments: enrichedComments,
    })
  } catch (error) {
    console.error('Failed to get comments:', error)
    return Response.json(
      {
        error: 'Failed to get comments',
      },
      {
        status: 500,
      },
    )
  }
}
