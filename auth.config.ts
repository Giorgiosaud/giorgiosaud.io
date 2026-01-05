/**
 * Better Auth CLI configuration
 * This file uses process.env for CLI compatibility (astro:env doesn't work in CLI context)
 * The actual runtime auth config is in src/lib/auth.ts
 */
import 'dotenv/config'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, username } from 'better-auth/plugins'
import { passkey } from '@better-auth/passkey'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './src/db/schema'

const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL!
const client = postgres(dbUrl, { prepare: false })
const db = drizzle(client, { schema })

export default betterAuth({
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

  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
    }),
    passkey({
      rpID: 'localhost',
      rpName: 'Giorgio Saud Notebook',
      origin: 'http://localhost:4321',
    }),
    username({
      minLength: 3,
      maxLength: 30,
    }),
  ],
})
