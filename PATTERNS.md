# Architectural Patterns

Quick reference for the main patterns implemented in this codebase.

## 1. Content Collections with Bilingual Support

**Files**: `src/content/*/config.ts`

Each collection is defined twice (EN/ES) with shared Zod schemas:

```typescript
export const notes = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.(md|mdx)',  // Files starting with _ are ignored
    base: './src/content/notes/en',
  }),
  schema: ({ image }) => z.object({
    draft: z.boolean(),
    title: z.string(),
    selfHealing: z.string().regex(/^[^aeiouAEIOU-]{6}$/).length(6),
    publishDate: z.date(),
    author: reference('team'),           // Cross-collection link
    collections: z.array(reference('collections')),
  }),
})
```

**Key features**:
- `reference()` validates links at build time
- `z.date()` auto-parses ISO strings to Date objects
- Pattern `[^_]*` ignores draft files prefixed with `_`

## 2. Self-Healing URLs

**Files**: `src/helpers/selfHeal.ts`, `src/pages/notebook/[selfheal].astro`

6-character consonant-only codes for URL stability when slugs change:

```typescript
export async function selfHeal(Astro, collectionName) {
  const notes = await getCollection(collectionName)
  const selfHealRegex = /(?<=^|-)[^aeiouAEIOU-]{6}(?=-|$)/g
  const selfHealing = Astro.params.selfheal?.match(selfHealRegex) || []

  for (const sh of selfHealing) {
    const note = notes.find(note => note.data.selfHealing === sh)
    if (note) {
      return Astro.redirect(`${basePath}/${note.id}`, 301)
    }
  }
  return null
}
```

**Flow**: Old URL contains code → Match code to note → 301 redirect to current slug

## 3. Type-Safe Internationalization

**Files**: `src/global/i18n/utils.ts`, `routes.ts`, `ui.ts`

Nested key autocomplete via recursive TypeScript types:

```typescript
type DeepKeyOf<T> = T extends object
  ? { [K in Extract<keyof T, string>]: T[K] extends object
      ? `${K}` | `${K}.${DeepKeyOf<T[K]>}`
      : `${K}`
    }[Extract<keyof T, string>]
  : never

export function useTranslations(lang: SupportedLanguages) {
  return function t(key: NestedKeys) {
    return get(resources, `${lang}.${key}`, /* fallback */)
  }
}
```

**Usage**:
```typescript
const t = useTranslations(lang)
t('nav.home')  // Fully type-checked
```

Route translations in `routes.ts`:
```typescript
export const routes = {
  notebook: { es: 'cuaderno', en: 'notebook' },
}
```

## 4. Multi-Framework Islands

**Files**: `src/components/*.astro`, `src/example-components/{react,vue,svelte}/`

Astro's islands architecture allows mixed frameworks:

- **React** (`.tsx`) - Interactive components with hooks
- **Vue** (`.vue`) - Composition API components
- **Svelte** (`.svelte`) - Reactive components
- **Astro** (`.astro`) - Server-rendered by default

Only add `client:*` when interactivity is needed:
```astro
<ReactButton client:visible />   <!-- Hydrate when visible -->
<VueCounter client:idle />       <!-- Hydrate on idle -->
<SvelteForm client:load />       <!-- Hydrate immediately -->
```

## 5. CSS Architecture

**Files**: `src/global/styles/global.css`, `src/components/Note.astro`

### CSS Layers
```css
@layer reset, root, global, grid;
```

### Container Queries
```css
@container note (min-width: 301px) {
  .wrapper { /* tablet layout */ }
}
@container note (min-width: 501px) {
  .wrapper { display: grid; grid-template-columns: 1fr 1fr; }
}
```

### Fluid Typography
```css
h1 { font-size: clamp(2.5rem, 6vw, 4rem); }
```

### Light/Dark Theming
```css
:root { color-scheme: light dark; }
h1 { color: light-dark(var(--color-dark), var(--color-light)); }
```

### View Transitions
```css
@view-transition { navigation: auto; }
.header { view-transition-name: header; }
```

## 6. Server Actions

**Files**: `src/actions/sendEmail.ts`, `src/actions/index.ts`

Type-safe form handling with Zod validation:

```typescript
export const sendEmail = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string(),
    email: z.string().email(),
    message: z.string().min(10).max(500),
  }),
  handler: async input => {
    const { data, error } = await resend.emails.send({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: [RESEND_TO_EMAIL],
      subject: `Email from ${input.name}`,
      html: `<h1>New message from ${input.name}</h1>...`,
    })
    if (error) throw new ActionError({ code: 'BAD_REQUEST', message: error.message })
    return data
  },
})
```

## 7. Performance Patterns

**Files**: `astro.config.mjs`, `src/global/components/Head/index.astro`

### ISR (Incremental Static Regeneration)
```javascript
adapter: vercel({ isr: true, skewProtection: true })
```

### Speculation Rules
```html
<script type="speculationrules">
{ "prerender": [{ "source": "document", "where": { "href_matches": "/*" }, "eagerness": "moderate" }] }
</script>
```

### Font Preloading
```html
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin />
```

## 8. Path Aliases

**File**: `tsconfig.json`

```json
{
  "paths": {
    "@components/*": ["src/components/*"],
    "@global-components/*": ["src/global/components/*"],
    "@templates/*": ["src/global/templates/*"],
    "@i18n/*": ["src/global/i18n/*"],
    "@helpers/*": ["src/helpers/*"],
    "@images/*": ["src/assets/images/*"]
  }
}
```

**Usage**:
```typescript
import { selfHeal } from '@helpers/selfHeal'
import { useTranslations } from '@i18n/utils'
```
