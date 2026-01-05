import { describe, expect, it } from 'vitest'
import enDashboard from '@i18n/locales/en/dashboard.json'
import esDashboard from '@i18n/locales/es/dashboard.json'

describe('Dashboard Translations', () => {
  describe('Structure', () => {
    it('should have matching keys in both languages', () => {
      const enKeys = JSON.stringify(Object.keys(enDashboard).sort())
      const esKeys = JSON.stringify(Object.keys(esDashboard).sort())

      expect(enKeys).toBe(esKeys)
    })

    it('should have all required sections', () => {
      const requiredSections = [
        'title',
        'nav',
        'profile',
        'passkeys',
        'comments',
        'status',
        'publicProfile',
      ]

      requiredSections.forEach(section => {
        expect(enDashboard).toHaveProperty(section)
        expect(esDashboard).toHaveProperty(section)
      })
    })
  })

  describe('Navigation', () => {
    it('should have all nav items', () => {
      const navItems = ['profile', 'passkeys', 'comments', 'status']

      navItems.forEach(item => {
        expect(enDashboard.nav).toHaveProperty(item)
        expect(esDashboard.nav).toHaveProperty(item)
      })
    })
  })

  describe('Profile Section', () => {
    it('should have form field translations', () => {
      const fields = [
        'displayName',
        'displayNamePlaceholder',
        'username',
        'usernamePlaceholder',
        'usernameHelp',
        'bio',
        'bioPlaceholder',
        'website',
        'websitePlaceholder',
      ]

      fields.forEach(field => {
        expect(enDashboard.profile).toHaveProperty(field)
        expect(esDashboard.profile).toHaveProperty(field)
      })
    })

    it('should have action translations', () => {
      const actions = ['save', 'saving', 'saved', 'error']

      actions.forEach(action => {
        expect(enDashboard.profile).toHaveProperty(action)
        expect(esDashboard.profile).toHaveProperty(action)
      })
    })
  })

  describe('Passkeys Section', () => {
    it('should have passkey management translations', () => {
      const passkeyKeys = [
        'title',
        'description',
        'add',
        'adding',
        'namePrompt',
        'namePlaceholder',
        'noPasskeys',
        'delete',
        'deleting',
        'confirmDelete',
        'deviceType',
        'backedUp',
        'createdAt',
        'error',
      ]

      passkeyKeys.forEach(key => {
        expect(enDashboard.passkeys).toHaveProperty(key)
        expect(esDashboard.passkeys).toHaveProperty(key)
      })
    })
  })

  describe('Comments Section', () => {
    it('should have comment list translations', () => {
      const commentKeys = [
        'title',
        'description',
        'noComments',
        'viewNote',
        'pending',
        'approved',
        'deleted',
      ]

      commentKeys.forEach(key => {
        expect(enDashboard.comments).toHaveProperty(key)
        expect(esDashboard.comments).toHaveProperty(key)
      })
    })
  })

  describe('Status Section', () => {
    it('should have status display translations', () => {
      const statusKeys = ['title', 'role', 'badges', 'noBadges', 'memberSince']

      statusKeys.forEach(key => {
        expect(enDashboard.status).toHaveProperty(key)
        expect(esDashboard.status).toHaveProperty(key)
      })
    })
  })

  describe('Public Profile Section', () => {
    it('should have public profile translations', () => {
      const publicProfileKeys = ['viewProfile', 'noProfile']

      publicProfileKeys.forEach(key => {
        expect(enDashboard.publicProfile).toHaveProperty(key)
        expect(esDashboard.publicProfile).toHaveProperty(key)
      })
    })
  })

  describe('Content Quality', () => {
    it('should not have empty translations', () => {
      const checkNonEmpty = (obj: Record<string, unknown>, path = ''): void => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key
          if (typeof value === 'string') {
            expect(value.length, `${currentPath} should not be empty`).toBeGreaterThan(0)
          } else if (typeof value === 'object' && value !== null) {
            checkNonEmpty(value as Record<string, unknown>, currentPath)
          }
        })
      }

      checkNonEmpty(enDashboard)
      checkNonEmpty(esDashboard)
    })
  })
})
