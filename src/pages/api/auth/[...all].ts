import { auth } from '@lib/auth'
import type { APIRoute } from 'astro'

export const prerender = false

// Handle all HTTP methods for Better Auth
export const ALL: APIRoute = async ctx => {
  const url = new URL(ctx.request.url)
  console.log('[AUTH DEBUG] Request URL:', ctx.request.url)
  console.log('[AUTH DEBUG] State param:', url.searchParams.get('state'))
  return auth.handler(ctx.request)
}

// Explicit handlers for compatibility
export const GET: APIRoute = async ctx => {
  const url = new URL(ctx.request.url)
  console.log('[AUTH DEBUG GET] Request URL:', ctx.request.url)
  console.log('[AUTH DEBUG GET] State param:', url.searchParams.get('state'))
  return auth.handler(ctx.request)
}

export const POST: APIRoute = async ctx => {
  return auth.handler(ctx.request)
}
