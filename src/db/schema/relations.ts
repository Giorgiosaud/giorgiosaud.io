import { relations } from 'drizzle-orm'
import { accounts, passkeys, sessions, users } from './auth'
import { badges } from './badges'
import { comments } from './comments'
import { pushSubscriptions } from './push-subscriptions'
import { userBadges } from './user-badges'
import { userProfiles } from './user-profiles'

// Extended user relations (includes auth + app relations)
export const usersRelations = relations(users, ({ many, one }) => ({
  // Auth relations
  sessions: many(sessions),
  accounts: many(accounts),
  passkeys: many(passkeys),
  // App relations
  profile: one(userProfiles),
  pushSubscriptions: many(pushSubscriptions),
  comments: many(comments),
  badges: many(userBadges),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const passkeysRelations = relations(passkeys, ({ one }) => ({
  user: one(users, {
    fields: [passkeys.userId],
    references: [users.id],
  }),
}))

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}))

export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  }),
)

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'replies',
  }),
  replies: many(comments, {
    relationName: 'replies',
  }),
  deletedByUser: one(users, {
    fields: [comments.deletedBy],
    references: [users.id],
  }),
}))

export const badgesRelations = relations(badges, ({ many }) => ({
  earnedBy: many(userBadges),
}))

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeSlug],
    references: [badges.slug],
  }),
  awardedByUser: one(users, {
    fields: [userBadges.awardedBy],
    references: [users.id],
  }),
}))
