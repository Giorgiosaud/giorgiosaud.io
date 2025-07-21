import { defaultLang, resources } from '@i18n/ui'
import { routes } from './routes'

export type RouteNames = keyof typeof routes

export type SupportedLanguages = keyof typeof resources

type DeepKeyOf<T> = T extends object
  ? {
      [K in Extract<keyof T, string>]: T[K] extends object
        ? T[K] extends Array<any>
          ? `${K}` // Don't recurse into arrays
          : `${K}` | `${K}.${DeepKeyOf<T[K]>}`
        : `${K}`
    }[Extract<keyof T, string>]
  : never

export type NestedKeys = DeepKeyOf<(typeof resources)['en']>

function isSupportedLanguage(lang: string): lang is SupportedLanguages {
  return lang in resources
}

export function isRouteName(route: string): route is RouteNames {
  return route in routes
}
export function getLangFromUrl(url: URL): SupportedLanguages {
  const [, lang] = url.pathname.split('/')
  if (isSupportedLanguage(lang)) return lang
  return defaultLang
}

const get = (obj: unknown, path: string, defaultValue = ''): string => {
  if (!path) return defaultValue
  const keys = path
    .replace(/\[(\w+)\]/g, '.$1')
    .replace(/^\./, '')
    .split('.')
  let result: any = obj
  for (const key of keys) {
    if (result == null || typeof result !== 'object' || !(key in result)) {
      return defaultValue
    }
    result = result[key]
  }
  return result == null ? defaultValue : result
}

export function useTranslations(lang: SupportedLanguages) {
  return function t(key: NestedKeys) {
    return get(
      resources,
      `${lang}.${key}`,
      get(resources, `${defaultLang}.${key}`, key as string),
    )
  }
}

export function useTranslatedPath(lang: keyof typeof resources) {
  const translatePath = (
    path: RouteNames,
    l: SupportedLanguages = 'en',
    notePath?: string,
  ) => {
    if (path == 'internal-note') {
      if (l == 'en' && notePath) {
        return `/notebook/${notePath}`
      }
      if (l == 'es' && notePath) {
        return `/es/cuaderno/${notePath}`
      }
    }
    const innerPath = routes[path][l]
    if (l === defaultLang) {
      return '/' + innerPath
    }
    return `/${l}/${innerPath}`
  }
  return {
    translatePath,
  }
}
