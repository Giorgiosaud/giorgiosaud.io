import type { APIRoute } from 'astro'
import { auth } from '@lib/auth'

export const prerender = false

// Handle all HTTP methods for Better Auth
export const ALL: APIRoute = async ctx => {
  return auth.handler(ctx.request)
}
