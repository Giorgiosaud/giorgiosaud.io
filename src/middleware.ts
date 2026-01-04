import { defineMiddleware, sequence } from 'astro:middleware'
import { auth } from '@lib/auth'

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

export const onRequest = sequence(authMiddleware, adminMiddleware)
