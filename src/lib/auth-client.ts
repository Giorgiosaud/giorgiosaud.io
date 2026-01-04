import { createAuthClient } from 'better-auth/client'
import { adminClient } from 'better-auth/client/plugins'
import { passkeyClient } from '@better-auth/passkey/client'
import { BETTER_AUTH_URL } from 'astro:env/client'

export const authClient = createAuthClient({
  baseURL: BETTER_AUTH_URL,
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
