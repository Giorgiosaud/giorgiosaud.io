import { createAuthClient } from 'better-auth/client'
import { BETTER_AUTH_URL } from 'astro:env/client'

export const authClient = createAuthClient({
  baseURL: BETTER_AUTH_URL,
})

// Re-export commonly used methods
export const {
  signIn,
  signOut,
  useSession,
  getSession,
} = authClient
