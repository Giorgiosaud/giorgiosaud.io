---
draft: false
selfHealing: "cspwth"
starred: false
title: "CSP Without unsafe-inline in Astro + Vercel"
description: "How to remove unsafe-inline from your Content Security Policy in an Astro site deployed to Vercel, using SHA-256 hashes generated automatically at build time — and the pitfalls we hit along the way."
publishDate: 2026-05-24T00:00:00.000Z
category: security
author: giorgio-saud
collections:
  - security
  - frontend
tags:
  - security
  - csp
  - astro
  - vercel
cover: ../../../assets/images/csp-unsafe-inline-astro-vercel.png
coverAlt: "CSP without unsafe-inline in Astro and Vercel"
lang: en
---

I was auditing the security headers on giorgiosaud.io and realized my CSP had `'unsafe-inline'` in `script-src`. That's the one directive that makes most of the XSS protection pointless — any inline script runs, including ones an attacker injected. The problem: Astro generates inline scripts everywhere and I didn't want to add middleware just to handle nonces.

Hashes turned out to be the right fix for a mostly-static site. But getting there was not a straight line.

## What Astro inlines and why it's annoying

Astro generates several kinds of inline `<script>` tags in the final HTML:

- **Island hydration stubs** — tiny scripts that lazy-load `client:idle`, `client:visible` components
- **`define:vars` blocks** — inline scripts that pass server variables to the client (post slugs, titles, feature flags)
- **Speculation Rules** — `<script type="speculationrules">` for prerender hints
- **Your own inline scripts** — anything you write directly in a `.astro` file

You can't hardcode hashes for `define:vars` manually because the content changes per page — each post has a different slug and title baked in. You'd have to maintain hundreds of hashes by hand.

The solution is to generate them from the build output automatically.

## The approach

After `astro build` runs, every page is already rendered to `dist/client`. The inline scripts are right there in the HTML. Scan every file, extract each inline script, compute its SHA-256, and write the hashes into `vercel.json`. Then strip `'unsafe-inline'`.

### The script

Create `scripts/generateCspHashes.ts`:

```typescript
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const VERCEL_JSON = join(process.cwd(), 'vercel.json')
const DIST_DIR = join(process.cwd(), 'dist/client')

function collectHtmlFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...collectHtmlFiles(full))
    } else if (entry.endsWith('.html')) {
      files.push(full)
    }
  }
  return files
}

function extractInlineScripts(html: string): string[] {
  const scripts: string[] = []
  const re = /<script(?:\s[^>]*)?>([^<]+)<\/script>/gs
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const tag = m[0]
    if (/\ssrc=/.test(tag)) continue                           // skip external
    if (/type=["']application\/ld\+json["']/.test(tag)) continue // skip JSON-LD
    const content = m[1].trim()
    if (content) scripts.push(content)
  }
  return scripts
}

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('base64')
}

const htmlFiles = collectHtmlFiles(DIST_DIR)
const hashSet = new Set<string>()

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf-8')
  for (const script of extractInlineScripts(html)) {
    hashSet.add(`'sha256-${sha256(script)}'`)
  }
}

const hashes = [...hashSet].sort()
console.log(`${hashes.length} unique hashes across ${htmlFiles.length} HTML files`)

const vercel = JSON.parse(readFileSync(VERCEL_JSON, 'utf-8'))
const cspHeader = vercel.headers[0].headers.find(
  (h: { key: string }) =>
    h.key === 'Content-Security-Policy' ||
    h.key === 'Content-Security-Policy-Report-Only',
)

cspHeader.value = cspHeader.value.replace(
  /script-src\s+[^;]+;/,
  `script-src 'self' ${hashes.join(' ')} https://www.googletagmanager.com https://cdn.jsdelivr.net;`,
)

writeFileSync(VERCEL_JSON, JSON.stringify(vercel, null, 2) + '\n')
console.log('vercel.json updated — unsafe-inline removed')
```

### Wire it into the build

```json
{
  "scripts": {
    "build": "astro build && bun scripts/generateCspHashes.ts",
    "csp:hashes": "bun scripts/generateCspHashes.ts"
  }
}
```

### Pre-push hook so it never goes stale

Add this to `.husky/pre-push` so the hashes are always regenerated before the code reaches Vercel:

```bash
bun run test
bun run build
bun run csp:hashes
git diff --exit-code vercel.json || (git add vercel.json && git commit -m "chore(security): update CSP hashes [pre-push]")
```

If `vercel.json` changed after the build (new pages, changed scripts), the hook automatically commits the updated hashes before pushing. You never push stale hashes.

## Start in Report-Only mode

Don't enforce the CSP immediately. Use `Content-Security-Policy-Report-Only` first and watch the browser console for violations:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy-Report-Only",
          "value": "default-src 'self'; script-src 'self' 'sha256-...' ...;"
        }
      ]
    }
  ]
}
```

Browse your site, hit every page type, check for violations. Once the console is clean, flip the key to `Content-Security-Policy` and enforce.

## What went wrong along the way

This is where the post gets honest. I hit three separate problems after the initial implementation looked like it was working.

### Problem 1: Two CSP headers, all protection gone

My first attempt patched two files: `vercel.json` for the header configuration, and `.vercel/output/config.json` (the file the Astro adapter generates at build time) to also inject the hashes there.

That was a mistake.

When both files define a `Content-Security-Policy-Report-Only` header, Vercel serves **both**. Browsers don't pick one — they **intersect** multiple CSP headers: only directives that satisfy *all* policies are allowed. The result was a `script-src` that reduced to `'unsafe-inline' 'unsafe-eval'` (the intersection of my hash list and the adapter's default), and a `connect-src 'none'` that blocked every fetch on the page.

```
Refused to execute a script: 'unsafe-inline' appears in both policies
connect-src 'none' — no outbound connections allowed
```

The fix: **only patch `vercel.json`**. Never touch `.vercel/output/config.json` — that file is owned by the adapter and gets regenerated on every build. If you write to it, you race the adapter and lose.

### Problem 2: Cloudflare proxy injecting its own CSP

Before disabling the Cloudflare proxy (orange cloud → grey cloud, routing traffic directly to Vercel), Cloudflare's bot challenge page was injecting its own strict CSP on certain requests. This showed up as violations for scripts that weren't mine at all.

If you're using Cloudflare in front of Vercel and seeing CSP errors you can't explain, check whether the proxy is wrapping responses with its own headers. The challenge page (`/cdn-cgi/challenge-platform/`) operates under a stricter policy that conflicts with any custom CSP.

Solution: route traffic directly to Vercel, or configure Cloudflare's security level to avoid challenge pages on your main content.

### Problem 3: ISR pages produce hashes that weren't pre-computed

This one is expected behavior, but worth understanding. The pre-push hook computes hashes from the build output at push time. Pages that are statically generated (SSG) are fully baked — their hashes are stable.

ISR pages are different. Vercel regenerates them on a schedule or on-demand after deployment. If the regenerated HTML contains `define:vars` blocks with different content (a new post slug, updated metadata), the hashes won't be in `vercel.json`.

In Report-Only mode you'll see violations for those pages:

```
Refused to execute a script because its hash ... does not appear in the script-src directive
```

This is not a bug — it's the fundamental limitation of pre-computed hashes on dynamically regenerated content. Options:

1. **Accept it in report-only** — violations are logged but nothing is blocked. Fine while you're auditing.
2. **Flip ISR pages to SSG** — regenerate the full static build on every deploy. Slower deploys, but clean CSP.
3. **Use nonces for ISR routes** — add Astro middleware that generates a per-request nonce for those specific routes.

For a mostly-blog site, option 1 is fine. The inline scripts on ISR pages are Astro-generated and not user-controlled, so the real XSS risk is low.

## A few things to know

**The hash list gets long.** Each unique `define:vars` combination produces a distinct hash. A site with 100 posts ends up with 150+ hashes in `script-src`. That's fine — the header is cached and browsers handle it without a sweat.

**Speculation rules need a hash too.** The `<script type="speculationrules">` tag is treated as executable by the CSP spec. The script above handles it automatically since it doesn't filter by `type`.

**Service workers cache response headers.** If a previous deployment served a broken CSP (like the double-header situation above), your service worker may have cached those responses. Bumping the service worker cache name forces a cache bust on the next load.

**This only covers SSG and ISR pages.** If you have truly server-rendered pages that produce different inline script content on each request, their hashes can't be pre-computed — you'd need nonces from Astro middleware for those. For statically rendered pages (which is most of Astro), hashes work perfectly.

## The result

Before:

```
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com
```

After:

```
script-src 'self' 'sha256-+78eXcH...' 'sha256-Ab3kpQ...' ... https://www.googletagmanager.com
```

No `'unsafe-inline'`, no nonce infrastructure, no middleware. Just a script that keeps the allowlist honest on every push — and three hard lessons about what breaks when you think it's working.

## What's still pending

As of this writing, the CSP on this site is still in **Report-Only** mode. The hash list is generated correctly and the script runs on every push, but I haven't flipped the header to enforcement yet.

The remaining step is straightforward: once the browser console shows zero violations across all page types (including ISR-regenerated ones), change the key in `vercel.json` from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`. That's it — one key change and the policy moves from "observer" to "enforcer."

I'll update this post once I make the flip and confirm nothing breaks.
