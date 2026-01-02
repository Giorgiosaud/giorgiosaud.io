# Internationalization (i18n) Guide

This directory contains all internationalization logic for the bilingual (English/Spanish) website.

## File Structure

- `ui.ts` - Language configuration and resources registry
- `routes.ts` - Route name translations for each language
- `utils.ts` - Translation utilities and helper functions
- `locales/en/` - English translation strings (organized by feature)
- `locales/es/` - Spanish translation strings (organized by feature)

## Language Configuration

**Default Language**: English (`en`) - no URL prefix
**Secondary Language**: Spanish (`es`) - uses `/es` prefix

Defined in `ui.ts`:
```typescript
export const languages = [
  { name: 'English', code: 'en', path: '' },
  { name: 'Español', code: 'es', path: '/es' },
]
```

## Translation System

### Adding UI Translations

1. Add translation keys to `locales/en/{feature}.ts`:
```typescript
export const header = {
  title: 'My Website',
  subtitle: 'Welcome',
}
```

2. Add corresponding Spanish translations to `locales/es/{feature}.ts`:
```typescript
export const header = {
  title: 'Mi Sitio Web',
  subtitle: 'Bienvenido',
}
```

3. Use in components:
```astro
---
import { useTranslations } from '@i18n/utils'

const lang = getLangFromUrl(Astro.url)
const t = useTranslations(lang)
---

<h1>{t('header.title')}</h1>
```

### Type-Safe Translations

The system provides full TypeScript autocomplete for translation keys via the `NestedKeys` type. It extracts all possible keys from the English translation object using recursive types.

## Routing System

### Route Translations

Route names are defined in `routes.ts`:
```typescript
export const routes = {
  notebook: {
    es: 'cuaderno',
    en: 'notebook',
  },
  contact: {
    es: 'contactame',
    en: 'contact',
  },
}
```

### Using Translated Paths

```astro
---
import { useTranslatedPath } from '@i18n/utils'

const lang = getLangFromUrl(Astro.url)
const { translatePath } = useTranslatedPath(lang)
---

<a href={translatePath('notebook', lang)}>
  {lang === 'en' ? 'Notebook' : 'Cuaderno'}
</a>
```

For notes with dynamic slugs:
```typescript
translatePath('internal-note', 'en', 'my-note-slug')
// Returns: /notebook/my-note-slug

translatePath('internal-note', 'es', 'my-note-slug')
// Returns: /es/cuaderno/my-note-slug
```

## Utility Functions

### `getLangFromUrl(url: URL)`
Extracts language from URL path. Returns `'en'` or `'es'`, defaulting to `'en'`.

### `useTranslations(lang: SupportedLanguages)`
Returns a `t()` function for translations with nested key support:
```typescript
const t = useTranslations('en')
t('header.title') // Type-safe key access
```

### `useTranslatedPath(lang: SupportedLanguages)`
Returns `translatePath()` function for generating localized URLs.

### `isRouteName(route: string)`
Type guard to check if a string is a valid route name.

## Content Collections i18n

Content collections handle language separation differently:
- English content: `src/content/{collection}/en/`
- Spanish content: `src/content/{collection}/es/`
- Each has its own collection name (e.g., `notes` vs `notas`)

See `src/content/CLAUDE.md` for details.

## Adding a New Language

1. Add language config to `ui.ts`:
```typescript
export const languages = [
  // ... existing
  { name: 'Français', code: 'fr', path: '/fr' },
]
```

2. Create `locales/fr/` directory with all translation files

3. Import and add to resources in `ui.ts`:
```typescript
import * as fr from '@i18n/locales/fr'
export const resources = { en, es, fr }
```

4. Add route translations to `routes.ts`

5. Create content collection directories: `src/content/{collection}/fr/`

6. Update collection configs to include French versions
