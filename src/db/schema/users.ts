import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', [
  'user',
  'moderator',
  'admin',
])

export const users = pgTable('users', {
  // Better Auth required fields
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  // Extended fields
  role: userRoleEnum('role').notNull().default('user'),
  displayName: text('display_name'),
  isBanned: boolean('is_banned').notNull().default(false),
  bannedAt: timestamp('banned_at', {
    withTimezone: true,
  }),
  bannedReason: text('banned_reason'),
})
