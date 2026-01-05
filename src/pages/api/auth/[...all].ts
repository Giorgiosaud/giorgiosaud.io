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
  console.log('[AUTH DEBUG GET] ctx.request.url:', ctx.request.url)
  console.log('[AUTH DEBUG GET] ctx.url.href:', ctx.url.href)
  console.log('[AUTH DEBUG GET] ctx.url.search:', ctx.url.search)
  console.log(
    '[AUTH DEBUG GET] State from ctx.url:',
    ctx.url.searchParams.get('state'),
  )

  // If request.url is missing query params, reconstruct it
  const fullUrl = ctx.url.href
  const request = new Request(fullUrl, {
    method: ctx.request.method,
    headers: ctx.request.headers,
    body: ctx.request.body,
    // @ts-expect-error - duplex is needed for streaming bodies
    duplex: 'half',
  })

  return auth.handler(request)
}

export const POST: APIRoute = async ctx => {
  return auth.handler(ctx.request)
}
