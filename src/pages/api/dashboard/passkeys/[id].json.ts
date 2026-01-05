import { db } from '@db'
import { passkeys } from '@db/schema'
import type { APIRoute } from 'astro'
import { and, eq } from 'drizzle-orm'

export const prerender = false

// DELETE /api/dashboard/passkeys/[id].json - Delete a passkey
export const DELETE: APIRoute = async ({ params, locals }) => {
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
        error: 'Passkey ID required',
      },
      {
        status: 400,
      },
    )
  }

  try {
    // Verify passkey belongs to user and delete
    const deleted = await db
      .delete(passkeys)
      .where(and(eq(passkeys.id, id), eq(passkeys.userId, locals.user.id)))
      .returning({
        id: passkeys.id,
      })

    if (deleted.length === 0) {
      return Response.json(
        {
          error: 'Passkey not found',
        },
        {
          status: 404,
        },
      )
    }

    return Response.json({
      success: true,
    })
  } catch (error) {
    console.error('Failed to delete passkey:', error)
    return Response.json(
      {
        error: 'Failed to delete passkey',
      },
      {
        status: 500,
      },
    )
  }
}
