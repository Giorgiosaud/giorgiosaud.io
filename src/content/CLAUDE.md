# Content Collections Guide

This directory contains all content collections for the multilingual website. Each collection has English (`/en`) and Spanish (`/es`) versions.

## Collection Structure

Each collection is defined in `{collection}/config.ts` with:
- **Loader**: `glob` loader pointing to language-specific base directory
- **Schema**: Zod schema for type-safe frontmatter validation
- **Pattern**: `**/[^_]*.(md|mdx)` ignores files starting with `_`

## Creating New Collections

1. Create directory: `src/content/{name}/`
2. Create subdirectories: `en/` and `es/`
3. Create `config.ts` with both collection definitions:

```typescript
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const schema = z.object({
  title: z.string(),
  // ... other fields
})

export const myCollection = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.md',
    base: './src/content/myCollection/en',
  }),
  schema,
})

export const miColeccion = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.md',
    base: './src/content/myCollection/es',
  }),
  schema,
})

export default { myCollection, miColeccion }
```

4. Register in `src/content.config.ts`:
```typescript
import * as MyCollection from 'content/myCollection/config'

export const collections = {
  ...MyCollection,
  // ... other collections
}
```

## Notes Collection Specifics

The notes/notas collection has special features:

### Self-Healing URLs
- Required field: `selfHealing: z.string().regex(/^[^aeiouAEIOU-]{6}$/).length(6)`
- Must be exactly 6 characters with no vowels or dashes
- Used by `src/helpers/selfHeal.ts` to redirect old URLs to current note slugs
- Example: `selfHealing: "rhythm"` or `selfHealing: "frgmnt"`

### References
- `author: reference('team')` - Links to team member (must exist in team/equipo)
- `collections: z.array(reference('collections'))` - Links to categories
- Astro validates these references at build time

### Draft Handling
- `draft: z.boolean()` - Required field
- Draft posts are accessible in dev mode but excluded from production builds

## Common Schema Fields

Standard fields across collections:
- `draft: z.boolean()` - Controls visibility
- `publishDate: z.date()` - Automatically parsed from ISO strings
- `title: z.string()` - Required display title
- `image: z.object({ src: z.string(), alt: z.string() })` - Structured images

## Writing Content

Content files go in language-specific directories:
- English: `src/content/{collection}/en/{slug}.md`
- Spanish: `src/content/{collection}/es/{slug}.md`

Frontmatter example:
```yaml
---
draft: false
title: "My Note Title"
publishDate: "2025-01-01"
selfHealing: "smthng"
author: team/giorgio-saud
collections:
  - collections/web-dev
tags: ["typescript", "astro"]
---

Content goes here...
```

## Technologies Collection

Special case - uses JSON data files instead of markdown:
- Defined in `technologies/config.ts`
- Uses `type: 'data'` loader
- Schema: `{ id: string, techs: string[] }`
