import { config } from 'dotenv'

// Load in priority order: .env.development.local overrides .env
config({ path: '.env' })
config({ path: '.env.development.local', override: true })
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.POSTGRES_URL!,
  },
  verbose: true,
  strict: true,
})
