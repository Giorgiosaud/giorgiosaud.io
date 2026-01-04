import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const badges = pgTable('badges', {
  // Use slug as primary key
  slug: varchar('slug', {
    length: 100,
  }).primaryKey(),

  // Badge metadata
  name: text('name').notNull(),
  description: text('description').notNull(),
  iconUrl: text('icon_url'),

  // Categorization
  category: varchar('category', {
    length: 50,
  }).notNull(),

  // Rarity/tier
  tier: varchar('tier', {
    length: 20,
  })
    .notNull()
    .default('bronze'),
  points: integer('points').notNull().default(10),

  // Requirements (for automatic awarding)
  requirementType: varchar('requirement_type', {
    length: 50,
  }),
  requirementValue: integer('requirement_value'),

  // Display
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  isSecret: boolean('is_secret').notNull().default(false),

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
})
