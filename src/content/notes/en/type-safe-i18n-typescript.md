---
draft: false
title: "Type-Safe i18n: Deep Key Extraction in TypeScript"
description: "Learn how to build a type-safe internationalization system with recursive TypeScript types that provide full autocomplete for nested translation keys."
publishDate: 2026-01-02
cover: ../../../assets/images/type-safe-i18n-typescript.png
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
linkedinCopy: |
  Fellow devs — TypeScript autocomplete for every nested key in your translation files is not a nice-to-have, it is a typo-catching superpower. I built a recursive deep key extraction type that gives you full type safety for i18n without any code generation step. The TypeScript is a little gnarly but I explain every part. Sign in and share how you are handling i18n type safety in your projects.
  Read more: https://www.giorgiosaud.io/notebook/typsf1
  
  #TypeScript #i18n #FrontEnd #WebDev #TypeSafety #AutocompleteOrAnarchy #RecursiveTypesAreNotScary
twitterCopy: |
  Fellow devs — type-safe i18n in TypeScript with full autocomplete for nested translation keys. No codegen. Sign in and comment: https://www.giorgiosaud.io/notebook/typsf1 #TypeScript #AutocompleteOrAnarchy
---

So you've been there: you write `t('nav.hoem')` instead of `t('nav.home')`, ship it, and a user reports a blank link on production. Runtime error. No warning at build time. Nothing.

The usual approach to i18n treats translation keys as plain strings — which means TypeScript can't help you. I wanted autocomplete and compile-time errors for every key used on giorgiosaud.io, so I built a type that extracts all valid key paths from the translation object itself.

## The DeepKeyOf type

```typescript
type DeepKeyOf<T> = T extends object
  ? {
      [K in Extract<keyof T, string>]: T[K] extends object
        ? T[K] extends Array<unknown>
          ? `${K}`
          : `${K}` | `${K}.${DeepKeyOf<T[K]>}`
        : `${K}`
    }[Extract<keyof T, string>]
  : never
```

Give it a translation object and it returns a union of every valid dot-notation path. Arrays stop the recursion (you probably don't want `items.0.label` as a key). Everything else gets flattened into strings like `'nav.home'`, `'nav.nested.deep'`, `'footer.copyright'`.

## The t() function

```typescript
type NestedKeys = DeepKeyOf<(typeof resources)['en']>

const get = (obj: unknown, path: string, defaultValue = ''): string => {
  const keys = path.split('.')
  let result: unknown = obj
  for (const key of keys) {
    if (result == null || typeof result !== 'object') return defaultValue
    result = (result as Record<string, unknown>)[key]
  }
  return result == null ? defaultValue : String(result)
}

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

The fallback chain is: current language → default language → the key itself. So even if a Spanish translation is missing, you get the English string rather than an empty gap.

Using it in a component:

```astro
---
import { getLangFromUrl, useTranslations } from '@i18n/utils'
const lang = getLangFromUrl(Astro.url)
const t = useTranslations(lang)
---

<nav>
  <a href="/">{t('nav.home')}</a>
  <!-- t('nav.hoem') is now a TypeScript error, not a runtime surprise -->
</nav>
```

## Route translation

UI strings and URL paths are different problems. For routes I keep a separate map:

```typescript
export const routes = {
  notebook: { en: 'notebook', es: 'cuaderno' },
  contact: { en: 'contact', es: 'contactame' },
} as const

export type RouteNames = keyof typeof routes

export function useTranslatedPath(lang: SupportedLanguages) {
  const translatePath = (path: RouteNames, targetLang: SupportedLanguages = lang, slug?: string) => {
    const basePath = routes[path][targetLang]
    if (targetLang === defaultLang) {
      return slug ? `/${basePath}/${slug}` : `/${basePath}`
    }
    return slug ? `/${targetLang}/${basePath}/${slug}` : `/${targetLang}/${basePath}`
  }
  return { translatePath }
}
```

`translatePath('notebook', 'es')` gives you `/es/cuaderno`. `RouteNames` is inferred from the object so adding a new route automatically adds it to the type — no separate list to maintain.

The initial setup takes an hour or two but after that every typo is caught before it ships. Worth it.
