import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
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

// Detect production mode from both Astro and Node environments
const isProd = typeof import.meta.env !== 'undefined'
  ? import.meta.env.PROD
  : process.env.NODE_ENV === 'production'

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
      passkey: schema.passkeys,
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
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
    }),
    passkey({
      rpID: isProd ? 'giorgiosaud.io' : 'localhost',
      rpName: 'Giorgio Saud Notebook',
      origin: BETTER_AUTH_URL,
    }),
  ],

  // Advanced options
  advanced: {
    cookiePrefix: 'gsio',
    useSecureCookies: isProd,
  },

  // Trusted origins for CORS
  trustedOrigins: [BETTER_AUTH_URL],
})

export type Auth = typeof auth
