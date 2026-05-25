# Database Layer

## Structure
- `auth-schema.generated.ts` - Symlink → root `auth-schema.ts` (Better Auth CLI output)
- `schema/auth/index.ts` - Re-exports from generated schema with renamed exports (`user` → `users`, etc.)
- `schema/user-profiles.ts` - App-specific user data (FK to auth users)
- `schema/*.ts` - Other app tables (comments, badges, push-subscriptions)
- `index.ts` - Drizzle client (Neon serverless); falls back to a proxy that throws if `POSTGRES_URL` is unset

## Commands
- `bun run auth:generate` - Regenerate Better Auth schema (after adding plugins)
- `bun run db:generate` - Generate Drizzle migrations from schema
- `bun run db:push` - Push schema to database (dev only, no migration file)
- `bun run db:migrate` - Run pending migrations (production)
- `bun run db:studio` - Open Drizzle Studio

## Initial setup from scratch

### 1. Provision a Postgres database
Use any Postgres provider. The project uses [Neon](https://neon.tech) (serverless driver).
Set the connection string as `POSTGRES_URL` in `.env` and in the Vercel dashboard.

### 2. Environment variables
Add to `.env` (and Vercel env for deployed environments):

```env
# Database
POSTGRES_URL=postgresql://user:pass@host/dbname

# Better Auth
BETTER_AUTH_SECRET=<random 32+ char secret>
BETTER_AUTH_URL=http://localhost:4321   # production: https://yourdomain.com

# Social OAuth (optional — omit to disable the provider)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

### 3. Generate auth schema and run migrations
```bash
bun run auth:generate   # writes auth-schema.ts (symlinked into src/db/)
bun run db:generate     # creates SQL migration in drizzle/
bun run db:migrate      # applies migration to the database
```

### 4. Auth configuration files
There are two config files — they must stay in sync:

| File | Purpose |
|------|---------|
| `auth.config.ts` (root) | Used only by the Better Auth CLI (`auth:generate`). Uses `process.env` because `astro:env` is unavailable in CLI context. |
| `src/lib/auth.ts` | Runtime auth instance used by the Astro server. Uses `astro:env` and supports social OAuth. |

When adding/changing plugins, update **both** files.

### 5. Schema symlink (how it works)
`src/db/auth-schema.generated.ts` is a symlink to the root `auth-schema.ts`.
`src/db/schema/auth/index.ts` re-exports from the symlink with Drizzle-friendly names.
Running `auth:generate` regenerates the root file; the symlink means imports inside `src/db/` pick up the changes automatically — no copying needed.

## Adding a Better Auth plugin
1. `bun add @better-auth/plugin-name`
2. Add the plugin to **both** `auth.config.ts` and `src/lib/auth.ts`
3. `bun run auth:generate` — updates `auth-schema.ts` via the CLI
4. If the plugin adds new tables, re-export them in `src/db/schema/auth/index.ts`
5. `bun run db:generate` → `bun run db:migrate`

## Auth vs App data
- **Auth tables** (user, session, account, verification, passkey): owned by Better Auth CLI — do not add columns manually
- **App tables** (user_profiles, comments, badges, …): managed manually via Drizzle
- Extend user data in `schema/user-profiles.ts` with a FK to `users.id`, never in the auth tables
