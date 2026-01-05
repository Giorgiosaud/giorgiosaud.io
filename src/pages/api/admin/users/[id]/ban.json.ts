import { db } from '@db'
import { users } from '@db/schema'
import type { APIRoute } from 'astro'
import type { User } from 'better-auth/types'
import { eq } from 'drizzle-orm'

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

// POST /api/admin/users/[id]/ban.json - Ban or unban a user
export const POST: APIRoute = async ({ params, request, locals }) => {
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

  const { id } = params
  if (!id) {
    return Response.json(
      {
        error: 'User ID required',
      },
      {
        status: 400,
      },
    )
  }

  // Prevent banning yourself
  if (id === locals.user.id) {
    return Response.json(
      {
        error: 'Cannot ban yourself',
      },
      {
        status: 400,
      },
    )
  }

  try {
    const body = await request.json()
    const { ban, reason, banExpires } = body as {
      ban: boolean
      reason?: string
      banExpires?: string
    }

    if (ban) {
      // Ban user
      await db
        .update(users)
        .set({
          banned: true,
          banReason: reason || 'Banned by admin',
          banExpires: banExpires ? new Date(banExpires) : null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
    } else {
      // Unban user
      await db
        .update(users)
        .set({
          banned: false,
          banReason: null,
          banExpires: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
    }

    return Response.json({
      success: true,
      banned: ban,
    })
  } catch (error) {
    console.error('Failed to update user ban status:', error)
    return Response.json(
      {
        error: 'Failed to update user',
      },
      {
        status: 500,
      },
    )
  }
}
