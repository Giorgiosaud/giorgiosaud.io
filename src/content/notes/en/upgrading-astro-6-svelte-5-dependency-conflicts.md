---
draft: false
title: "Upgrading to Astro 6, Svelte 5, and Better Auth 1.6: What Broke and How I Fixed It"
description: "A full account of the issues I hit upgrading a production Astro site: Svelte TypeScript preprocessing failures, transitive dependency conflicts in better-auth, and Vercel build cache pitfalls."
publishDate: 2026-05-04
cover: ../../../assets/images/mock-astro-content-vitest.png
coverAlt: Astro upgrade dependency conflicts
selfHealing: pgrdng
lang: en
category: Architecture
author: giorgio-saud
collections:
  - astro
  - architecture
tags:
  - astro
  - svelte
  - better-auth
  - dependencies
  - "2026"
linkedinCopy: |
  Fellow devs — upgrading a production Astro site to Astro 6, Svelte 5, and Better Auth 1.6 at the same time turned into a dependency conflict archaeology project. TypeScript preprocessing failures, transitive dependency hell, and a Vercel build cache that made everything worse. I documented everything that broke and exactly how I fixed it. Sign in and share your most chaotic upgrade story.
  Read more: https://www.giorgiosaud.io/notebook/pgrdng
  
  #Astro #Svelte #WebDev #Dependencies #DependencyHell #UpgradeOrDieTrying #SemVerIsALie
twitterCopy: |
  Fellow devs — upgrading Astro 6 + Svelte 5 + Better Auth 1.6 in production. Everything that broke and how I fixed it. Sign in and comment: https://www.giorgiosaud.io/notebook/pgrdng #Astro #UpgradeOrDieTrying
---

I spent a Sunday upgrading giorgiosaud.io from Astro 5 to Astro 6, `@astrojs/svelte` 7 to 8, and `better-auth` 1.4 to 1.6. The build broke in three distinct ways. Here's a post-mortem so you don't have to rediscover each one.

## Issue 1: Async IIFE inside `onMount` breaks Svelte TypeScript preprocessing

After upgrading `@astrojs/svelte` to 8.x, the build started failing with:

```
[vite-plugin-svelte:compile] Unexpected token
```

The error pointed to a type annotation like `: boolean` that hadn't been stripped from the compiled output — raw TypeScript reaching the Svelte compiler.

The cause was a semicolon-prefixed async IIFE inside `onMount`:

```svelte
<script lang="ts">
onMount(() => {
  ;(async () => {
    pushSupported = isPushSupported()
    // ...
  })()
})
</script>
```

When `vitePreprocess({ script: true })` runs esbuild to strip TypeScript from Svelte `<script lang="ts">` blocks, the `(async` token creates an ambiguity in TypeScript mode. It can look like the start of a generic call expression (`async<Type>(...)`), which confuses esbuild's parser boundary. The result is that type annotations later in the same script block don't get stripped.

**Fix:** replace the IIFE with a named async function.

```svelte
<script lang="ts">
onMount(() => {
  async function initPush() {
    pushSupported = isPushSupported()
    // ...
  }
  initPush()
})
</script>
```

## Issue 2: TypeScript `as` casts in Svelte templates

Another Svelte compile error surfaced from this pattern in a template:

```svelte
<span class:admin={(user as { role?: string }).role === 'admin'}>
  {(user as { role?: string }).role === 'admin' ? t.admin : t.user}
</span>
```

TypeScript `as` casts are not valid in Svelte template expressions — templates compile to JavaScript, not TypeScript. The preprocessor only handles the `<script>` block.

**Fix:** move the cast logic into the script block as a derived value.

```svelte
<script lang="ts">
  const isAdmin = $derived((user as { role?: string })?.role === 'admin')
</script>

<span class:admin={isAdmin}>
  {isAdmin ? t.admin : t.user}
</span>
```

## Issue 3: Transitive dependency version conflicts with better-auth 1.6

`better-auth@1.6.9` ships with nested copies of its own peer dependencies at the versions it was built against. If older versions of those packages are hoisted to the top of `node_modules`, the build breaks.

I hit three conflicts:

| Package | Hoisted version | Required version | Error |
|---|---|---|---|
| `@better-auth/core` | 1.4.10 | 1.6.9 | Missing `./utils/error-codes` specifier |
| `better-call` | 1.1.7 | 1.3.5 | Missing export `kAPIErrorHeaderSymbol` |
| `@peculiar/asn1-schema` | 2.6.0 | 2.7.0 | `Cannot get schema for 'AlgorithmIdentifier'` |

**Fix:** add `overrides` (and `resolutions` for bun compatibility) to `package.json`:

```json
{
  "overrides": {
    "@better-auth/core": "1.6.9",
    "better-call": "1.3.5",
    "@peculiar/asn1-schema": "2.7.0"
  },
  "resolutions": {
    "@better-auth/core": "1.6.9",
    "better-call": "1.3.5",
    "@peculiar/asn1-schema": "2.7.0"
  }
}
```

## Issue 4: `estree-walker` conflict breaks Astro config loading on Vercel

Even after fixing the above, Vercel builds failed with:

```
[astro] Unable to load your Astro config
No "exports" main defined in /vercel/path0/node_modules/estree-walker/package.json
```

`estree-walker@3.x` is ESM-only and has a proper `exports` field. `estree-walker@2.x` does not. Something in the dependency tree was pulling in `2.0.2` as the hoisted version on Vercel's environment.

Locally the build passed because `3.0.3` was already the hoisted version from a previous install. Vercel restored a build cache from before the upgrade, so it had `2.0.2` locked in.

**Fix:** add `estree-walker` to overrides, and crucially — **clear the Vercel build cache** before redeploying. Without clearing the cache, Vercel restores the old `node_modules` and the override never takes effect.

```json
{
  "overrides": {
    "estree-walker": "3.0.3"
  },
  "resolutions": {
    "estree-walker": "3.0.3"
  }
}
```

To clear cache in Vercel: open the failed deployment → **Redeploy** → check **"Clear cache and redeploy"**.

## The pattern

All four issues share the same root: **a package that bundles its own dependencies at a specific version gets shadowed by an older hoisted version**. The fix is always the same — force the correct version with `overrides`/`resolutions` — but diagnosing which package is conflicting requires reading the error carefully and cross-referencing nested `node_modules`.

If you hit `Missing specifier` or `does not provide an export named` errors after a major dependency upgrade, check for nested `node_modules` with `find node_modules -name "package.json" -path "*/<package>/package.json" | xargs grep '"version"'` and compare versions. The nested one is what the package needs; the hoisted one is what's breaking it.
