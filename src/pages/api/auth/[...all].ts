import { auth } from '@lib/auth'
import type { APIRoute } from 'astro'

export const prerender = false

// Helper to ensure request URL includes query params
// (Vercel ISR was stripping them, using ctx.url preserves them)
function createRequestWithFullUrl(ctx: Parameters<APIRoute>[0]) {
  return new Request(ctx.url.href, {
    method: ctx.request.method,
    headers: ctx.request.headers,
    body: ctx.request.body,
    // @ts-expect-error - duplex is needed for streaming bodies
    duplex: 'half',
  })
}

export const GET: APIRoute = async ctx => {
  return auth.handler(createRequestWithFullUrl(ctx))
}

export const POST: APIRoute = async ctx => {
  return auth.handler(createRequestWithFullUrl(ctx))
}

// Fallback for other methods
export const ALL: APIRoute = async ctx => {
  return auth.handler(createRequestWithFullUrl(ctx))
}
