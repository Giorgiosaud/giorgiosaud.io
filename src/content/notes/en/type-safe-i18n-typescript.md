---
draft: true
title: "Type-Safe i18n: Deep Key Extraction in TypeScript"
description: "Learn how to build a type-safe internationalization system with recursive TypeScript types that provide full autocomplete for nested translation keys."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
coverAlt: Type-Safe i18n illustration
selfHealing: typsf1
lang: en
category: Development
author: giorgio-saud
collections:
  - typescript
  - patterns
tags:
  - typescript
  - i18n
  - type-safety
  - design-patterns
---

## The Problem with Stringly-Typed Translations

Most i18n libraries use string keys:

```typescript
t('nav.home')  // No autocomplete, no type checking
t('nav.hoem')  // Typo? Runtime error or missing text
```

What if you could have full autocomplete and compile-time checking for translation keys? That's what we'll build.

## The DeepKeyOf Type

The magic is a recursive TypeScript type that extracts all possible nested key paths:

```typescript
type DeepKeyOf<T> = T extends object
  ? {
      [K in Extract<keyof T, string>]: T[K] extends object
        ? T[K] extends Array<unknown>
          ? `${K}` // Don't recurse into arrays
          : `${K}` | `${K}.${DeepKeyOf<T[K]>}`
        : `${K}`
    }[Extract<keyof T, string>]
  : never
```

Let's break this down:

1. **Base case**: If `T` isn't an object, return `never`
2. **For each key `K`**: Check if the value is an object
3. **If object (not array)**: Create both `K` and `K.nested` paths
4. **If primitive or array**: Just return `K`

## Practical Example

Given this translation object:

```typescript
const translations = {
  nav: {
    home: 'Home',
    about: 'About',
    nested: {
      deep: 'Deep value'
    }
  },
  footer: {
    copyright: '© 2026'
  }
}
```

`DeepKeyOf<typeof translations>` produces:

```typescript
type Keys =
  | 'nav'
  | 'nav.home'
  | 'nav.about'
  | 'nav.nested'
  | 'nav.nested.deep'
  | 'footer'
  | 'footer.copyright'
```

## The Translation Function

Now build a type-safe `t()` function:

```typescript
// Define valid keys based on your English translations
type NestedKeys = DeepKeyOf<(typeof resources)['en']>

// Helper to safely get nested values
const get = (obj: unknown, path: string, defaultValue = ''): string => {
  const keys = path.split('.')
  let result: unknown = obj

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue
    }
    result = (result as Record<string, unknown>)[key]
  }

  return result == null ? defaultValue : String(result)
}

// The type-safe translation function
export function useTranslations(lang: SupportedLanguages) {
  return function t(key: NestedKeys) {
    return get(
      resources,
      `${lang}.${key}`,
      get(resources, `${defaultLang}.${key}`, key as string)
    )
  }
}
```

Key features:
- **Type-safe keys**: `NestedKeys` only allows valid paths
- **Fallback chain**: Try current language → default language → key itself
- **Dot notation**: Handles nested objects naturally

## Using It in Components

```astro
---
import { getLangFromUrl, useTranslations } from '@i18n/utils'

const lang = getLangFromUrl(Astro.url)
const t = useTranslations(lang)
---

<nav>
  <a href="/">{t('nav.home')}</a>       <!-- Autocomplete works! -->
  <a href="/about">{t('nav.about')}</a>
  <!-- t('nav.hoem') would be a TypeScript error -->
</nav>
```

## Organizing Translations

Structure your translations by feature:

```
src/i18n/
├── locales/
│   ├── en/
│   │   ├── nav.ts
│   │   ├── footer.ts
│   │   └── index.ts
│   └── es/
│       ├── nav.ts
│       ├── footer.ts
│       └── index.ts
├── ui.ts
└── utils.ts
```

Each feature file:

```typescript
// locales/en/nav.ts
export const nav = {
  home: 'Home',
  about: 'About',
  contact: 'Contact',
}

// locales/es/nav.ts
export const nav = {
  home: 'Inicio',
  about: 'Acerca de',
  contact: 'Contacto',
}
```

Re-export from index:

```typescript
// locales/en/index.ts
export * from './nav'
export * from './footer'
```

## Route Translation

For URL paths, maintain a separate route map:

```typescript
// routes.ts
export const routes = {
  notebook: {
    en: 'notebook',
    es: 'cuaderno',
  },
  contact: {
    en: 'contact',
    es: 'contactame',
  },
} as const

export type RouteNames = keyof typeof routes
```

And a path translator:

```typescript
export function useTranslatedPath(lang: SupportedLanguages) {
  const translatePath = (
    path: RouteNames,
    targetLang: SupportedLanguages = lang,
    slug?: string
  ) => {
    const basePath = routes[path][targetLang]

    if (targetLang === defaultLang) {
      return slug ? `/${basePath}/${slug}` : `/${basePath}`
    }
    return slug ? `/${targetLang}/${basePath}/${slug}` : `/${targetLang}/${basePath}`
  }

  return { translatePath }
}
```

Usage:

```typescript
const { translatePath } = useTranslatedPath('en')

translatePath('notebook', 'en')  // '/notebook'
translatePath('notebook', 'es')  // '/es/cuaderno'
```

## Language Detection

Extract language from URL:

```typescript
export function getLangFromUrl(url: URL): SupportedLanguages {
  const [, lang] = url.pathname.split('/')

  if (isSupportedLanguage(lang)) return lang
  return defaultLang
}

function isSupportedLanguage(lang: string): lang is SupportedLanguages {
  return lang in resources
}
```

## Complete Example

Here's how it all comes together:

```astro
---
import { getLangFromUrl, useTranslations, useTranslatedPath } from '@i18n/utils'

const lang = getLangFromUrl(Astro.url)
const t = useTranslations(lang)
const { translatePath } = useTranslatedPath(lang)

// Get opposite language for switcher
const altLang = lang === 'en' ? 'es' : 'en'
---

<header>
  <nav>
    <a href={translatePath('home', lang)}>{t('nav.home')}</a>
    <a href={translatePath('notebook', lang)}>{t('nav.notebook')}</a>
    <a href={translatePath('contact', lang)}>{t('nav.contact')}</a>
  </nav>

  <!-- Language switcher -->
  <a href={translatePath('home', altLang)}>
    {altLang === 'es' ? 'Español' : 'English'}
  </a>
</header>
```

## Key Takeaways

1. **Recursive types** - `DeepKeyOf` extracts all nested paths
2. **Template literal types** - Build string unions from object shapes
3. **Type guards** - `isSupportedLanguage` narrows string to union
4. **Fallback chains** - Try current → default → key for resilience
5. **Separate concerns** - UI translations vs route translations

The initial investment in setting up type-safe i18n pays off immediately. Every translation key gets autocomplete, typos become compile errors, and refactoring is safe.
