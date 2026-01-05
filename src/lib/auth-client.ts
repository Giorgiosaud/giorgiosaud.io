import { BETTER_AUTH_URL } from 'astro:env/client'
import { passkeyClient } from '@better-auth/passkey/client'
import { createAuthClient } from 'better-auth/client'
import { adminClient, usernameClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: BETTER_AUTH_URL,
  plugins: [
    adminClient(),
    passkeyClient(),
    usernameClient(),
  ],
})

// Re-export commonly used methods
export const { signIn, signOut, signUp, useSession, getSession, passkey } =
  authClient
