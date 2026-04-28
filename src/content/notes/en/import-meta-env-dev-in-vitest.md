---
draft: false
title: "Why vi.stubEnv Doesn't Work for import.meta.env.DEV"
description: "vi.stubEnv('DEV', 'false') sets a string. Vite's DEV is a boolean. The string 'false' is truthy. Your tests lie to you silently. Here's the fix."
publishDate: 2026-04-28
cover: ../../../assets/images/home-notebook.webp
coverAlt: Vitest failing test showing DEV env var issue
selfHealing: mprtmt
category: testing
author: giorgio-saud
collections:
  - frontend
tags:
  - vitest
  - vite
  - astro
  - testing
  - typescript
  - "2026"
---

This one cost me a debugging session. Short post, but worth writing down.

## The Problem

You have code that branches on `import.meta.env.DEV`:

```typescript
export function isDraftInDevMode(data: { draft?: boolean }): boolean {
  return import.meta.env.DEV && data.draft === true
}
```

You want to test both branches, so you reach for `vi.stubEnv`:

```typescript
it('returns false in production', () => {
  vi.stubEnv('DEV', 'false')  // ← looks right
  expect(isDraftInDevMode({ draft: true })).toBe(false)
})
```

The test passes in CI. It passes locally. But the assertion is a lie — the function is actually returning `true`.

## Why

`vi.stubEnv` works by setting values on `process.env` (and `import.meta.env` for Vite's env surface). The values are always **strings** — that's the contract of environment variables.

Vite's `DEV` flag is special. At build time, Vite replaces `import.meta.env.DEV` with the literal boolean `true` or `false`. But at **test time** in Vitest, that replacement doesn't happen — `import.meta.env` is a mutable object and `DEV` stays as whatever type it was initialized with.

So when you call `vi.stubEnv('DEV', 'false')`, you set `import.meta.env.DEV` to the string `'false'`. And the string `'false'` is truthy in JavaScript. Your production-mode branch never actually runs.

```typescript
vi.stubEnv('DEV', 'false')
console.log(typeof import.meta.env.DEV)  // "string"
console.log(!!import.meta.env.DEV)       // true — 'false' is truthy!
```

## The Fix

Skip `vi.stubEnv` for boolean env flags and assign directly:

```typescript
import.meta.env.DEV = false  // production mode
import.meta.env.DEV = true   // dev mode
```

In Vitest's test environment, `import.meta.env` is a plain mutable object. Direct assignment works exactly as expected:

```typescript
it('returns false in production', () => {
  import.meta.env.DEV = false
  expect(isDraftInDevMode({ draft: true })).toBe(false)  // actually false now
})

it('returns true in dev with draft=true', () => {
  import.meta.env.DEV = true
  expect(isDraftInDevMode({ draft: true })).toBe(true)
})
```

## Cleanup

If you're setting `import.meta.env.DEV` across multiple tests, reset it in `afterEach` so tests don't leak state:

```typescript
const originalDEV = import.meta.env.DEV

afterEach(() => {
  import.meta.env.DEV = originalDEV
})
```

Or if your whole describe block is testing production behavior, set it once in `beforeAll`:

```typescript
describe('production mode', () => {
  beforeAll(() => { import.meta.env.DEV = false })
  afterAll(() => { import.meta.env.DEV = true })

  it('filters drafts', () => { /* ... */ })
  it('filters future dates', () => { /* ... */ })
})
```

## When `vi.stubEnv` Is the Right Tool

`vi.stubEnv` is correct for string env vars — `RESEND_API_KEY`, `POSTGRES_URL`, anything that comes from `.env` files. Those are always strings and `vi.stubEnv` handles the restore-on-cleanup lifecycle cleanly.

It's only `DEV`, `PROD`, `SSR`, and `MODE` that have this problem — the Vite-specific boolean/string flags that get statically replaced at build time but remain mutable objects in tests.
