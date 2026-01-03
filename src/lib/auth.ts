import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { passkey } from '@better-auth/passkey'
import { db } from '@db'
import * as schema from '@db/schema'
import {
  BETTER_AUTH_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
} from 'astro:env/server'
import { BETTER_AUTH_URL } from 'astro:env/client'
const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {}
if(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  socialProviders['github'] = {
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
  }
}
if(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  socialProviders['google'] = {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  }
}
if(FACEBOOK_CLIENT_ID && FACEBOOK_CLIENT_SECRET) {
  socialProviders['facebook'] = {
    clientId: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
  }
}
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production with email service
    minPasswordLength: 8,
  },

  // Social OAuth providers
  socialProviders,

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every day
  },

  // Plugins
  plugins: [
    passkey({
      rpID: import.meta.env.PROD ? 'giorgiosaud.io' : 'localhost',
      rpName: 'Giorgio Saud Notebook',
      origin: BETTER_AUTH_URL,
    }),
  ],

  // Advanced options
  advanced: {
    cookiePrefix: 'gsio',
    useSecureCookies: import.meta.env.PROD,
  },
})

export type Auth = typeof auth
