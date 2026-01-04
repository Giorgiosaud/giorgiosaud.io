# Database Layer

## Structure
- `auth-schema.generated.ts` - Symlink to root `auth-schema.ts` (Better Auth CLI output)
- `schema/auth/` - Re-exports from generated schema (stable import path)
- `schema/user-profiles.ts` - App-specific user data (FK to auth users)
- `schema/*.ts` - Other app tables (comments, badges, push-subscriptions)

## Commands
- `bun run auth:generate` - Regenerate Better Auth schema (after adding plugins)
- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:push` - Push schema to database (dev only)
- `bun run db:migrate` - Run migrations (production)
- `bun run db:studio` - Open Drizzle Studio

## Adding Better Auth Plugins
1. Install plugin: `bun add @better-auth/plugin-name`
2. Add to `src/lib/auth.ts` plugins array
3. Run `bun run auth:generate` - schema auto-updates via symlink
4. Run `bun run db:generate` to create migration
5. Update `src/db/schema/auth/index.ts` re-exports if new tables added

## Auth vs App Data
- **Auth tables** (user, session, account, verification, passkey): Managed by Better Auth CLI
- **App tables** (user_profiles, comments, badges): Managed manually
- Never add custom columns to auth tables - use user_profiles instead
