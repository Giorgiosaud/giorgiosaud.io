import { createAuthClient } from 'better-auth/client'
import { adminClient } from 'better-auth/client/plugins'
import { passkeyClient } from '@better-auth/passkey/client'
import { BETTER_AUTH_URL } from 'astro:env/client'

// Detect base URL: use env var, or fall back to current origin
function getBaseURL(): string {
  if (BETTER_AUTH_URL) return BETTER_AUTH_URL
  if (typeof window !== 'undefined') return window.location.origin
  return 'http://localhost:4321'
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [adminClient(), passkeyClient()],
})

// Re-export commonly used methods
export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
  passkey,
} = authClient
