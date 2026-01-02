---
draft: false
title: "i18n Type-Safe: Extracción de Claves Profundas en TypeScript"
description: "Aprende a construir un sistema de internacionalización type-safe con tipos TypeScript recursivos que proporcionan autocompletado completo para claves de traducción anidadas."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
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

## El Problema con Traducciones Basadas en Strings

La mayoría de librerías i18n usan claves de string:

```typescript
t('nav.home')  // Sin autocompletado, sin verificación de tipos
t('nav.hoem')  // ¿Typo? Error en runtime o texto faltante
```

¿Qué si pudieras tener autocompletado completo y verificación en tiempo de compilación para claves de traducción? Eso es lo que construiremos.

## El Tipo DeepKeyOf

La magia es un tipo TypeScript recursivo que extrae todas las rutas de claves anidadas posibles:

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

Desglosemos esto:

1. **Caso base**: Si `T` no es objeto, retorna `never`
2. **Para cada clave `K`**: Verifica si el valor es un objeto
3. **Si es objeto (no array)**: Crea tanto rutas `K` como `K.anidado`
4. **Si es primitivo o array**: Solo retorna `K`

## Ejemplo Práctico

Dado este objeto de traducciones:

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

`DeepKeyOf<typeof translations>` produce:

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

## La Función de Traducción

Ahora construye una función `t()` type-safe:

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

Características clave:
- **Claves type-safe**: `NestedKeys` solo permite rutas válidas
- **Cadena de fallback**: Intenta idioma actual → idioma por defecto → clave misma
- **Notación de punto**: Maneja objetos anidados naturalmente

## Usándolo en Componentes

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

## Organizando Traducciones

Estructura tus traducciones por característica:

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

Cada archivo de característica:

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

Re-exportar desde index:

```typescript
// locales/en/index.ts
export * from './nav'
export * from './footer'
```

## Traducción de Rutas

Para rutas URL, mantén un mapa de rutas separado:

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

Y un traductor de rutas:

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

Uso:

```typescript
const { translatePath } = useTranslatedPath('en')

translatePath('notebook', 'en')  // '/notebook'
translatePath('notebook', 'es')  // '/es/cuaderno'
```

## Detección de Idioma

Extraer idioma desde URL:

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

## Ejemplo Completo

Así es como todo se une:

```astro
---
import { getLangFromUrl, useTranslations, useTranslatedPath } from '@i18n/utils'

const lang = getLangFromUrl(Astro.url)
const t = useTranslations(lang)
const { translatePath } = useTranslatedPath(lang)

// Obtener idioma opuesto para el switcher
const altLang = lang === 'en' ? 'es' : 'en'
---

<header>
  <nav>
    <a href={translatePath('home', lang)}>{t('nav.home')}</a>
    <a href={translatePath('notebook', lang)}>{t('nav.notebook')}</a>
    <a href={translatePath('contact', lang)}>{t('nav.contact')}</a>
  </nav>

  <!-- Selector de idioma -->
  <a href={translatePath('home', altLang)}>
    {altLang === 'es' ? 'Español' : 'English'}
  </a>
</header>
```

## Puntos Clave

1. **Tipos recursivos** - `DeepKeyOf` extrae todas las rutas anidadas
2. **Template literal types** - Construye uniones de strings desde formas de objetos
3. **Type guards** - `isSupportedLanguage` reduce string a unión
4. **Cadenas de fallback** - Intenta actual → defecto → clave para resiliencia
5. **Separar concerns** - Traducciones UI vs traducciones de rutas

La inversión inicial en configurar i18n type-safe se paga inmediatamente. Cada clave de traducción obtiene autocompletado, los typos se convierten en errores de compilación, y refactorizar es seguro.
