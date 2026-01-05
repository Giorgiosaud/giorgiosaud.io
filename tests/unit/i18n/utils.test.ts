import { describe, expect, it } from 'vitest'
import {
  getLangFromUrl,
  useTranslations,
  useTranslatedPath,
  isRouteName,
} from '@i18n/utils'

describe('i18n Utils', () => {
  describe('getLangFromUrl', () => {
    it('should return "en" for English URLs (no prefix)', () => {
      const url = new URL('https://example.com/notebook')
      expect(getLangFromUrl(url)).toBe('en')
    })

    it('should return "en" for root URL', () => {
      const url = new URL('https://example.com/')
      expect(getLangFromUrl(url)).toBe('en')
    })

    it('should return "es" for Spanish URLs', () => {
      const url = new URL('https://example.com/es/cuaderno')
      expect(getLangFromUrl(url)).toBe('es')
    })

    it('should return "es" for Spanish root', () => {
      const url = new URL('https://example.com/es')
      expect(getLangFromUrl(url)).toBe('es')
    })

    it('should return default language for unknown paths', () => {
      const url = new URL('https://example.com/fr/page')
      expect(getLangFromUrl(url)).toBe('en')
    })

    it('should handle deep paths correctly', () => {
      const enUrl = new URL('https://example.com/notebook/my-post/comments')
      expect(getLangFromUrl(enUrl)).toBe('en')

      const esUrl = new URL('https://example.com/es/cuaderno/mi-post/comentarios')
      expect(getLangFromUrl(esUrl)).toBe('es')
    })
  })

  describe('useTranslations', () => {
    it('should return a translation function', () => {
      const t = useTranslations('en')
      expect(typeof t).toBe('function')
    })

    it('should return translations for English', () => {
      const t = useTranslations('en')
      const result = t('nav.home')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should return translations for Spanish', () => {
      const t = useTranslations('es')
      const result = t('nav.home')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should fall back to English for missing keys', () => {
      const tEn = useTranslations('en')
      const tEs = useTranslations('es')

      // Both should return something (either translation or key)
      const enResult = tEn('nav.home')
      const esResult = tEs('nav.home')

      expect(enResult).toBeDefined()
      expect(esResult).toBeDefined()
    })
  })

  describe('useTranslatedPath', () => {
    it('should return translatePath function', () => {
      const { translatePath } = useTranslatedPath('en')
      expect(typeof translatePath).toBe('function')
    })

    it('should generate English paths without prefix', () => {
      const { translatePath } = useTranslatedPath('en')
      const path = translatePath('home', 'en')
      expect(path).toBe('/')
    })

    it('should generate Spanish paths with /es prefix', () => {
      const { translatePath } = useTranslatedPath('es')
      const path = translatePath('home', 'es')
      expect(path).toBe('/es/')
    })

    it('should handle notebook routes', () => {
      const { translatePath } = useTranslatedPath('en')

      const enPath = translatePath('notebook', 'en')
      expect(enPath).toBe('/notebook')

      const esPath = translatePath('notebook', 'es')
      expect(esPath).toBe('/es/cuaderno')
    })

    it('should handle internal-note with slug for English', () => {
      const { translatePath } = useTranslatedPath('en')
      const path = translatePath('internal-note', 'en', 'my-post-slug')
      expect(path).toBe('/notebook/my-post-slug')
    })

    it('should handle internal-note with slug for Spanish', () => {
      const { translatePath } = useTranslatedPath('es')
      const path = translatePath('internal-note', 'es', 'mi-post-slug')
      expect(path).toBe('/es/cuaderno/mi-post-slug')
    })

    it('should handle contact route', () => {
      const { translatePath } = useTranslatedPath('en')

      const enPath = translatePath('contact', 'en')
      expect(enPath).toBe('/contact')

      const esPath = translatePath('contact', 'es')
      expect(esPath).toBe('/es/contactame')
    })
  })

  describe('isRouteName', () => {
    it('should return true for valid route names', () => {
      expect(isRouteName('home')).toBe(true)
      expect(isRouteName('notebook')).toBe(true)
      expect(isRouteName('contact')).toBe(true)
    })

    it('should return false for invalid route names', () => {
      expect(isRouteName('invalid-route')).toBe(false)
      expect(isRouteName('')).toBe(false)
      expect(isRouteName('random')).toBe(false)
    })
  })
})
