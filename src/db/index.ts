import { POSTGRES_PRISMA_URL } from 'astro:env/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Use connection pooler with Transaction mode (disable prepare for Supabase)
const client = postgres(POSTGRES_PRISMA_URL, {
  prepare: false,
  max: 10,
})

export const db = drizzle(client, {
  schema,
  logger: import.meta.env.DEV,
})

export type Database = typeof db
