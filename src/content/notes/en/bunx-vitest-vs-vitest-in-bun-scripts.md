---
draft: false
title: "bunx vitest vs vitest in Bun Scripts"
description: "If bun run test fails with 'vitest: command not found', the fix is one word: bunx. Here's why Bun doesn't always put node_modules/.bin on PATH, and when it matters."
publishDate: 2026-04-28
cover: ../../../assets/images/bunx-vitest-vs-vitest.avif
coverAlt: Terminal showing vitest command not found error under bun
selfHealing: bnxvts
category: devops
author: giorgio-saud
collections:
  - frontend
  - architecture
tags:
  - bun
  - vitest
  - testing
  - devops
  - "2026"
linkedinCopy: |
  Fellow devs — if your tests run fine with bun run test but fail with vitest: command not found inside a Bun script, this post is for you. The fix is one word: bunx. I explain exactly why Bun does not always put node_modules/.bin on PATH and when it matters. It is one of those things that costs you an hour the first time. Sign in and share what other Bun gotchas you have hit.
  Read more: https://www.giorgiosaud.io/notebook/bnxvts
  
  #Bun #Vitest #Testing #DevOps #OneWordFix #BunGotchaOfTheDay #TestingInTheDark
twitterCopy: |
  Fellow devs — bun run test works but vitest says command not found? One word fix: bunx. Here is why: https://www.giorgiosaud.io/notebook/bnxvts #Bun #Vitest #OneWordFix
---

Short one. If `bun run test` is failing with `vitest: command not found` even though vitest is clearly in your `devDependencies`, read on.

## What's Happening

Your `package.json` probably looks like this:

```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

When npm or pnpm runs a script, they prepend `node_modules/.bin` to `PATH` before executing. That's how `vitest run` resolves to the locally installed binary.

Bun does this too — *most of the time*. But the behavior isn't always consistent across Bun versions, shell environments, and CI setups. In some contexts (Docker images, certain CI runners, non-interactive shells), `node_modules/.bin` doesn't make it onto `PATH`, and Bun falls back to the system shell which has no idea what `vitest` is.

## The Fix

Replace the bare binary name with `bunx`:

```json
{
  "scripts": {
    "test": "bunx vitest run",
    "test:watch": "bunx vitest",
    "test:coverage": "bunx vitest run --coverage"
  }
}
```

`bunx` is Bun's package runner — equivalent to `npx` for npm or `pnpx` for pnpm. It resolves and executes the binary from `node_modules/.bin` explicitly, regardless of what's on `PATH`. No ambiguity, no environment dependency.

## Why Not Just Install Vitest Globally?

You could — `bun add -g vitest` — but then you've introduced a version dependency on whatever global is installed on each machine. Your CI passes with vitest 3.x, someone runs it locally with vitest 4.x, tests behave differently. `bunx` always uses the version from the project's `node_modules`, which is pinned in `bun.lockb`.

## Why Not Hardcode the Path?

```json
"test": "bun node_modules/.bin/vitest run"
```

This works but it's fragile. The path separator is platform-specific, and it'll break in any project where `node_modules` lives somewhere other than the project root (monorepos, workspaces). `bunx` handles all of that for you.

## The Pattern

For any CLI tool you run in `package.json` scripts under Bun, prefer `bunx <tool>` over bare `<tool>`. It's explicit, portable, and always resolves from the local install:

```json
{
  "scripts": {
    "test": "bunx vitest run",
    "lint": "bunx biome check .",
    "typecheck": "bunx tsc --noEmit"
  }
}
```

The only exception is scripts that are Bun builtins or shell commands — those don't go through `bunx`.
