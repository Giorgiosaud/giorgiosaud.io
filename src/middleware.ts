import { defineMiddleware, sequence } from 'astro:middleware'
import { db } from '@db'
import { users } from '@db/schema'
import { auth } from '@lib/auth'
import { eq } from 'drizzle-orm'

// Auth middleware - only runs for server-rendered requests
const authMiddleware = defineMiddleware(async (context, next) => {
  // Default to no auth
  context.locals.session = null
  context.locals.user = null

  // Skip auth for prerendered pages (headers not available during SSG)
  if (context.isPrerendered) {
    return next()
  }

  // Get session from Better Auth for server-rendered requests
  const session = await auth.api.getSession({
    headers: context.request.headers,
  })

  context.locals.session = session?.session ?? null
  context.locals.user = session?.user ?? null

  return next()
})

// Ban expiry check middleware - auto-unban users when ban expires
const banCheckMiddleware = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) {
    return next()
  }

  const user = context.locals.user as {
    id: string
    banned?: boolean
    banExpires?: Date
  } | null

  // Check if user has an expired temporary ban
  if (user?.banned && user.banExpires) {
    const banExpiry = new Date(user.banExpires)
    if (banExpiry <= new Date()) {
      // Ban has expired, auto-unban
      await db
        .update(users)
        .set({
          banned: false,
          banReason: null,
          banExpires: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))

      // Update local user state
      user.banned = false
    }
  }

  return next()
})

// Admin protection middleware
const adminMiddleware = defineMiddleware(async (context, next) => {
  // Skip for prerendered pages
  if (context.isPrerendered) {
    return next()
  }

  if (context.url.pathname.startsWith('/admin')) {
    const user = context.locals.user

    if (!user) {
      return context.redirect('/')
    }

    const userRole = user.role as string | undefined
    if (userRole !== 'admin') {
      return context.redirect('/')
    }
  }

  return next()
})

// Dashboard protection middleware - requires authenticated user
const dashboardMiddleware = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) {
    return next()
  }

  const isDashboard =
    context.url.pathname.startsWith('/dashboard') ||
    context.url.pathname.startsWith('/es/panel')

  if (isDashboard && !context.locals.user) {
    return context.redirect(
      context.url.pathname.startsWith('/es') ? '/es' : '/',
    )
  }

  return next()
})

export const onRequest = sequence(
  authMiddleware,
  banCheckMiddleware,
  adminMiddleware,
  dashboardMiddleware,
)
