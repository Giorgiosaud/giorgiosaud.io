import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),

    // Web Push API required fields
    endpoint: text('endpoint').notNull().unique(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),

    // Metadata
    expirationTime: timestamp('expiration_time', {
      withTimezone: true,
    }),
    userAgent: text('user_agent'),
    isActive: boolean('is_active').notNull().default(true),

    // Timestamps
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
    lastUsedAt: timestamp('last_used_at', {
      withTimezone: true,
    }),

    // Error tracking
    failureCount: integer('failure_count').notNull().default(0),
    lastError: text('last_error'),
  },
  table => [
    index('push_subscriptions_user_id_idx').on(table.userId),
  ],
)
