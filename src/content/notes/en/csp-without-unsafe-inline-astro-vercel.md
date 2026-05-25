---
draft: false
selfHealing: "cspwth"
starred: false
title: "CSP Without unsafe-inline in Astro + Vercel"
description: "How to remove unsafe-inline from your Content Security Policy in an Astro site deployed to Vercel, using SHA-256 hashes generated automatically at build time — and every pitfall we hit along the way."
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

I was auditing the security headers on this site and realized my `script-src` had `'unsafe-inline'`. That one directive makes most of the XSS protection pointless — any inline script runs, including ones an attacker injected. The problem: Astro generates inline scripts everywhere and I didn't want to add middleware just to handle nonces.

Hashes turned out to be the right approach for a mostly-static site. But getting there was not a straight line. This post covers the full implementation *and* every mistake I made in production.

## What Astro inlines and why it's annoying

Astro generates several kinds of inline `<script>` tags in the final HTML:

- **Island hydration stubs** — tiny scripts that lazy-load `client:idle`, `client:visible` components
- **`define:vars` blocks** — inline scripts that pass server variables to the client
- **Speculation Rules** — `<script type="speculationrules">` for prerender hints
- **Your own inline scripts** — anything written directly in a `.astro` file

You can't hardcode hashes manually because `define:vars` content changes per page. The solution is to generate them from the build output automatically.

## The architecture

Two pieces: a config file that's the single source of truth for all CSP directives, and a build script that scans the HTML output, computes hashes, and writes the final policy to `vercel.json`.

### 1. Config file: `src/config/csp.ts`

Keep all human-editable directives here. Adding a domain anywhere in this file automatically reflects in the next push — no manual `vercel.json` edits.

```typescript
export const cspPolicy = {
  'default-src': ["'self'"],
  'script-src': {
    static: ["'self'"],
    externalDomains: [
      'https://www.googletagmanager.com',
      'https://cdn.jsdelivr.net',
      'https://challenges.cloudflare.com',
      'https://static.cloudflareinsights.com',
    ],
    // hashes injected at build time
  },
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': [
    "'self'", 'data:', 'blob:',
    'https://platform.linkedin.com',
    'https://developers.google.com',
    'https://avatars.githubusercontent.com',
  ],
  'connect-src': [
    "'self'",
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://www.googletagmanager.com',
  ],
  'worker-src': ["'self'", 'blob:'],
  'frame-src': ['https://challenges.cloudflare.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
} as const
```

### 2. Hash generator: `scripts/generateCspHashes.ts`

Run after `astro build`. Scans every HTML file, extracts inline scripts, computes SHA-256 hashes, and builds the full CSP string from the config.

```typescript
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { cspPolicy } from '../src/config/csp'

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
    if (/\ssrc=/.test(tag)) continue
    if (/type=["']application\/ld\+json["']/.test(tag)) continue
    // Use raw content — never trim before hashing (see pitfall #2)
    const raw = m[1]
    if (raw.trim()) scripts.push(raw)
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

const scriptSrc = [
  ...cspPolicy['script-src'].static,
  ...hashes,
  ...cspPolicy['script-src'].externalDomains,
].join(' ')

// Build all directives dynamically from config — adding a new directive
// to cspPolicy automatically appears in the CSP with no script changes
const directives = Object.entries(cspPolicy).map(([key, value]) => {
  if (key === 'script-src') return `script-src ${scriptSrc}`
  return `${key} ${(value as readonly string[]).join(' ')}`
})

const cspValue = directives.join('; ') + ';'

const vercel = JSON.parse(readFileSync(VERCEL_JSON, 'utf-8'))
const headers = vercel.headers[0].headers
const cspIndex = headers.findIndex(
  (h: { key: string }) =>
    h.key === 'Content-Security-Policy' ||
    h.key === 'Content-Security-Policy-Report-Only',
)
if (cspIndex === -1) {
  headers.splice(0, 0, { key: 'Content-Security-Policy-Report-Only', value: cspValue })
} else {
  headers[cspIndex].value = cspValue
}

writeFileSync(VERCEL_JSON, `${JSON.stringify(vercel, null, 2)}\n`)
console.log(`CSP updated — ${hashes.length} hashes across ${htmlFiles.length} HTML files`)
```

### 3. Wire it into the build

```json
{
  "scripts": {
    "build": "astro build && bun scripts/generateCspHashes.ts",
    "csp:hashes": "bun scripts/generateCspHashes.ts"
  }
}
```

### 4. Pre-push hook so hashes never go stale

`.husky/pre-push`:

```bash
bun run test
bun run build
git diff --exit-code vercel.json || (git add vercel.json && git commit -m "chore(security): update CSP hashes [pre-push]")
```

The build step regenerates hashes. If `vercel.json` changed (new pages, changed scripts), the hook auto-commits before pushing. You never push stale hashes to production.

### 5. Start in Report-Only mode

```json
{
  "key": "Content-Security-Policy-Report-Only",
  "value": "default-src 'self'; script-src 'self' 'sha256-...' ...;"
}
```

Browse every page type, check the browser console for violations. Once clean, change the key to `Content-Security-Policy` to enforce.

---

## Pitfalls

This is where the post gets honest. These are real mistakes I hit in production, each one after thinking the previous one was the final fix.

### Pitfall 1: Two CSP headers — all protection gone

My first attempt patched both `vercel.json` and `.vercel/output/config.json` (the file the Astro Vercel adapter generates at build time).

That was a mistake. When two responses both include `Content-Security-Policy-Report-Only`, browsers don't pick one — they **intersect** all policies. Only what satisfies every policy simultaneously is allowed. The intersection of my hash list and the adapter's default `'unsafe-inline' 'unsafe-eval'` produced a `script-src` that was effectively useless, plus a `connect-src 'none'` that blocked every network request on the page.

**Fix**: Only ever write to `vercel.json`. Never touch `.vercel/output/config.json` — the adapter owns that file and regenerates it on every build.

### Pitfall 2: Trimming script content before hashing

The original `extractInlineScripts` function did this:

```typescript
const content = m[1].trim()  // ❌ wrong
if (content) scripts.push(content)
```

The browser computes the hash over the **raw bytes** of the script content — exactly as it appears between the `<script>` tags, including any leading/trailing whitespace or newlines. Trimming before hashing produces a hash that never matches.

This broke `<script type="speculationrules">` which Astro emits with surrounding newlines. The fix:

```typescript
const raw = m[1]             // ✅ correct — hash the raw content
if (raw.trim()) scripts.push(raw)
```

Check emptiness with `.trim()`, but push the untrimmed `raw` value for hashing.

### Pitfall 3: `'strict-dynamic'` breaks external scripts on static sites

After seeing a browser DevTools recommendation to use `'strict-dynamic'`, I added it to `script-src`. This immediately caused 20+ violations as every `/_astro/*.js` script was blocked.

`'strict-dynamic'` makes host allowlists irrelevant for supporting browsers. `'self'` stops working. Scripts loaded via `<script src="...">` in the HTML are no longer trusted unless they have a nonce or hash. For a static site that can't generate per-request nonces, that means all your external scripts are blocked.

`'strict-dynamic'` is designed for nonce-based CSP where a server generates a fresh nonce per request and stamps it on every `<script>` tag. It doesn't compose with the hash + host allowlist approach used here.

**Fix**: Don't use `'strict-dynamic'` on a static site without a nonce infrastructure.

### Pitfall 4: `require-trusted-types-for 'script'` breaks GTM

Same DevTools recommendation — I added `require-trusted-types-for 'script'`. It immediately produced violations from Google Tag Manager, which uses `innerHTML` and other DOM sinks internally.

Trusted Types enforcement requires all DOM XSS sinks to receive `TrustedHTML`/`TrustedScript` objects rather than raw strings. GTM doesn't support Trusted Types and there's no configuration to make it do so. If enforced, your analytics breaks.

**Fix**: Skip `require-trusted-types-for` unless every third-party script you load supports Trusted Types (rare in 2026).

### Pitfall 5: Cloudflare Bot Fight Mode injects unhashable scripts

With Bot Fight Mode enabled, Cloudflare injects an inline challenge script into HTML responses at the edge. The script contains a per-request dynamic token:

```javascript
window.__CF$cv$params={r:'a00e1621a822892e',t:'MTc3...'};
```

Because the token changes on every request, the hash changes on every request. You can never pre-compute it. The violation appears in the console even when every other script is correctly hashed.

**Fix**: Disable Bot Fight Mode in the Cloudflare dashboard (Security → Bots → Bot Fight Mode → Off). The challenge script disappears from the HTML after ~5 minutes of propagation.

---

## Why this site is still in Report-Only mode

After all the fixes above, the CSP is implemented correctly — but I'm keeping it in `Content-Security-Policy-Report-Only` rather than switching to enforcement for one reason: **Cloudflare's edge still occasionally injects scripts I don't control**.

Even with Bot Fight Mode disabled, other Cloudflare features (Rocket Loader, certain WAF rules, challenge pages) can inject inline scripts into HTML at the edge layer after the response leaves Vercel. Those scripts change per-request and can't be pre-hashed. If I enforce the CSP while any of those are active, real users on challenge pages would have a broken experience.

The policy to enforce:

1. Confirm all Cloudflare inline-script injections are disabled
2. Check the browser console across all page types — zero violations
3. Change the header key from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`

That last step is one line change in `vercel.json`. The infrastructure is ready — it's just waiting on a clean console.

---

## What the console should look like

After all fixes, Report-Only violations should be zero — or limited only to browser extensions injecting their own scripts into your page (which you can't prevent and which won't affect real users without that extension installed).

## The result

Before:

```
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com
```

After:

```
script-src 'self'
  'sha256-ncBTDHd...' 'sha256-znA0iCf...' [~150 more hashes]
  https://www.googletagmanager.com https://cdn.jsdelivr.net
  https://challenges.cloudflare.com https://static.cloudflareinsights.com;
```

No `'unsafe-inline'`, no nonce infrastructure, no middleware. The hash list updates automatically on every push.

---

## Nonce strategies compared

When people say "use a nonce instead of hashes," there are actually three different things they might mean — each with a different security profile.

### Per-request nonce (the gold standard)

A server generates a cryptographically random value on every HTTP request and stamps it on every `<script>` tag. The CSP header includes `'nonce-{value}'`. The nonce is single-use — it's useless after the response is sent.

This is what `'strict-dynamic'` is designed for. It's the most secure approach but requires a server rendering every page on every request. Not compatible with static site generation.

### Deploy-rotating nonce (tempting shortcut)

One random nonce is generated at build time and baked into every HTML file across the entire site. It stays valid until the next deploy, then a new one is generated.

This sounds appealing for static sites — simpler than scanning every HTML file for hashes. But it has a fundamental weakness: **the nonce is visible in every page's HTML source**. Anyone can open view-source, read the nonce value, and include it on an injected script. Within a deploy window, the nonce provides no protection against XSS at all — it only prevents replaying nonces from *previous* deploys.

```html
<!-- attacker reads this from view-source -->
<script nonce="abc123">legitimate code</script>

<!-- attacker injects this anywhere on the page -->
<script nonce="abc123">steal(document.cookie)</script>
```

### Per-script hashes (what this site uses)

Each inline script's exact content is hashed at build time. Only scripts whose SHA-256 matches a hash in `script-src` are allowed to run. The hashes rotate every deploy automatically.

An attacker who reads your hashes from the CSP header gains nothing — knowing `sha256-ncBTDHd...` doesn't help inject a different script, because the hash of a different script is a different value.

### Comparison

| Strategy | Rotates | Visible to attacker | Protects against XSS | Works on static sites |
|---|---|---|---|---|
| Per-request nonce | Every request | Yes (in HTML) | ✅ Yes | ❌ No |
| Deploy nonce | Every deploy | Yes (in HTML) | ❌ No | ✅ Yes |
| Per-script hashes | Every deploy | Yes (in CSP header) | ✅ Yes | ✅ Yes |
| `'unsafe-inline'` | Never | — | ❌ No | ✅ Yes |

The deploy nonce is the worst of both worlds: it has the operational complexity of a nonce (you need to stamp every script tag at build time) without the security benefit. Per-script hashes are strictly better for static sites — same deploy cadence, same automation, actual XSS protection.

---

## When to give up on CSP

Not every site should implement a strict CSP. Here's an honest assessment of when to stop and why.

**Give up if you rely heavily on third-party scripts that inject inline code.** GTM, Intercom, Hotjar, Drift, Zendesk — these tools routinely write `<script>` tags and `innerHTML` at runtime. You can't hash runtime-injected scripts. You'd have to whitelist entire domains (`'unsafe-inline'`) which defeats the purpose, or replace those tools with self-hosted alternatives.

**Give up if your CDN or proxy injects scripts you can't disable.** Cloudflare Bot Fight Mode, Rocket Loader, certain WAF rules — all inject inline scripts into your HTML at the edge. If your contract or security requirements prevent disabling them, pre-computed hashes won't work.

**Give up if your site uses heavy server-side rendering with dynamic inline scripts.** If every page renders different inline script content per request (not just `define:vars` with stable values, but truly dynamic per-user data baked in), you'd need nonces — which requires an Astro middleware that generates a nonce on every request and stamps it into every `<script>` tag. That's a meaningful architecture change.

**Give up if your team doesn't own the full deployment pipeline.** CSP enforcement on a site you don't fully control (shared hosting, CMS with plugin ecosystem, marketing team adding GTM tags without review) will break things at unpredictable times.

**Don't give up just because it's complex.** If you control your stack, use no inline-injecting third parties, and have a clean build pipeline, the hash approach works and the maintenance overhead is essentially zero — it's fully automated after the initial setup.

The test: if you can get `Content-Security-Policy-Report-Only` to show zero violations across all your page types with a clean browser profile (no extensions), you can enforce it. If violations keep appearing from sources outside your control, keep it in report-only or remove it and focus on other security layers instead.
