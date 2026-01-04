import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { passkey } from '@better-auth/passkey'
import { db } from '@db'
import * as schema from '@db/schema'

// Support both Astro env and process.env (for CLI tools like better-auth)
let envVars: {
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  FACEBOOK_CLIENT_ID?: string
  FACEBOOK_CLIENT_SECRET?: string
}

// Detect base URL from various sources
function getServerBaseURL(): string {
  // Check explicit env var first
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
  // Vercel provides VERCEL_URL for preview deployments
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  // Default for local development
  return 'http://localhost:4321'
}

try {
  // Try Astro's env system first (works during build/runtime)
  const serverEnv = await import('astro:env/server')
  const clientEnv = await import('astro:env/client')
  envVars = {
    BETTER_AUTH_SECRET: serverEnv.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: clientEnv.BETTER_AUTH_URL || getServerBaseURL(),
    GITHUB_CLIENT_ID: serverEnv.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: serverEnv.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: serverEnv.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: serverEnv.GOOGLE_CLIENT_SECRET,
    FACEBOOK_CLIENT_ID: serverEnv.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: serverEnv.FACEBOOK_CLIENT_SECRET,
  }
} catch {
  // Fallback to process.env (for CLI tools)
  envVars = {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || '',
    BETTER_AUTH_URL: getServerBaseURL(),
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
  }
}

const {
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
} = envVars

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
