import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './auth'

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // Note reference using selfHealing code (language-agnostic)
    noteSelfHealing: text('note_self_healing').notNull(),

    // Threading: parent comment reference
    parentId: uuid('parent_id'),

    // Depth for limiting nesting
    depth: integer('depth').notNull().default(0),

    // Author
    userId: text('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),

    // Content
    content: text('content').notNull(),

    // Moderation
    isApproved: boolean('is_approved').notNull().default(true),
    isEdited: boolean('is_edited').notNull().default(false),
    editedAt: timestamp('edited_at', {
      withTimezone: true,
    }),

    // Soft delete
    deletedAt: timestamp('deleted_at', {
      withTimezone: true,
    }),
    deletedBy: text('deleted_by').references(() => users.id),
    deletedReason: text('deleted_reason'),

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
  },
  table => [
    index('comments_note_self_healing_idx').on(table.noteSelfHealing),
    index('comments_parent_id_idx').on(table.parentId),
    index('comments_user_id_idx').on(table.userId),
    index('comments_created_at_idx').on(table.createdAt),
    index('comments_note_created_idx').on(
      table.noteSelfHealing,
      table.createdAt,
    ),
  ],
)
