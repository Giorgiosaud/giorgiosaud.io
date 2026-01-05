// Re-export all tables from Better Auth generated schema
// This file acts as a stable import path for auth tables
// When Better Auth regenerates schema (e.g., after adding plugins), imports still work
//
// NOTE: Relations are NOT exported here because we extend auth tables
// with app-specific relations in ./relations.ts

export {
  account as accounts,
  passkey as passkeys,
  session as sessions,
  user as users,
  verification as verifications,
} from '../../auth-schema.generated'
