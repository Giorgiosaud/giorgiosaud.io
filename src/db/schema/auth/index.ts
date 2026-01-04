// Re-export all tables from Better Auth generated schema
// This file acts as a stable import path for auth tables
// When Better Auth regenerates schema (e.g., after adding plugins), imports still work
//
// NOTE: Relations are NOT exported here because we extend auth tables
// with app-specific relations in ./relations.ts

export {
  user as users,
  session as sessions,
  account as accounts,
  verification as verifications,
  passkey as passkeys,
} from '../../auth-schema.generated'
