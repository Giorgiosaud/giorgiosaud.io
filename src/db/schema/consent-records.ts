import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const consentRecords = pgTable(
  'consent_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // Anonymous session identifier (from client)
    sessionId: text('session_id').notNull(),

    // Hashed IP for privacy (SHA-256 of IP + salt)
    ipHash: text('ip_hash'),

    // Consent choices
    consentAnalytics: boolean('consent_analytics').notNull().default(false),
    consentMarketing: boolean('consent_marketing').notNull().default(false),

    // Consent version (to track policy changes)
    consentVersion: text('consent_version').notNull(),

    // Action type: 'accept_all', 'reject_all', 'custom'
    actionType: text('action_type').notNull(),

    // Browser info for audit
    userAgent: text('user_agent'),

    // Timestamps
    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  table => [
    index('consent_records_session_id_idx').on(table.sessionId),
    index('consent_records_created_at_idx').on(table.createdAt),
    index('consent_records_ip_hash_idx').on(table.ipHash),
  ],
)
