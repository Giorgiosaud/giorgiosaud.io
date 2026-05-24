import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Support both Astro env and process.env (for CLI tools like better-auth)
let dbUrl: string | undefined

try {
  const astroEnv = await import('astro:env/server')
  dbUrl = astroEnv.POSTGRES_URL
} catch {
  dbUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL
}

const isDev =
  typeof import.meta.env !== 'undefined'
    ? import.meta.env.DEV
    : process.env.NODE_ENV === 'development'

let db: ReturnType<typeof drizzle>

if (dbUrl) {
  const sql = neon(dbUrl)
  db = drizzle(sql, {
    schema,
    logger: isDev,
  })
} else {
  db = new Proxy({} as ReturnType<typeof drizzle>, {
    get(_, prop) {
      if (prop === 'then') return undefined
      throw new Error(
        `Database not configured. Set POSTGRES_URL environment variable. (Attempted to access: ${String(prop)})`,
      )
    },
  })
}

export { db }
export type Database = typeof db
