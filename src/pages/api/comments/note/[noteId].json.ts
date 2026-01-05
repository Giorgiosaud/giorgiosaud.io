import type { APIRoute } from 'astro'
import { db } from '@db'
import { comments, users } from '@db/schema'
import { eq, and, isNull, asc } from 'drizzle-orm'

export const prerender = false

// GET /api/comments/[noteId].json - List comments for a note
export const GET: APIRoute = async ({ params }) => {
  const { noteId } = params

  if (!noteId) {
    return Response.json({ error: 'Note ID required' }, { status: 400 })
  }

  try {
    // Fetch all non-deleted comments for this note with author info
    const noteComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        parentId: comments.parentId,
        depth: comments.depth,
        userId: comments.userId,
        isEdited: comments.isEdited,
        createdAt: comments.createdAt,
        editedAt: comments.editedAt,
        authorName: users.name,
        authorImage: users.image,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(
        and(
          eq(comments.noteSelfHealing, noteId),
          isNull(comments.deletedAt),
          eq(comments.isApproved, true)
        )
      )
      .orderBy(asc(comments.createdAt))

    // Build threaded structure
    const threaded = buildThreadedComments(noteComments)

    return Response.json({
      comments: threaded,
      total: noteComments.length,
    })
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return Response.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

interface Comment {
  id: string
  content: string
  parentId: string | null
  depth: number
  userId: string
  isEdited: boolean
  createdAt: Date
  editedAt: Date | null
  authorName: string | null
  authorImage: string | null
  replies?: Comment[]
}

function buildThreadedComments(flatComments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>()
  const rootComments: Comment[] = []

  // First pass: create map and initialize replies array
  for (const comment of flatComments) {
    commentMap.set(comment.id, { ...comment, replies: [] })
  }

  // Second pass: build tree structure
  for (const comment of flatComments) {
    const mappedComment = commentMap.get(comment.id)!
    if (comment.parentId && commentMap.has(comment.parentId)) {
      commentMap.get(comment.parentId)!.replies!.push(mappedComment)
    } else {
      rootComments.push(mappedComment)
    }
  }

  return rootComments
}
