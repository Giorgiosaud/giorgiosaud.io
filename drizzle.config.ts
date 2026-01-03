import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    // Use POSTGRES_PRISMA_URL from Vercel-Supabase integration
    // Falls back to DATABASE_URL for local development
    url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL!,
  },
  // Only target public schema to avoid Supabase system table issues
  schemaFilter: ['public'],
  verbose: true,
  strict: true,
})
