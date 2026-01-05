import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './auth'

// Separate table for app-specific user data
// FK to Better Auth's users table
// This keeps auth schema clean and avoids migration conflicts when plugins change
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),
  displayName: text('display_name'),
  bio: text('bio'),
  website: text('website'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
})
