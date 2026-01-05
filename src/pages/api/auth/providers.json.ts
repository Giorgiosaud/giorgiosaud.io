import type { APIRoute } from 'astro'
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
} from 'astro:env/server'

export const prerender = false

// Returns which social auth providers are configured
export const GET: APIRoute = async () => {
  const providers = {
    github: !!(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET),
    google: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
    facebook: !!(FACEBOOK_CLIENT_ID && FACEBOOK_CLIENT_SECRET),
  }

  return new Response(JSON.stringify(providers), {
    headers: { 'Content-Type': 'application/json' },
  })
}
