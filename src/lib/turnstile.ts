import { TURNSTILE_SECRET_KEY } from 'astro:env/server'

/** Verifies a Cloudflare Turnstile token server-side. Skips when no secret is configured (local dev). */
export async function verifyTurnstile(token: string): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) return true

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET_KEY,
          response: token,
        }),
      },
    )
    const data = (await response.json()) as {
      success?: boolean
    }
    return data.success === true
  } catch (error) {
    console.error('Turnstile verification failed:', error)
    return false
  }
}
