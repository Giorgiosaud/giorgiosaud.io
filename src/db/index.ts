import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Support both Astro env and process.env (for CLI tools like better-auth)
let dbUrl: string | undefined

try {
  // Try Astro's env system first (works during build/runtime)
  const astroEnv = await import('astro:env/server')
  dbUrl = astroEnv.POSTGRES_URL
} catch {
  // Fallback to process.env (for CLI tools)
  dbUrl = process.env.POSTGRES_URL
}

// Detect dev mode from both Astro and Node environments
const isDev =
  typeof import.meta.env !== 'undefined'
    ? import.meta.env.DEV
    : process.env.NODE_ENV === 'development'

// Only create a real db connection if we have a URL
// This allows the module to be imported during SSG without crashing
let db: ReturnType<typeof drizzle>

if (dbUrl) {
  // Use connection pooler with Transaction mode (disable prepare for Supabase)
  const client = postgres(dbUrl, {
    prepare: false,
    max: 10,
  })

  db = drizzle(client, {
    schema,
    logger: isDev,
  })
} else {
  // During SSG build without database, create a proxy that throws on use
  db = new Proxy({} as ReturnType<typeof drizzle>, {
    get(_, prop) {
      if (prop === 'then') return undefined // Allow await without error
      throw new Error(
        `Database not configured. Set POSTGRES_URL environment variable. (Attempted to access: ${String(prop)})`,
      )
    },
  })
}

export { db }
export type Database = typeof db
