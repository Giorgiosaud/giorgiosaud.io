import { relations } from 'drizzle-orm'
import { accounts } from './accounts'
import { badges } from './badges'
import { comments } from './comments'
import { pushSubscriptions } from './push-subscriptions'
import { sessions } from './sessions'
import { userBadges } from './user-badges'
import { users } from './users'

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  pushSubscriptions: many(pushSubscriptions),
  comments: many(comments),
  badges: many(userBadges),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [
      sessions.userId,
    ],
    references: [
      users.id,
    ],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [
      accounts.userId,
    ],
    references: [
      users.id,
    ],
  }),
}))

export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [
        pushSubscriptions.userId,
      ],
      references: [
        users.id,
      ],
    }),
  }),
)

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [
      comments.userId,
    ],
    references: [
      users.id,
    ],
  }),
  parent: one(comments, {
    fields: [
      comments.parentId,
    ],
    references: [
      comments.id,
    ],
    relationName: 'replies',
  }),
  replies: many(comments, {
    relationName: 'replies',
  }),
  deletedByUser: one(users, {
    fields: [
      comments.deletedBy,
    ],
    references: [
      users.id,
    ],
  }),
}))

export const badgesRelations = relations(badges, ({ many }) => ({
  earnedBy: many(userBadges),
}))

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [
      userBadges.userId,
    ],
    references: [
      users.id,
    ],
  }),
  badge: one(badges, {
    fields: [
      userBadges.badgeSlug,
    ],
    references: [
      badges.slug,
    ],
  }),
  awardedByUser: one(users, {
    fields: [
      userBadges.awardedBy,
    ],
    references: [
      users.id,
    ],
  }),
}))
