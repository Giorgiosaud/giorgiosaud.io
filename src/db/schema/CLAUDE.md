# Schema Files

## Auth Tables (Better Auth managed)
- `auth/index.ts` - Re-exports from `auth-schema.generated.ts`
- Do NOT modify auth tables directly - regenerate with `bun run auth:generate`

## App Tables
- `user-profiles.ts` - User display name, bio, website (FK to users)
- `comments.ts` - Threaded comments on notes
- `badges.ts` - Badge definitions
- `user-badges.ts` - User earned badges
- `push-subscriptions.ts` - Web push subscriptions

## Relations
- `relations.ts` - Drizzle relations for ALL tables (auth + app)
- Auth relations NOT exported from auth/ to allow extension with app relations

## Conventions
- Use `withTimezone: true` for all timestamps
- Use `uuid` for app table IDs, `text` for auth table IDs
- Cascade delete on user FK references
