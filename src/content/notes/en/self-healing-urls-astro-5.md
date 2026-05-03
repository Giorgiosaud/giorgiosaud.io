---
draft: false
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

Here's a short story about link rot. You publish a post called "Getting Started with Astro". The URL is `/notebook/getting-started-with-astro`. Someone shares it on Twitter. Six months later you rename the post to "Astro Quickstart Guide" because the old title was boring. Now that tweet link is dead.

Medium solved this years ago with URLs like `/my-post-title-a3f7b2` — a short code at the end that never changes even when the title does. I built the same thing for giorgiosaud.io, and it runs on every note you're reading right now.

## How it works

Each note has a `selfHealing` field in frontmatter — 6 consonants, no vowels, generated from the title:

```typescript
// src/content/schemas/noteSchema.ts
selfHealing: z.string().regex(/^[^aeiouAEIOU-]{6}$/).length(6),
```

There's a CLI to generate these:

```bash
bun run generate:selfheal "Self-Healing URLs in Astro 5"
# → selfHealing: "slfhln"
```

Then a catch-all route intercepts any URL containing a valid 6-consonant code and redirects to wherever the note actually lives:

```astro
---
// src/pages/notebook/[selfheal].astro
import { getCollection } from 'astro:content'

export const prerender = false

const path = Astro.url.pathname
const codeMatch = path.match(/([^aeiouAEIOU\-\/]{6})(?:\/)?$/)

if (!codeMatch) return Astro.redirect('/404')

const code = codeMatch[1]
const notes = await getCollection('notes', (entry) => entry.data.selfHealing === code)

if (notes.length > 0) {
  const note = notes[0]
  const slug = note.data.slug || note.id.replace(/\.md$/, '')
  return Astro.redirect(`/notebook/${slug}`)
}

return Astro.redirect('/404')
---
```

So `/notebook/anything-slfhln` or just `/notebook/slfhln` both find this post and redirect to the canonical URL. The title can change as many times as you want.

## What changed from Astro 4 to Astro 5

The main difference is how you derive the redirect target. Astro 4 gave you an auto-generated `slug`; Astro 5 uses `id` instead:

**Astro 4:**
```typescript
const redirect = `/notebook/${note.slug}`
```

**Astro 5:**
```typescript
const slug = note.data.slug || note.id.replace(/\.md$/, '')
const redirect = `/notebook/${slug}`
```

Collections are also configured differently now, using the `glob` loader:

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

That's really the whole migration. The self-healing concept is identical — the code just lands in `note.id` instead of `note.slug`.

Every note on this site has had a `selfHealing` code since the beginning, and I've renamed a few posts since then without breaking any shared links. Worth the small upfront setup.
