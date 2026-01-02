import { defaultLang, resources } from '@i18n/ui'
import { routes } from './routes'

/** All available route names defined in routes.ts */
export type RouteNames = keyof typeof routes

/** Supported language codes ('en' | 'es') */
export type SupportedLanguages = keyof typeof resources

/**
 * Recursively extracts all possible nested key paths from an object type.
 * Used to provide type-safe translation key autocomplete.
 *
 * @example
 * // For { nav: { home: 'Home', about: 'About' } }
 * // Produces: 'nav' | 'nav.home' | 'nav.about'
 */
type DeepKeyOf<T> = T extends object
  ? {
      [K in Extract<keyof T, string>]: T[K] extends object
        ? T[K] extends Array<unknown>
          ? `${K}` // Don't recurse into arrays
          : `${K}` | `${K}.${DeepKeyOf<T[K]>}`
        : `${K}`
    }[Extract<keyof T, string>]
  : never

/** All valid translation key paths based on English translations */
export type NestedKeys = DeepKeyOf<(typeof resources)['en']>

function isSupportedLanguage(lang: string): lang is SupportedLanguages {
  return lang in resources
}

/**
 * Type guard to check if a string is a valid route name.
 * @param route - The route string to check
 */
export function isRouteName(route: string): route is RouteNames {
  return route in routes
}

/**
 * Extracts the language code from a URL pathname.
 * Returns 'es' if the path starts with /es/, otherwise returns default language.
 *
 * @param url - The URL object to extract language from
 * @returns The detected language code
 *
 * @example
 * getLangFromUrl(new URL('https://site.com/es/cuaderno')) // 'es'
 * getLangFromUrl(new URL('https://site.com/notebook'))    // 'en'
 */
export function getLangFromUrl(url: URL): SupportedLanguages {
  const [, lang] = url.pathname.split('/')
  if (isSupportedLanguage(lang)) return lang
  return defaultLang
}

/**
 * Safely retrieves a nested value from an object using dot notation.
 * @internal
 */
const get = (obj: unknown, path: string, defaultValue = ''): string => {
  if (!path) return defaultValue
  const keys = path
    .replace(/\[(\w+)\]/g, '.$1')
    .replace(/^\./, '')
    .split('.')
  let result: unknown = obj
  for (const key of keys) {
    if (
      result == null ||
      typeof result !== 'object' ||
      !((key in result) as unknown as Record<string, unknown>)
    ) {
      return defaultValue
    }
    result = (result as Record<string, unknown>)[key]
  }
  return result == null ? defaultValue : String(result)
}

/**
 * Creates a type-safe translation function for the specified language.
 * Falls back to default language (English) if translation key is missing.
 *
 * @param lang - The target language code
 * @returns A translation function that accepts nested keys with autocomplete
 *
 * @example
 * const t = useTranslations('es')
 * t('nav.home')     // Returns Spanish translation
 * t('nav.contact')  // Falls back to English if not found
 */
export function useTranslations(lang: SupportedLanguages) {
  return function t(key: NestedKeys) {
    return get(
      resources,
      `${lang}.${key}`,
      get(resources, `${defaultLang}.${key}`, key as string),
    )
  }
}

/**
 * Creates a path translator for generating localized URLs.
 *
 * @param _lang - The current language context (used for future extensions)
 * @returns Object containing translatePath function
 *
 * @example
 * const { translatePath } = useTranslatedPath('en')
 * translatePath('notebook', 'es')           // '/es/cuaderno'
 * translatePath('notebook', 'en')           // '/notebook'
 * translatePath('internal-note', 'es', 'my-post')  // '/es/cuaderno/my-post'
 */
export function useTranslatedPath(_lang: keyof typeof resources) {
  const translatePath = (
    path: RouteNames,
    l: SupportedLanguages = 'en',
    notePath?: string,
  ) => {
    if (path === 'internal-note') {
      if (l === 'en' && notePath) {
        return `/notebook/${notePath}`
      }
      if (l === 'es' && notePath) {
        return `/es/cuaderno/${notePath}`
      }
    }
    const innerPath = routes[path][l]
    if (l === defaultLang) {
      return `/${innerPath}`
    }
    return `/${l}/${innerPath}`
  }
  return {
    translatePath,
  }
}
