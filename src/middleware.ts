import { defineMiddleware } from 'astro:middleware'
import { auth } from '@lib/auth'

export const onRequest = defineMiddleware(async (context, next) => {
  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: context.request.headers,
  })

  // Attach to Astro.locals for use in pages/components
  context.locals.session = session?.session ?? null
  context.locals.user = session?.user ?? null

  // Protect admin routes
  if (context.url.pathname.startsWith('/admin')) {
    if (!session?.user) {
      // Redirect to home if not authenticated
      return context.redirect('/')
    }

    // Check for admin role
    const userRole = session.user.role as string | undefined
    if (userRole !== 'admin') {
      // Redirect to home if not admin
      return context.redirect('/')
    }
  }

  return next()
})
