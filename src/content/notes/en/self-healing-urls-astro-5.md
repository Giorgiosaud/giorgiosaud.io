---
draft: true
title: "Self-Healing URLs in Astro 5: Content Collections Update"
description: "Updated implementation of self-healing URLs for Astro 5's new content collections API. Learn the changes from getCollection to glob loaders and type-safe URL healing."
publishDate: 2026-01-02
cover: ../../../assets/images/selfhealing_url_lygv2g.webp
coverAlt: Self-Healing URLs Astro 5
selfHealing: slfhln
lang: en
category: Architecture
author: giorgio-saud
collections:
  - astro
  - architecture
tags:
  - astro
  - urls
  - seo
  - "2026"
---

## Self-Healing URLs: Updated for Astro 5

Self-healing URLs ensure that shared links remain functional even when the slug changes. Like Medium's `article-title-abc123` pattern, a unique identifier allows redirection to the current URL regardless of how the path is malformed.

Astro 5 introduced significant changes to content collections. Here's how to implement self-healing URLs with the new API.

## What Changed in Astro 5

### Old API (Astro 4)

```typescript
import { getCollection } from 'astro:content'

const notes = await getCollection('notes')
// notes[0].slug was auto-generated from filename
```

### New API (Astro 5)

```typescript
import { getCollection } from 'astro:content'

const notes = await getCollection('notes')
// notes[0].id is now the identifier
// Slug must be explicitly defined in frontmatter or derived from id
```

Key changes:
1. `slug` is no longer auto-generated - use `id` or explicit `slug` in frontmatter
2. Collections use `glob` loader with explicit configuration
3. References work differently with the new schema system

## Implementing Self-Healing Codes

### 1. Schema Definition

```typescript
// src/content/schemas/noteSchema.ts
import { z } from 'astro:content'

export const noteSchema = z.object({
  draft: z.boolean(),
  title: z.string(),
  description: z.string(),
  publishDate: z.date(),
  // Self-healing code: 6 characters, no vowels
  selfHealing: z.string().regex(/^[^aeiouAEIOU-]{6}$/).length(6),
  // ... other fields
})
```

### 2. Collection Configuration

```typescript
// src/content/notes/config.ts
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { noteSchema } from '../schemas/noteSchema'

export const notes = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.md',
    base: './src/content/notes/en',
  }),
  schema: noteSchema,
})
```

### 3. Generate Self-Healing Codes

Create a CLI tool for consistent code generation:

```typescript
// scripts/generateSelfHealingCode.ts
function generateCode(title: string): string {
  // Remove vowels and special characters
  const consonants = title
    .toLowerCase()
    .replace(/[aeiou\s\-\_\.\,\!\?\:\;]/g, '')
    .slice(0, 6)
    .padEnd(6, 'x')

  return consonants
}

function validateCode(code: string): boolean {
  return /^[^aeiouAEIOU-]{6}$/.test(code) && code.length === 6
}

// Usage
const title = process.argv[2]
const code = generateCode(title)
console.log(`selfHealing: "${code}"`)
```

### 4. Self-Healing Route Handler

```astro
---
// src/pages/notebook/[selfheal].astro
import { getCollection } from 'astro:content'

export const prerender = false

const path = Astro.url.pathname

// Extract potential self-healing code (6 consonants at end)
const codeMatch = path.match(/([^aeiouAEIOU\-\/]{6})(?:\/)?$/)

if (!codeMatch) {
  return Astro.redirect('/404')
}

const code = codeMatch[1]

// Find note with matching selfHealing code
const notes = await getCollection('notes', (entry) => {
  return entry.data.selfHealing === code
})

if (notes.length > 0) {
  const note = notes[0]
  // In Astro 5, use id or explicit slug
  const slug = note.data.slug || note.id.replace(/\.md$/, '')
  return Astro.redirect(`/notebook/${slug}`)
}

return Astro.redirect('/404')
---
```

### 5. Helper Functions

```typescript
// src/helpers/selfHeal.ts
import { getCollection } from 'astro:content'

export async function findNoteByHealingCode(code: string) {
  const notes = await getCollection('notes', (entry) => {
    return entry.data.selfHealing === code
  })
  return notes[0] || null
}

export function extractHealingCode(path: string): string | null {
  const match = path.match(/([^aeiouAEIOU\-\/]{6})(?:\/)?$/)
  return match ? match[1] : null
}

export function buildSharableUrl(baseUrl: string, slug: string, code: string): string {
  // Include healing code for resilient sharing
  return `${baseUrl}/notebook/${slug}-${code}`
}
```

## Using Self-Healing URLs

### In Templates

```astro
---
import { buildSharableUrl } from '@helpers/selfHeal'

const { note } = Astro.props
const shareUrl = buildSharableUrl(
  Astro.site.origin,
  note.id,
  note.data.selfHealing
)
---

<a href={shareUrl} class="share-link">
  Share this article
</a>
```

### Social Media Meta Tags

```astro
---
const canonicalUrl = `${Astro.site}notebook/${note.id}`
const shareUrl = `${Astro.site}notebook/${note.id}-${note.data.selfHealing}`
---

<head>
  <link rel="canonical" href={canonicalUrl} />
  <!-- Use healing URL for sharing -->
  <meta property="og:url" content={shareUrl} />
</head>
```

## Type-Safe Implementation

### With TypeScript

```typescript
// src/types/content.ts
import type { CollectionEntry } from 'astro:content'

type NoteEntry = CollectionEntry<'notes'>

export function getNoteUrl(note: NoteEntry): string {
  const slug = note.data.slug || note.id.replace(/\.md$/, '')
  return `/notebook/${slug}`
}

export function getShareableUrl(note: NoteEntry): string {
  const slug = note.data.slug || note.id.replace(/\.md$/, '')
  return `/notebook/${slug}-${note.data.selfHealing}`
}
```

## Migration from Astro 4

### Before (Astro 4)

```typescript
const notes = await getCollection('notes')
const redirect = `/notebook/${note.slug}`
```

### After (Astro 5)

```typescript
const notes = await getCollection('notes')
// Use id or explicit slug from frontmatter
const slug = note.data.slug || note.id.replace(/\.md$/, '')
const redirect = `/notebook/${slug}`
```

## SEO Considerations

### Canonical URLs

Always set canonical to the "clean" URL:

```astro
<link rel="canonical" href={`${Astro.site}notebook/${slug}`} />
```

### Sitemap

Include only canonical URLs in sitemap:

```typescript
// astro.config.mjs
export default defineConfig({
  integrations: [
    sitemap({
      filter: (page) => !page.includes('-') || page.split('-').pop().length !== 6
    })
  ]
})
```

## Testing Self-Healing

```typescript
// tests/selfHealing.test.ts
import { describe, it, expect } from 'vitest'
import { extractHealingCode, findNoteByHealingCode } from '@helpers/selfHeal'

describe('Self-Healing URLs', () => {
  it('extracts code from URL', () => {
    expect(extractHealingCode('/notebook/my-post-brwsrn')).toBe('brwsrn')
    expect(extractHealingCode('/notebook/brwsrn')).toBe('brwsrn')
  })

  it('rejects invalid codes', () => {
    expect(extractHealingCode('/notebook/post-abc')).toBe(null) // too short
    expect(extractHealingCode('/notebook/aeiou')).toBe(null) // vowels
  })
})
```

## Key Takeaways

1. **Astro 5 uses `id`** - Not `slug` for content identification
2. **Explicit slugs** - Define in frontmatter or derive from `id`
3. **Glob loader** - Collections configured with `glob()` pattern
4. **Code validation** - 6 consonants, regex validated in schema
5. **Canonical matters** - Always point canonical to clean URL

Self-healing URLs protect against link rot and improve share link resilience. With Astro 5's content collections changes, the implementation is slightly different but the concept remains powerful for SEO and user experience.
