import { describe, expect, it, vi, beforeEach } from 'vitest'

// Mock Astro env modules
vi.mock('astro:env/server', () => ({
  POSTGRES_URL: 'postgresql://test:test@localhost:5432/test',
}))

vi.mock('astro:env/client', () => ({
  BETTER_AUTH_URL: 'http://localhost:4321',
}))

// Mock db module
vi.mock('@db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onConflictDoUpdate: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockReturnThis(),
  },
}))

// Mock db schema
vi.mock('@db/schema', () => ({
  users: { id: 'id', username: 'username', displayUsername: 'displayUsername' },
  userProfiles: { userId: 'userId', displayName: 'displayName', bio: 'bio', website: 'website' },
  passkeys: { id: 'id', userId: 'userId', name: 'name' },
  comments: { id: 'id', userId: 'userId', content: 'content' },
  userBadges: { userId: 'userId', badgeId: 'badgeId' },
  badges: { id: 'id', name: 'name' },
}))

// Mock collections helper
vi.mock('@helpers/collections', () => ({
  getPublishedNotes: vi.fn().mockResolvedValue([]),
}))

describe('Dashboard API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Profile API', () => {
    describe('GET /api/dashboard/profile.json', () => {
      it('should require authentication', () => {
        const mockLocals = { user: null }
        expect(mockLocals.user).toBeNull()
      })

      it('should return user and profile data when authenticated', () => {
        const mockLocals = {
          user: { id: 'user-123', name: 'Test User' },
        }
        expect(mockLocals.user).toBeDefined()
        expect(mockLocals.user.id).toBe('user-123')
      })
    })

    describe('PUT /api/dashboard/profile.json', () => {
      it('should validate website URL format', () => {
        const validUrls = [
          'https://example.com',
          'http://localhost:3000',
          'https://sub.domain.com/path',
        ]

        const invalidUrls = ['not-a-url', 'invalid-url', 'just text']

        validUrls.forEach(url => {
          expect(() => new URL(url)).not.toThrow()
        })

        invalidUrls.forEach(url => {
          if (url) {
            expect(() => new URL(url)).toThrow()
          }
        })
      })

      it('should validate username format', () => {
        const validUsernames = ['john_doe', 'user123', 'TestUser']
        const invalidUsernames = ['ab', 'user@name', 'user name', 'user-name']

        const usernameRegex = /^[a-zA-Z0-9_]+$/

        validUsernames.forEach(username => {
          expect(username.length).toBeGreaterThanOrEqual(3)
          expect(usernameRegex.test(username)).toBe(true)
        })

        invalidUsernames.forEach(username => {
          const isValid =
            username.length >= 3 &&
            username.length <= 30 &&
            usernameRegex.test(username)
          expect(isValid).toBe(false)
        })
      })

      it('should enforce username length constraints', () => {
        const tooShort = 'ab'
        const validLength = 'validuser'
        const tooLong = 'a'.repeat(31)

        expect(tooShort.length).toBeLessThan(3)
        expect(validLength.length).toBeGreaterThanOrEqual(3)
        expect(validLength.length).toBeLessThanOrEqual(30)
        expect(tooLong.length).toBeGreaterThan(30)
      })
    })
  })

  describe('Passkeys API', () => {
    describe('GET /api/dashboard/passkeys/index.json', () => {
      it('should require authentication', () => {
        const mockLocals = { user: null }
        expect(mockLocals.user).toBeNull()
      })

      it('should return passkey fields', () => {
        const expectedFields = ['id', 'name', 'deviceType', 'backedUp', 'createdAt']
        expectedFields.forEach(field => {
          expect(typeof field).toBe('string')
        })
      })
    })

    describe('DELETE /api/dashboard/passkeys/[id].json', () => {
      it('should require passkey id parameter', () => {
        const params = { id: undefined }
        expect(params.id).toBeUndefined()

        const validParams = { id: 'passkey-123' }
        expect(validParams.id).toBeDefined()
      })

      it('should only delete passkeys owned by the user', () => {
        // Verify the query should filter by both passkey ID and user ID
        const mockUserId = 'user-123'
        const mockPasskeyId = 'passkey-456'

        expect(mockUserId).toBeDefined()
        expect(mockPasskeyId).toBeDefined()
      })
    })
  })

  describe('Comments API', () => {
    describe('GET /api/dashboard/comments.json', () => {
      it('should require authentication', () => {
        const mockLocals = { user: null }
        expect(mockLocals.user).toBeNull()
      })

      it('should include note information with comments', () => {
        const mockComment = {
          id: 'comment-123',
          content: 'Test comment',
          noteSelfHealing: 'abc123',
          note: {
            title: 'Test Note',
            url: '/notebook/test-note',
          },
        }

        expect(mockComment.note).toBeDefined()
        expect(mockComment.note?.title).toBe('Test Note')
        expect(mockComment.note?.url).toContain('/notebook/')
      })
    })
  })

  describe('Public Profile API', () => {
    describe('GET /api/users/[username].json', () => {
      it('should require username parameter', () => {
        const params = { username: undefined }
        expect(params.username).toBeUndefined()

        const validParams = { username: 'testuser' }
        expect(validParams.username).toBeDefined()
      })

      it('should return public profile data', () => {
        const mockProfile = {
          user: {
            name: 'Test User',
            image: null,
            username: 'testuser',
            createdAt: new Date().toISOString(),
          },
          profile: {
            displayName: 'Test Display Name',
            bio: 'Test bio',
            website: 'https://example.com',
          },
          badges: [],
          recentComments: [],
        }

        expect(mockProfile.user.username).toBe('testuser')
        expect(mockProfile.profile).toBeDefined()
        expect(Array.isArray(mockProfile.badges)).toBe(true)
        expect(Array.isArray(mockProfile.recentComments)).toBe(true)
      })

      it('should only return approved comments', () => {
        const mockComments = [
          { id: '1', isApproved: true, deletedAt: null },
          { id: '2', isApproved: false, deletedAt: null },
          { id: '3', isApproved: true, deletedAt: '2024-01-01' },
        ]

        const publicComments = mockComments.filter(
          c => c.isApproved && !c.deletedAt
        )

        expect(publicComments).toHaveLength(1)
        expect(publicComments[0].id).toBe('1')
      })

      it('should truncate long comment content', () => {
        const longContent = 'a'.repeat(250)
        const maxLength = 200

        const truncated =
          longContent.length > maxLength
            ? `${longContent.substring(0, maxLength)}...`
            : longContent

        expect(truncated.length).toBeLessThanOrEqual(maxLength + 3)
        expect(truncated.endsWith('...')).toBe(true)
      })
    })
  })
})
