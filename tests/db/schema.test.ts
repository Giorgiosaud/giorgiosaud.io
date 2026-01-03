import { getTableName } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { accounts } from '../../src/db/schema/accounts'
import { badges } from '../../src/db/schema/badges'
import { comments } from '../../src/db/schema/comments'
import { pushSubscriptions } from '../../src/db/schema/push-subscriptions'
import { sessions } from '../../src/db/schema/sessions'
import { userBadges } from '../../src/db/schema/user-badges'
import { userRoleEnum, users } from '../../src/db/schema/users'
import { verifications } from '../../src/db/schema/verifications'

describe('Database Schema', () => {
  describe('Users table', () => {
    it('should have correct table name', () => {
      expect(getTableName(users)).toBe('users')
    })

    it('should have required columns', () => {
      const columns = Object.keys(users)
      expect(columns).toContain('id')
      expect(columns).toContain('name')
      expect(columns).toContain('email')
      expect(columns).toContain('emailVerified')
      expect(columns).toContain('role')
      expect(columns).toContain('createdAt')
      expect(columns).toContain('updatedAt')
    })

    it('should have user role enum with correct values', () => {
      expect(userRoleEnum.enumValues).toEqual(['user', 'moderator', 'admin'])
    })
  })

  describe('Sessions table', () => {
    it('should have correct table name', () => {
      expect(getTableName(sessions)).toBe('sessions')
    })

    it('should have required columns', () => {
      const columns = Object.keys(sessions)
      expect(columns).toContain('id')
      expect(columns).toContain('userId')
      expect(columns).toContain('token')
      expect(columns).toContain('expiresAt')
    })
  })

  describe('Accounts table', () => {
    it('should have correct table name', () => {
      expect(getTableName(accounts)).toBe('accounts')
    })

    it('should have required columns for OAuth', () => {
      const columns = Object.keys(accounts)
      expect(columns).toContain('id')
      expect(columns).toContain('userId')
      expect(columns).toContain('accountId')
      expect(columns).toContain('providerId')
      expect(columns).toContain('accessToken')
    })
  })

  describe('Verifications table', () => {
    it('should have correct table name', () => {
      expect(getTableName(verifications)).toBe('verifications')
    })

    it('should have required columns', () => {
      const columns = Object.keys(verifications)
      expect(columns).toContain('id')
      expect(columns).toContain('identifier')
      expect(columns).toContain('value')
      expect(columns).toContain('expiresAt')
    })
  })

  describe('Push Subscriptions table', () => {
    it('should have correct table name', () => {
      expect(getTableName(pushSubscriptions)).toBe('push_subscriptions')
    })

    it('should have required columns for Web Push API', () => {
      const columns = Object.keys(pushSubscriptions)
      expect(columns).toContain('endpoint')
      expect(columns).toContain('p256dh')
      expect(columns).toContain('auth')
      expect(columns).toContain('isActive')
    })
  })

  describe('Comments table', () => {
    it('should have correct table name', () => {
      expect(getTableName(comments)).toBe('comments')
    })

    it('should have required columns for threading', () => {
      const columns = Object.keys(comments)
      expect(columns).toContain('id')
      expect(columns).toContain('noteSelfHealing')
      expect(columns).toContain('userId')
      expect(columns).toContain('parentId')
      expect(columns).toContain('depth')
      expect(columns).toContain('content')
    })

    it('should have moderation columns', () => {
      const columns = Object.keys(comments)
      expect(columns).toContain('isApproved')
      expect(columns).toContain('deletedAt')
      expect(columns).toContain('deletedBy')
    })
  })

  describe('Badges table', () => {
    it('should have correct table name', () => {
      expect(getTableName(badges)).toBe('badges')
    })

    it('should have required columns', () => {
      const columns = Object.keys(badges)
      expect(columns).toContain('slug')
      expect(columns).toContain('name')
      expect(columns).toContain('description')
      expect(columns).toContain('category')
      expect(columns).toContain('tier')
    })
  })

  describe('User Badges table', () => {
    it('should have correct table name', () => {
      expect(getTableName(userBadges)).toBe('user_badges')
    })

    it('should have required columns for badge assignments', () => {
      const columns = Object.keys(userBadges)
      expect(columns).toContain('userId')
      expect(columns).toContain('badgeSlug')
      expect(columns).toContain('earnedAt')
      expect(columns).toContain('isDisplayed')
    })
  })
})
