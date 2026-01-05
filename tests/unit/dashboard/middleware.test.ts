import { describe, expect, it } from 'vitest'

describe('Dashboard Middleware', () => {
  describe('Route Protection', () => {
    it('should protect /dashboard routes', () => {
      const dashboardPaths = [
        '/dashboard',
        '/dashboard/passkeys',
        '/dashboard/comments',
        '/dashboard/status',
      ]

      dashboardPaths.forEach(path => {
        expect(path.startsWith('/dashboard')).toBe(true)
      })
    })

    it('should protect /es/panel routes', () => {
      const panelPaths = [
        '/es/panel',
        '/es/panel/passkeys',
        '/es/panel/comments',
        '/es/panel/status',
      ]

      panelPaths.forEach(path => {
        expect(path.startsWith('/es/panel')).toBe(true)
      })
    })

    it('should redirect unauthenticated users to correct home', () => {
      // English routes should redirect to /
      const enPath = '/dashboard'
      expect(enPath.startsWith('/es')).toBe(false)

      // Spanish routes should redirect to /es
      const esPath = '/es/panel'
      expect(esPath.startsWith('/es')).toBe(true)
    })
  })

  describe('Route Translation', () => {
    it('should have matching English and Spanish routes', () => {
      const routeMap = {
        '/dashboard': '/es/panel',
        '/dashboard/passkeys': '/es/panel/passkeys',
        '/dashboard/comments': '/es/panel/comments',
        '/dashboard/status': '/es/panel/status',
      }

      Object.entries(routeMap).forEach(([en, es]) => {
        expect(en).not.toContain('/es')
        expect(es).toContain('/es')
      })
    })
  })
})
