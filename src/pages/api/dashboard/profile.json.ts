import { db } from '@db'
import { userProfiles, users } from '@db/schema'
import type { APIRoute } from 'astro'
import { eq } from 'drizzle-orm'

export const prerender = false

// GET /api/dashboard/profile.json - Get current user's profile
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
    // Get user data with username from auth
    const userData = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        username: users.username,
        displayUsername: users.displayUsername,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, locals.user.id))
      .limit(1)

    if (userData.length === 0) {
      return Response.json(
        {
          error: 'User not found',
        },
        {
          status: 404,
        },
      )
    }

    // Get profile data
    const profileData = await db
      .select({
        displayName: userProfiles.displayName,
        bio: userProfiles.bio,
        website: userProfiles.website,
      })
      .from(userProfiles)
      .where(eq(userProfiles.userId, locals.user.id))
      .limit(1)

    const profile = profileData[0] || {
      displayName: null,
      bio: null,
      website: null,
    }

    return Response.json({
      user: userData[0],
      profile,
    })
  } catch (error) {
    console.error('Failed to get profile:', error)
    return Response.json(
      {
        error: 'Failed to get profile',
      },
      {
        status: 500,
      },
    )
  }
}

// PUT /api/dashboard/profile.json - Update current user's profile
export const PUT: APIRoute = async ({ request, locals }) => {
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
    const body = await request.json()
    const { displayName, bio, website, username } = body

    // Validate website URL if provided
    if (website && typeof website === 'string' && website.trim()) {
      try {
        new URL(website)
      } catch {
        return Response.json(
          {
            error: 'Invalid website URL',
          },
          {
            status: 400,
          },
        )
      }
    }

    // Validate username if provided
    if (username !== undefined) {
      if (username && typeof username === 'string') {
        const trimmed = username.trim()
        if (trimmed.length < 3 || trimmed.length > 30) {
          return Response.json(
            {
              error: 'Username must be between 3 and 30 characters',
            },
            {
              status: 400,
            },
          )
        }
        // Check if username is alphanumeric with underscores
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
          return Response.json(
            {
              error:
                'Username can only contain letters, numbers, and underscores',
            },
            {
              status: 400,
            },
          )
        }
      }

      // Update username via Better Auth (it handles uniqueness check)
      // Note: This uses the auth API directly since username is managed by Better Auth
      const updateResult = await db
        .update(users)
        .set({
          username: username ? username.toLowerCase() : null,
          displayUsername: username || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, locals.user.id))
        .returning({
          username: users.username,
        })
        .catch(err => {
          if (err.code === '23505') {
            // Unique constraint violation
            throw new Error('Username already taken')
          }
          throw err
        })

      if (!updateResult.length) {
        return Response.json(
          {
            error: 'Failed to update username',
          },
          {
            status: 500,
          },
        )
      }
    }

    // Upsert profile data
    await db
      .insert(userProfiles)
      .values({
        userId: locals.user.id,
        displayName: displayName?.trim() || null,
        bio: bio?.trim() || null,
        website: website?.trim() || null,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          displayName: displayName?.trim() || null,
          bio: bio?.trim() || null,
          website: website?.trim() || null,
          updatedAt: new Date(),
        },
      })

    return Response.json({
      success: true,
    })
  } catch (error) {
    console.error('Failed to update profile:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to update profile'
    return Response.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    )
  }
}
