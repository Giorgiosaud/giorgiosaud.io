---
draft: true
slug: i18n-tipado-seguro-typescript
title: "i18n Type-Safe: Extracción de Claves Profundas en TypeScript"
description: "Aprende a construir un sistema de internacionalización type-safe con tipos TypeScript recursivos que proporcionan autocompletado completo para claves de traducción anidadas."
publishDate: 2026-01-02
cover: ../../../assets/images/type-safe-i18n-typescript.png
coverAlt: Ilustración de i18n Type-Safe
selfHealing: typsf1
lang: es
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

El problema con la mayoría de librerías i18n es que las claves son strings sueltos:

```typescript
t('nav.home')  // Sin autocompletado, sin verificación de tipos
t('nav.hoem')  // Un typo — error silencioso en runtime
```

Lo aprendí de las malas. Un typo en una clave de traducción no te explota en build time — simplemente muestra texto vacío o la clave cruda al usuario. Armé un sistema type-safe para que eso no pase.

## El tipo DeepKeyOf

La base es un tipo recursivo que extrae todas las rutas posibles de un objeto anidado:

```typescript
type DeepKeyOf<T> = T extends object
  ? {
      [K in Extract<keyof T, string>]: T[K] extends object
        ? T[K] extends Array<unknown>
          ? `${K}` // No recursar en arrays
          : `${K}` | `${K}.${DeepKeyOf<T[K]>}`
        : `${K}`
    }[Extract<keyof T, string>]
  : never
```

Dado esto:

```typescript
const translations = {
  nav: {
    home: 'Inicio',
    about: 'Acerca de',
    nested: {
      deep: 'Valor profundo'
    }
  },
  footer: {
    copyright: '© 2026'
  }
}
```

`DeepKeyOf<typeof translations>` te genera la unión completa: `'nav'`, `'nav.home'`, `'nav.about'`, `'nav.nested'`, `'nav.nested.deep'`, `'footer'`, `'footer.copyright'`. TypeScript te va a autocompletar cada una de esas.

## La función t()

Con el tipo armado, construís la función de traducción:

```typescript
// Define claves válidas basadas en traducciones en inglés
type NestedKeys = DeepKeyOf<(typeof resources)['en']>

// Helper para obtener valores anidados de forma segura
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

// La función de traducción type-safe
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

La cadena de fallback es importante: intenta el idioma actual, después el idioma por defecto, y si no encuentra nada te devuelve la clave. Así nunca mostrás una pantalla rota.

## Usándolo en componentes

```astro
---
import { getLangFromUrl, useTranslations } from '@i18n/utils'

const lang = getLangFromUrl(Astro.url)
const t = useTranslations(lang)
---

<nav>
  <a href="/">{t('nav.home')}</a>       <!-- ¡El autocompletado funciona! -->
  <a href="/about">{t('nav.about')}</a>
  <!-- t('nav.hoem') sería un error de TypeScript -->
</nav>
```

## Traducción de rutas

Para las URLs también conviene tener tipado. Usá un mapa de rutas separado:

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

Y el helper para traducirlas:

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

Entonces:

```typescript
const { translatePath } = useTranslatedPath('en')

translatePath('notebook', 'en')  // '/notebook'
translatePath('notebook', 'es')  // '/es/cuaderno'
```

La inversión inicial en configurar esto se paga sola. Cualquier typo en una clave de traducción se convierte en error de compilación, y refactorizar es seguro. Eso es todo por ahora.
