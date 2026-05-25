---
draft: true
title: "Better Auth with Drizzle and Neon in Astro"
description: "Wire up Better Auth with Drizzle and Neon in Astro — email/password, social OAuth, passkeys, and the two-config-file pattern explained."
publishDate: 2026-05-24
selfHealing: bttrth
cover: ../../../assets/images/better-auth-drizzle-neon-astro.png
coverAlt: Authentication flow with Drizzle and Neon database on a dark background
lang: en
category: development
author: giorgio-saud
collections:
  - backend
  - security
tags:
  - astro
  - better-auth
  - drizzle
  - neon
  - postgres
  - authentication
  - oauth
  - passkeys
---

Authentication is one of those things that looks simple until you're an hour deep and realize you've reimplemented a session store by hand. Better Auth is a TypeScript-first auth library that handles all of that for you — sessions, OAuth providers, passkeys, admin roles — and integrates cleanly with Drizzle ORM.

This post walks through the full setup in an Astro project: provisioning the database, wiring the schema, and getting all four auth methods working.

## What we're building

- Email + password authentication
- Social OAuth (GitHub, Google, Facebook)
- Passkeys (WebAuthn)
- Username plugin
- Drizzle ORM schema managed by the Better Auth CLI
- Neon Postgres as the database (serverless driver)

## Adding to an existing project

If you already have Astro + Drizzle set up, you only need a few packages:

```bash
bun add better-auth @better-auth/passkey drizzle-orm @neondatabase/serverless
bun add -d @better-auth/cli
```

For a **fresh project**, scaffold Astro first (`bun create astro`), then add `drizzle-orm`, `drizzle-kit`, and `@neondatabase/serverless` before continuing.

## Provision a Neon database

Create a project at [neon.tech](https://neon.tech) and copy the connection string. Add it to `.env`:

```env
POSTGRES_URL=postgresql://user:pass@host/dbname?sslmode=require
```

> The `?sslmode=require` is important — Neon enforces TLS and the connection will be refused without it.

## Environment variables

```env
# Database
POSTGRES_URL=postgresql://user:pass@host/dbname?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=a-random-32-plus-character-string
BETTER_AUTH_URL=http://localhost:4321   # production: https://yourdomain.com

# Social OAuth — omit any provider you don't need
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

Generate `BETTER_AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

## The two config files

This is the trickiest part of the setup, and the reason things break if you only have one file.

Better Auth's CLI (`auth:generate`, which regenerates the Drizzle schema) needs to import your config at **build time** via Node.js — but Astro's `astro:env` module only works inside the Astro runtime. If you point the CLI at your runtime config, it crashes.

The solution: two files with the same plugins, different env sources.

### `auth.config.ts` — CLI only

Lives at the project root. Used **only** by `bunx @better-auth/cli`. Reads env from `process.env` via `dotenv`.

```ts
// auth.config.ts
import 'dotenv/config'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, username } from 'better-auth/plugins'
import { passkey } from '@better-auth/passkey'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './src/db/schema'

const client = postgres(process.env.POSTGRES_URL!, { prepare: false })
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
  emailAndPassword: { enabled: true },
  plugins: [
    admin({ defaultRole: 'user', adminRoles: ['admin'] }),
    passkey({ rpID: 'localhost', rpName: 'My App', origin: 'http://localhost:4321' }),
    username({ minLength: 3, maxLength: 30 }),
  ],
})
```

### `src/lib/auth.ts` — runtime

Used by the Astro server. Reads env from `astro:env`, supports social providers, and adapts passkey config for prod vs dev.

```ts
// src/lib/auth.ts
import { BETTER_AUTH_URL } from 'astro:env/client'
import {
  BETTER_AUTH_SECRET,
  GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET,
} from 'astro:env/server'
import { passkey } from '@better-auth/passkey'
import { db } from '@db'
import * as schema from '@db/schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, username } from 'better-auth/plugins'

const isProd = import.meta.env.PROD

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {}
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET)
  socialProviders.github = { clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET }
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
  socialProviders.google = { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET }
if (FACEBOOK_CLIENT_ID && FACEBOOK_CLIENT_SECRET)
  socialProviders.facebook = { clientId: FACEBOOK_CLIENT_ID, clientSecret: FACEBOOK_CLIENT_SECRET }

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
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  socialProviders,
  session: {
    cookieCache: { enabled: true, maxAge: 60 * 5 },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  plugins: [
    admin({ defaultRole: 'user', adminRoles: ['admin'] }),
    passkey({
      rpID: isProd ? 'yourdomain.com' : 'localhost',
      rpName: 'My App',
      origin: BETTER_AUTH_URL,
    }),
    username({ minLength: 3, maxLength: 30 }),
  ],
  advanced: {
    cookiePrefix: 'myapp',
    useSecureCookies: isProd,
  },
  trustedOrigins: [BETTER_AUTH_URL],
})

export type Auth = typeof auth
```

The rule is simple: **if you add a plugin to one file, add it to the other**.

## Schema management

### The symlink pattern

Running `bun run auth:generate` writes the Drizzle schema to `auth-schema.ts` at the project root. Rather than manually copying it into `src/db/` after every regeneration, create a symlink once:

```bash
ln -s ../../auth-schema.ts src/db/auth-schema.generated.ts
```

Then create a stable re-export that renames tables to the plural convention Drizzle prefers:

```ts
// src/db/schema/auth/index.ts
export {
  account as accounts,
  passkey as passkeys,
  session as sessions,
  user as users,
  verification as verifications,
} from '../../auth-schema.generated'
```

Now `bun run auth:generate` regenerates the root file and all imports inside `src/db/` pick up the changes automatically.

### Running migrations

```bash
bun run auth:generate   # regenerates auth-schema.ts via the CLI
bun run db:generate     # creates a new SQL file in drizzle/
bun run db:migrate      # applies it to the database
```

## Expose the auth API endpoint

Better Auth needs a catch-all API route. In Astro:

```ts
// src/pages/api/auth/[...all].ts
import type { APIRoute } from 'astro'
import { auth } from '@lib/auth'

export const ALL: APIRoute = ({ request }) => auth.handler(request)
```

## Social OAuth setup

For each provider you want to use, create an OAuth app in the provider's developer console and set the callback URL to:

```
https://yourdomain.com/api/auth/callback/<provider>
```

For local dev:

```
http://localhost:4321/api/auth/callback/github
http://localhost:4321/api/auth/callback/google
http://localhost:4321/api/auth/callback/facebook
```

Social providers are opt-in: if the env vars for a provider are not set, that provider is simply not registered.

## Passkeys

Passkeys use WebAuthn. The two critical values are `rpID` (the domain, no protocol or port) and `origin` (the full URL).

```
dev:  rpID = 'localhost',        origin = 'http://localhost:4321'
prod: rpID = 'yourdomain.com',   origin = 'https://yourdomain.com'
```

Getting these wrong is the most common passkey failure — the browser will reject the registration silently if `rpID` doesn't match the current domain.

## Adding a plugin later

1. Install: `bun add @better-auth/plugin-name`
2. Add to **both** `auth.config.ts` and `src/lib/auth.ts`
3. `bun run auth:generate` — updates `auth-schema.ts`
4. If new tables were added, re-export them in `src/db/schema/auth/index.ts`
5. `bun run db:generate` → `bun run db:migrate`

## What about app-specific user data?

Never add custom columns to the auth tables — Better Auth owns them. Instead, create a separate `user_profiles` table with a foreign key to `users.id`:

```ts
// src/db/schema/user-profiles.ts
import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  website: text('website'),
})
```

This keeps your schema clean: auth tables regenerate freely, app data stays stable.

## Quick checklist

- [ ] `POSTGRES_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` set in `.env` and Vercel
- [ ] `auth.config.ts` and `src/lib/auth.ts` have identical plugins
- [ ] Symlink `src/db/auth-schema.generated.ts → ../../auth-schema.ts` exists
- [ ] `src/db/schema/auth/index.ts` re-exports all auth tables
- [ ] `src/pages/api/auth/[...all].ts` catch-all route exists
- [ ] OAuth callback URLs registered in each provider's console
- [ ] Passkey `rpID` is the bare domain (no `https://`, no port)
- [ ] Migrations applied: `db:generate` → `db:migrate`
