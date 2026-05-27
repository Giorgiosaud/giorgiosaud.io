import { defineMiddleware, sequence } from 'astro:middleware'
import selfhealMapData from './generated/selfheal-map.json'

const selfHealMap = new Map<string, string>(Object.entries(selfhealMapData))

const selfHealRegex = /(?:^|-)[b-df-hj-np-tv-z]{6}(?:-|$)/g

const selfhealMiddleware = defineMiddleware((context, next) => {
  const { pathname } = context.url
  const isEs = pathname.startsWith('/es/cuaderno/')
  const isEn = pathname.startsWith('/notebook/')
  if (!isEn && !isEs) return next()

  const segment = isEs
    ? pathname.replace('/es/cuaderno/', '')
    : pathname.replace('/notebook/', '')

  const match = segment.match(selfHealRegex)
  if (!match) return next()

  const code = match[0].replace(/-/g, '')
  const key = isEs ? `es:${code}` : code
  const destination = selfHealMap.get(key)
  if (destination) return context.redirect(destination, 301)

  return next()
})

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
  try {
    const session = await auth.api.getSession({
      headers: context.request.headers,
    })
    context.locals.session = session?.session ?? null
    context.locals.user = session?.user ?? null
  } catch {
    // DB unavailable or auth misconfigured — treat as unauthenticated
    context.locals.session = null
    context.locals.user = null
  }

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
  selfhealMiddleware,
  authMiddleware,
  banCheckMiddleware,
  adminMiddleware,
  dashboardMiddleware,
)
