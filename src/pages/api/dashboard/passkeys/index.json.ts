import { db } from '@db'
import { passkeys } from '@db/schema'
import type { APIRoute } from 'astro'
import { eq } from 'drizzle-orm'

export const prerender = false

// GET /api/dashboard/passkeys/index.json - List user's passkeys
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
    const userPasskeys = await db
      .select({
        id: passkeys.id,
        name: passkeys.name,
        deviceType: passkeys.deviceType,
        backedUp: passkeys.backedUp,
        createdAt: passkeys.createdAt,
      })
      .from(passkeys)
      .where(eq(passkeys.userId, locals.user.id))

    return Response.json({
      passkeys: userPasskeys,
    })
  } catch (error) {
    console.error('Failed to list passkeys:', error)
    return Response.json(
      {
        error: 'Failed to list passkeys',
      },
      {
        status: 500,
      },
    )
  }
}
