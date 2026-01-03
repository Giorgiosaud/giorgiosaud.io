import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { badges } from './badges'
import { users } from './users'

export const userBadges = pgTable(
  'user_badges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),
    badgeSlug: text('badge_slug')
      .notNull()
      .references(() => badges.slug, {
        onDelete: 'cascade',
      }),

    // When and how earned
    earnedAt: timestamp('earned_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    awardedBy: text('awarded_by').references(() => users.id),
    reason: text('reason'),

    // Display preference
    isDisplayed: boolean('is_displayed').notNull().default(true),
    displayOrder: integer('display_order').notNull().default(0),
  },
  table => [
    unique('unique_user_badge').on(table.userId, table.badgeSlug),
    index('user_badges_user_id_idx').on(table.userId),
  ],
)
