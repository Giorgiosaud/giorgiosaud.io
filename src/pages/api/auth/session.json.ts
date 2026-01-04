import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ locals }) => {
  // Return current session state from middleware
  return Response.json({
    authenticated: !!locals.user,
    user: locals.user
      ? {
          id: locals.user.id,
          name: locals.user.name,
          email: locals.user.email,
          image: locals.user.image,
          role: locals.user.role ?? 'user',
        }
      : null,
    session: locals.session
      ? {
          id: locals.session.id,
          expiresAt: locals.session.expiresAt,
        }
      : null,
  })
}
