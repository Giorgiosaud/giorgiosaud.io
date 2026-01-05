import { db } from '@db'
import { badges, comments, userBadges, userProfiles, users } from '@db/schema'
import { getPublishedNotes } from '@helpers/collections'
import type { APIRoute } from 'astro'
import { and, desc, eq, isNull } from 'drizzle-orm'

export const prerender = false

// GET /api/users/[username].json - Get public profile data
export const GET: APIRoute = async ({ params }) => {
  const { username } = params

  if (!username) {
    return Response.json(
      {
        error: 'Username required',
      },
      {
        status: 400,
      },
    )
  }

  try {
    // Find user by username (case-insensitive)
    const userData = await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
        username: users.username,
        displayUsername: users.displayUsername,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
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

    const user = userData[0]

    // Get profile data
    const profileData = await db
      .select({
        displayName: userProfiles.displayName,
        bio: userProfiles.bio,
        website: userProfiles.website,
      })
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1)

    const profile = profileData[0] || {
      displayName: null,
      bio: null,
      website: null,
    }

    // Get user's approved public comments (limit to recent 10)
    const userComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        noteSelfHealing: comments.noteSelfHealing,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .where(
        and(
          eq(comments.userId, user.id),
          eq(comments.isApproved, true),
          isNull(comments.deletedAt),
        ),
      )
      .orderBy(desc(comments.createdAt))
      .limit(10)

    // Get note info for comments
    const enNotes = await getPublishedNotes('en')
    const esNotes = await getPublishedNotes('es')

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

    const enrichedComments = userComments.map(comment => {
      const noteInfo = noteMap.get(comment.noteSelfHealing)
      return {
        id: comment.id,
        content:
          comment.content.length > 200
            ? `${comment.content.substring(0, 200)}...`
            : comment.content,
        createdAt: comment.createdAt,
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

    // Get user badges
    const earnedBadges = await db
      .select({
        id: badges.id,
        name: badges.name,
        description: badges.description,
        icon: badges.icon,
        color: badges.color,
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, user.id))
      .orderBy(desc(userBadges.earnedAt))

    return Response.json({
      user: {
        name: user.name,
        image: user.image,
        username: user.displayUsername || user.username,
        createdAt: user.createdAt,
      },
      profile: {
        displayName: profile.displayName,
        bio: profile.bio,
        website: profile.website,
      },
      badges: earnedBadges,
      recentComments: enrichedComments,
    })
  } catch (error) {
    console.error('Failed to get public profile:', error)
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
