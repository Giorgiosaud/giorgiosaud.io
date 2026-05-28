---
draft: false
title: "Self-Healing URLs in Astro + Vercel: Implementation, Gotchas, and the Right Approach"
description: "How to implement self-healing URLs in Astro deployed on Vercel — what works, what silently fails, and the correct architecture after hitting every gotcha along the way."
publishDate: 2026-05-27
cover: ../../../assets/images/selfhealing-urls-astro-vercel.png
coverAlt: Self-Healing URLs in Astro and Vercel — broken URL redirected through middleware to the correct slug
selfHealing: slfhln
lang: en
category: Development
author: giorgio-saud
collections:
  - astro
  - frontend
tags:
  - astro
  - vercel
  - routing
  - middleware
  - "2026"
---

A self-healing URL is a short code embedded in a URL that lets the server redirect to the correct destination even if the rest of the URL is wrong or outdated. This post documents the real implementation path — including every approach that failed — on an Astro site deployed to Vercel.

## What Self-Healing URLs Solve

When a blog post is renamed (and therefore its slug changes), any existing link to the old URL breaks. Self-healing codes sidestep this: a 6-character consonant-only code is assigned to each post and embedded in the URL. Even if the slug is wrong or absent, the code identifies where to send the user.

**Examples:**
- `/notebook/bttrth` → redirects to `/notebook/better-auth-drizzle-neon-astro`
- `/notebook/better-auth-drizzle-neon-astro-bttrth` → same destination
- `/notebook/old-post-title-bttrth` → same destination, even with a stale slug

---

## The Code Format

A self-healing code is 6 characters with only consonants (no vowels, no digits, no dashes). This makes them readable, unambiguous, and unlikely to match real words.

Valid character set: `b c d f g h j k l m n p q r s t v w x y z`

Generate one from a post title:

```bash
bun run generate:selfheal "Better Auth Drizzle Neon Astro"
# → bttrth
```

The code goes in the frontmatter of every note:

```yaml
---
title: "Better Auth with Drizzle, Neon, and Astro"
selfHealing: bttrth
---
```

---

## Architecture: Three Cases to Handle

| URL Pattern | Example | Handler |
|-------------|---------|---------|
| Pure code (standalone) | `/notebook/bttrth` | Prerendered static page |
| Embedded code (end of slug) | `/notebook/any-slug-bttrth` | Middleware + Vercel routing |
| Embedded code (middle of slug) | `/notebook/any-bttrth-slug` | Middleware (regex) |

---

## Case 1: Pure Code URLs — Prerendered Static Pages

The simplest case: the URL contains only the selfheal code as the slug.

**File:** `src/pages/notebook/[selfheal].astro`

```astro
---
import { getCollection } from 'astro:content'

export const prerender = true

export async function getStaticPaths() {
  const notes = await getCollection('notes')
  return notes
    .filter(note => note.data.selfHealing)
    .map(note => ({
      params: { selfheal: note.data.selfHealing },
      props: { noteId: note.id.replace(/\.(md|mdx)$/, '') },
    }))
}

const { noteId } = Astro.props
return Astro.redirect(`/notebook/${noteId}`, 301)
---
```

This generates a static HTML file for each code at build time, e.g. `dist/client/notebook/bttrth/index.html`. Vercel serves it instantly from the CDN — no function invocation needed.

**Gotcha:** `note.id` in Astro 5's Content Layer includes the file extension (`.md` or `.mdx`). Strip it before using as a URL segment.

**Gotcha:** `getCollection()` is build-time only in Astro 5. Do NOT use it inside a serverless function or middleware — it throws because the SQLite content DB does not exist at runtime.

---

## Case 2: Embedded Code URLs — Middleware

For URLs like `/notebook/better-auth-drizzle-neon-astro-bttrth` there is no static file. These go through Astro middleware.

### Building the Code Map

The middleware needs a lookup table: code → destination URL. The naive approach is `import.meta.glob` over the markdown files:

```typescript
// ❌ This approach fails in Vercel's SSR bundle
const mods = import.meta.glob('./content/notes/en/**/*.md', { eager: true })
```

**Why it fails on Vercel:** Vite's `import.meta.glob` works at build time. In Vercel's serverless bundle, the glob result is empty because the markdown files are not included in the function's output.

The `?raw` variant has the same problem:

```typescript
// ❌ Also fails in Vercel's SSR bundle
const mods = import.meta.glob('./content/notes/en/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})
```

### The Correct Approach: Prebuild JSON

Generate a static JSON file before `astro build` runs, then import it as a plain module — JSON imports are handled natively by Node.js/esbuild and are always bundled correctly.

**`scripts/generateSelfHealMap.ts`:**

```typescript
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory()) {
      files.push(...await getMarkdownFiles(join(dir, entry.name)))
    } else if (entry.name.match(/\.(md|mdx)$/)) {
      files.push(join(dir, entry.name))
    }
  }
  return files
}

function extractSelfHealing(raw: string): string | undefined {
  return raw.match(/^selfHealing:\s*["']?([^"'\s]+)["']?/m)?.[1]
}

const map: Record<string, string> = {}

const enDir = join(root, 'src/content/notes/en')
const esDir = join(root, 'src/content/notes/es')

for (const filePath of await getMarkdownFiles(enDir)) {
  const code = extractSelfHealing(await readFile(filePath, 'utf-8'))
  if (code) {
    const slug = filePath.replace(enDir + '/', '').replace(/\.(md|mdx)$/, '')
    map[code] = `/notebook/${slug}`
  }
}

for (const filePath of await getMarkdownFiles(esDir)) {
  const code = extractSelfHealing(await readFile(filePath, 'utf-8'))
  if (code) {
    const slug = filePath.replace(esDir + '/', '').replace(/\.(md|mdx)$/, '')
    map[`es:${code}`] = `/es/cuaderno/${slug}`
  }
}

await mkdir(join(root, 'src/generated'), { recursive: true })
await writeFile(join(root, 'src/generated/selfheal-map.json'), JSON.stringify(map, null, 2))
console.log(`[selfheal-map] wrote ${Object.keys(map).length} entries`)
```

Run this before `astro build` in `package.json`:

```json
{
  "scripts": {
    "build": "bun scripts/generateSelfHealMap.ts && astro build && ..."
  }
}
```

Commit `src/generated/selfheal-map.json` to the repository — it ensures Vercel always has the file even if the prebuild step were to fail.

### The Middleware

```typescript
// src/middleware.ts
import { defineMiddleware, sequence } from 'astro:middleware'
import selfhealMapData from './generated/selfheal-map.json'

const selfHealMap = new Map<string, string>(Object.entries(selfhealMapData))

// Matches 6 lowercase consonants preceded by start-or-dash, followed by dash-or-end
const selfHealRegex = /(?:^|-)[b-df-hj-np-tv-z]{6}(?:-|$)/g

const selfhealMiddleware = defineMiddleware((context, next) => {
  const { pathname } = context.url
  const isEs = pathname.startsWith('/es/cuaderno/')
  const isEn = pathname.startsWith('/notebook/')
  if (!isEn && !isEs) return next()

  const segment = isEs
    ? pathname.replace('/es/cuaderno/', '')
    : pathname.replace('/notebook/', '')

  const match = segment.match(selfHealRegex)
  if (!match) return next()

  const code = match[0].replace(/-/g, '')
  const key = isEs ? `es:${code}` : code
  const destination = selfHealMap.get(key)
  if (destination) return context.redirect(destination, 301)

  return next()
})

export const onRequest = sequence(selfhealMiddleware, /* ...other middleware */)
```

---

## Vercel Routing Gotcha — The `status: 404` Override

This is the largest gotcha. Even with the middleware correctly identified and returning a `301`, the redirect will not reach the browser for unknown paths.

**Why:** Astro's Vercel adapter generates a catch-all route at the end of `.vercel/output/config.json`:

```json
{ "src": "^/.*$", "dest": "_render", "status": 404 }
```

Per Vercel's Build Output API v3: when `status` is present on a route, it overrides the response status from the function. A `301` returned by the middleware becomes a `404` in the browser.

This affects any URL that:
- Does not have a static file on the CDN
- Does not match an explicit `_render` route generated by the adapter

Embedded selfheal URLs (`/notebook/slug-bttrth`) have no static file, so they hit the catch-all.

### The Fix: Patch the Output Config

Add a post-build script that inserts explicit routes for the embedded-code URL pattern **before** the `status: 404` catch-all:

**`scripts/patchVercelRoutes.ts`:**

```typescript
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const configPath = join(root, '.vercel/output/config.json')

const config = JSON.parse(await readFile(configPath, 'utf-8'))

const selfhealRoutes = [
  { src: '^/notebook/[^/]+-[b-df-hj-np-tv-z]{6}/?$', dest: '_render' },
  { src: '^/es/cuaderno/[^/]+-[b-df-hj-np-tv-z]{6}/?$', dest: '_render' },
]

const catchAllIndex = config.routes.findIndex(
  (r: { src?: string; status?: number }) =>
    r.status === 404 && r.src?.includes('.*'),
)

if (catchAllIndex === -1) {
  config.routes.push(...selfhealRoutes)
} else {
  config.routes.splice(catchAllIndex, 0, ...selfhealRoutes)
}

await writeFile(configPath, JSON.stringify(config, null, 2))
```

Update `package.json`:

```json
{
  "scripts": {
    "build": "bun scripts/generateSelfHealMap.ts && astro build && bun scripts/patchVercelRoutes.ts && ..."
  }
}
```

Now requests to `/notebook/old-slug-bttrth`:
1. Fail the filesystem check (no static file)
2. Match the new explicit route (`/notebook/*-[consonants]{6}`)
3. Reach `_render` **without** `status: 404`
4. Middleware redirects to the correct URL with actual 301

**Why not `vercel.json` routes?** Astro's Vercel adapter does not read the `routes` key from `vercel.json` — it only reads `trailingSlash`. The `redirects` in Astro config become routes via `getRedirects()`, but they only support static destination mapping, not runtime lookup.

---

## Summary: What Not to Do

| Approach | Why It Fails |
|----------|--------------|
| `import.meta.glob` over `.md` files in middleware | Empty in Vercel's SSR bundle |
| `import.meta.glob` with `?raw` in middleware | Same bundle issue |
| `getCollection()` in middleware or serverless | Content DB is build-time only in Astro 5 |
| Routes in `vercel.json` | Not read by Astro's Vercel adapter |
| Relying on the catch-all to reach middleware | `status: 404` overrides the redirect response |

---

## Final Architecture Diagram

```
Build time:
  generateSelfHealMap.ts → src/generated/selfheal-map.json
  astro build            → static pages, serverless bundle (imports JSON)
  patchVercelRoutes.ts   → .vercel/output/config.json (adds explicit routes)

Runtime — pure code URL (/notebook/bttrth):
  Vercel CDN → handle:filesystem → static HTML (instant, no function)

Runtime — embedded code URL (/notebook/slug-bttrth):
  Vercel CDN → handle:filesystem (miss) → explicit route → _render (no 404 override)
  → Astro middleware → selfhealMiddleware → context.redirect(301)
```

---

## Handling the Scroll-Marker Animation Not Animating on Vercel

Unrelated but discovered at the same time: CSS scroll-driven animations (`animation-timeline: scroll()`) work in local dev but may not animate on Vercel production if the browser receives a cached page without the correct CSS.

The fix is to ensure that CSS containing `animation-timeline` is not cached stale. Astro's asset hashing already handles this for `/_astro/` files — but inline `<style>` blocks in Astro components are regenerated per build and hash-matched, so this should not normally be an issue. If it is, check whether a CDN cache (Cloudflare, etc.) is serving an old HTML response.
