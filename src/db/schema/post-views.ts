import {
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './auth'

export const postViews = pgTable(
  'post_views',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // Note reference using selfHealing code (language-agnostic)
    noteSelfHealing: text('note_self_healing').notNull(),

    // User who viewed (nullable for anonymous views)
    userId: text('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),

    // View metadata
    language: text('language').notNull().default('en'),
    scrollDepth: real('scroll_depth').notNull(), // 0.0 to 1.0 (percentage scrolled)
    viewDuration: integer('view_duration'), // seconds spent on page (optional)
    referrer: text('referrer'),
    userAgent: text('user_agent'),

    // Session identifier for anonymous tracking (privacy-friendly)
    sessionId: text('session_id'),

    // Timestamps
    viewedAt: timestamp('viewed_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  table => [
    index('post_views_note_self_healing_idx').on(table.noteSelfHealing),
    index('post_views_user_id_idx').on(table.userId),
    index('post_views_viewed_at_idx').on(table.viewedAt),
    index('post_views_note_language_idx').on(
      table.noteSelfHealing,
      table.language,
    ),
  ],
)
