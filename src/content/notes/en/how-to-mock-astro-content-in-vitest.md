---
draft: false
title: "How to Mock astro:content in Vitest"
description: "Unit testing Astro content collection helpers isn't obvious. Here's the exact pattern to mock getCollection and control import.meta.env.DEV so your tests actually reflect production filtering behavior."
publishDate: 2026-04-28
cover: ../../../assets/images/home-notebook.webp
coverAlt: Vitest test output for an Astro content collection helper
selfHealing: hwtmck
category: testing
author: giorgio-saud
collections:
  - frontend
  - architecture
tags:
  - astro
  - vitest
  - testing
  - typescript
  - "2026"
---

If you've built helpers that call `getCollection` from `astro:content`, you've probably noticed that unit testing them is non-trivial. The module is virtual — it doesn't exist on disk — so Vitest can't resolve it like a normal import. And if your helper reads `import.meta.env.DEV` to decide whether to include drafts, you've got a second problem on top of that.

Here's exactly how I got it working.

## The Setup

Say you have a helper like this:

```typescript
// src/helpers/collections.ts
import { getCollection } from 'astro:content'

export async function getPublishedNotes(lang: 'en' | 'es') {
  const name = lang === 'es' ? 'notas' : 'notes'
  const entries = await getCollection(name, ({ data }) => {
    if (import.meta.env.DEV) return true
    return !data.draft && data.publishDate < new Date()
  })
  return entries.sort((a, b) =>
    b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
  )
}
```

Two dependencies to control: `getCollection` and `import.meta.env.DEV`.

## Mocking `astro:content`

Vitest supports virtual module mocking with `vi.mock`. The key is that `vi.mock` calls are **hoisted** to the top of the file before any imports — that's what makes it work even though the import of your helper appears after the mock call.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// This gets hoisted — runs before the import below
vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}))

import { getCollection } from 'astro:content'
import { getPublishedNotes } from '@helpers/collections'

const mockGetCollection = vi.mocked(getCollection)
```

That's it. `mockGetCollection` is now a typed Vitest mock you can control per test.

## Controlling the Filter

The tricky part: `getCollection` receives a filter function as its second argument. Your helper defines the filtering logic *inside* that callback — so if you just `mockResolvedValue([entry])`, the filter is never applied and every test that checks production filtering will pass when it shouldn't.

You need to actually call the filter:

```typescript
it('excludes drafts in production', async () => {
  import.meta.env.DEV = false
  const draft = { id: 'test', data: { draft: true, publishDate: new Date('2025-01-01') } }

  mockGetCollection.mockImplementation(async (_name, filter) => {
    const pass = (filter as (e: unknown) => boolean)(draft)
    return pass ? [draft] : []
  })

  const result = await getPublishedNotes('en')
  expect(result).toHaveLength(0)
})
```

## The `import.meta.env.DEV` Gotcha

You might reach for `vi.stubEnv('DEV', 'false')` to flip the environment flag. Don't. `vi.stubEnv` works with string values, but Vite's `DEV` is a **boolean** — so the string `'false'` is truthy and your production-mode tests will always behave as if `DEV` is on.

Direct assignment is the correct approach:

```typescript
import.meta.env.DEV = false  // production mode
import.meta.env.DEV = true   // dev mode
```

This works in Vitest because `import.meta.env` is a plain mutable object at test time — Vite replaces the booleans at build time, but in Vitest's test runner they're just writable properties.

## A Full Working Example

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}))

import { getCollection } from 'astro:content'
import { getPublishedNotes } from '@helpers/collections'

const mockGetCollection = vi.mocked(getCollection)

function makeEntry(overrides: { draft?: boolean; publishDate?: Date } = {}) {
  return {
    id: 'test-note',
    data: {
      draft: false,
      publishDate: new Date('2025-01-01'),
      ...overrides,
    },
  }
}

describe('getPublishedNotes', () => {
  beforeEach(() => {
    mockGetCollection.mockReset()
  })

  it('calls the notes collection for lang=en', async () => {
    mockGetCollection.mockResolvedValue([])
    await getPublishedNotes('en')
    expect(mockGetCollection).toHaveBeenCalledWith('notes', expect.any(Function))
  })

  it('excludes drafts in production', async () => {
    import.meta.env.DEV = false
    const draft = makeEntry({ draft: true })
    mockGetCollection.mockImplementation(async (_name, filter) => {
      return (filter as (e: unknown) => boolean)(draft) ? [draft] : []
    })
    const result = await getPublishedNotes('en')
    expect(result).toHaveLength(0)
  })

  it('includes drafts in dev mode', async () => {
    import.meta.env.DEV = true
    const draft = makeEntry({ draft: true })
    mockGetCollection.mockImplementation(async (_name, filter) => {
      return (filter as (e: unknown) => boolean)(draft) ? [draft] : []
    })
    const result = await getPublishedNotes('en')
    expect(result).toHaveLength(1)
  })

  it('sorts by publishDate descending', async () => {
    const older = makeEntry({ publishDate: new Date('2024-01-01') })
    const newer = makeEntry({ publishDate: new Date('2025-06-01') })
    mockGetCollection.mockResolvedValue([older, newer])
    const result = await getPublishedNotes('en')
    expect(result[0].data.publishDate.valueOf()).toBeGreaterThan(
      result[1].data.publishDate.valueOf()
    )
  })
})
```

## Why `vi.mock` Has to Come First

If you try to move the `vi.mock` call below the imports, the module is already loaded and the mock has no effect. Vitest uses Babel or esbuild to physically hoist `vi.mock` calls before processing imports — it's not just execution order, it's a transform. This is the same behavior as Jest's `jest.mock`.

The pattern works as long as `vitest.config.ts` uses `getViteConfig` from `astro/config`, which propagates the `@helpers/*` path alias resolution automatically. No extra alias config needed.
