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
  // Debug: log all possible sources of URL/query params
  console.log('[AUTH DEBUG GET] ctx.request.url:', ctx.request.url)
  console.log('[AUTH DEBUG GET] ctx.url.href:', ctx.url.href)

  // Check headers for original URL
  const headers: Record<string, string> = {}
  ctx.request.headers.forEach((v, k) => {
    headers[k] = v
  })
  console.log('[AUTH DEBUG GET] Headers:', JSON.stringify(headers, null, 2))

  // Check if Astro has the original URL somewhere
  console.log('[AUTH DEBUG GET] ctx.params:', JSON.stringify(ctx.params))

  // Try to get URL from x-forwarded headers or referer
  const xUrl = ctx.request.headers.get('x-url')
  const xOriginalUrl = ctx.request.headers.get('x-original-url')
  const xInvokeQuery = ctx.request.headers.get('x-invoke-query')
  console.log('[AUTH DEBUG GET] x-url:', xUrl)
  console.log('[AUTH DEBUG GET] x-original-url:', xOriginalUrl)
  console.log('[AUTH DEBUG GET] x-invoke-query:', xInvokeQuery)

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
