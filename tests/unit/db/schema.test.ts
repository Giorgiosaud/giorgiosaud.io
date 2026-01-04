import { getTableName } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { accounts, sessions, users, verifications, passkeys } from '@db/schema/auth'
import { badges } from '@db/schema/badges'
import { comments } from '@db/schema/comments'
import { pushSubscriptions } from '@db/schema/push-subscriptions'
import { userBadges } from '@db/schema/user-badges'
import { userProfiles } from '@db/schema/user-profiles'

describe('Database Schema', () => {
  describe('Users table (Better Auth managed)', () => {
    it('should have correct table name', () => {
      // Better Auth uses singular table names
      expect(getTableName(users)).toBe('user')
    })

    it('should have required columns', () => {
      const columns = Object.keys(users)
      expect(columns).toContain('id')
      expect(columns).toContain('name')
      expect(columns).toContain('email')
      expect(columns).toContain('emailVerified')
      expect(columns).toContain('createdAt')
      expect(columns).toContain('updatedAt')
    })

    it('should have admin plugin columns', () => {
      const columns = Object.keys(users)
      expect(columns).toContain('role')
      expect(columns).toContain('banned')
      expect(columns).toContain('banReason')
      expect(columns).toContain('banExpires')
    })
  })

  describe('Sessions table (Better Auth managed)', () => {
    it('should have correct table name', () => {
      expect(getTableName(sessions)).toBe('session')
    })

    it('should have required columns', () => {
      const columns = Object.keys(sessions)
      expect(columns).toContain('id')
      expect(columns).toContain('userId')
      expect(columns).toContain('token')
      expect(columns).toContain('expiresAt')
    })
  })

  describe('Accounts table (Better Auth managed)', () => {
    it('should have correct table name', () => {
      expect(getTableName(accounts)).toBe('account')
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

  describe('Verifications table (Better Auth managed)', () => {
    it('should have correct table name', () => {
      expect(getTableName(verifications)).toBe('verification')
    })

    it('should have required columns', () => {
      const columns = Object.keys(verifications)
      expect(columns).toContain('id')
      expect(columns).toContain('identifier')
      expect(columns).toContain('value')
      expect(columns).toContain('expiresAt')
    })
  })

  describe('Passkeys table (Better Auth managed)', () => {
    it('should have correct table name', () => {
      expect(getTableName(passkeys)).toBe('passkey')
    })

    it('should have required columns', () => {
      const columns = Object.keys(passkeys)
      expect(columns).toContain('id')
      expect(columns).toContain('userId')
      expect(columns).toContain('publicKey')
      expect(columns).toContain('credentialID')
      expect(columns).toContain('counter')
    })
  })

  describe('User Profiles table (app managed)', () => {
    it('should have correct table name', () => {
      expect(getTableName(userProfiles)).toBe('user_profiles')
    })

    it('should have required columns', () => {
      const columns = Object.keys(userProfiles)
      expect(columns).toContain('id')
      expect(columns).toContain('userId')
      expect(columns).toContain('displayName')
      expect(columns).toContain('bio')
      expect(columns).toContain('website')
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
