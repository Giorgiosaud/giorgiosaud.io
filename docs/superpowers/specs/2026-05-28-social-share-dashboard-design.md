# Social Share Dashboard — Design Spec

**Date:** 2026-05-28
**Status:** Approved

---

## Overview

Add a "Share" tab to the user dashboard that shows copyable social media text for every published EN note. Notes already shared (have a `linkedin` or `twitter` URL in frontmatter) are visually marked as shared but remain visible for reposting. Cards are paginated.

---

## Schema Changes

Add two optional URL fields to `noteSchema` in `src/content/schemas/noteSchema.ts`:

```ts
linkedin: z.string().url().optional(),
twitter: z.string().url().optional(),
```

These fields are optional — omitting them means the note hasn't been shared yet. Adding a URL marks it as shared and the card gets a "shared" visual state.

---

## Architecture

### New files
- `src/pages/dashboard/share.astro` — SSR page, queries all published EN notes, passes data to Svelte island
- `src/pages/es/panel/share.astro` — Spanish mirror
- `src/components/dashboard/SocialShareCards.svelte` — Svelte island, renders paginated cards with copy UI

### Modified files
- `src/content/schemas/noteSchema.ts` — add `linkedin` + `twitter` fields
- `src/components/dashboard/DashboardLayout.astro` — add `share` to `Props` union and `navItems`
- `src/global/i18n/locales/en/dashboard.json` — add `share` translation keys
- `src/global/i18n/locales/es/dashboard.json` — add `share` translation keys (Spanish)

---

## Data Flow

1. `share.astro` runs server-side: calls `getCollection('notes')`, filters out drafts, sorts by `publishDate` desc, maps to a plain serializable array with: `{ title, description, tags, selfHealing, publishDate, linkedin?, twitter? }`
2. Passes the array as a prop to `<SocialShareCards client:load notes={notes} lang={lang} />`
3. Svelte island handles pagination (12 cards/page), copy state, and shared/unshared visual distinction — no further server calls needed

---

## `SocialShareCards.svelte` — Component Design

### Pagination
- 12 cards per page
- Previous / Next buttons
- Shows "Page X of Y"
- Filter toggle: "All" | "Unshared only" — defaults to "Unshared only"

### Card anatomy (per note)
- Header: note title + publish date + shared badges (LinkedIn ✓ / Twitter ✓ if URLs present)
- Shared state: card has muted/green border, collapsed by default — click to expand
- Unshared state: card expanded by default
- **LinkedIn copy block**: textarea (readonly) with generated text + "Copy" button
- **Twitter/X copy block**: textarea (readonly) with generated text + "Copy" button
- Copy button changes to "Copied!" for 2 seconds on click

### Generated text format

**LinkedIn** (longer):
```
{title}

{description or resume}

Read more: https://www.giorgiosaud.io/notebook/{selfHealing}

#{tag1} #{tag2} #{tag3} ...
```

**Twitter/X** (≤280 chars, truncated gracefully):
```
{title} — https://www.giorgiosaud.io/notebook/{selfHealing} #{tag1} #{tag2} #{tag3}
```
Tags are added until 280-char limit is reached; title is never truncated.

---

## Navigation

`DashboardLayout` Props union:
```ts
'profile' | 'passkeys' | 'comments' | 'status' | 'share'
```

New nav item added after `status`:
- EN: label `"Share"`, href `/dashboard/share`
- ES: label `"Compartir"`, href `/es/panel/share`

---

## i18n Keys

**EN additions to `dashboard.json`:**
```json
"nav": {
  "share": "Share"
},
"share": {
  "title": "Share Notes",
  "filter": { "all": "All", "unshared": "Unshared only" },
  "linkedin": "LinkedIn",
  "twitter": "Twitter / X",
  "copy": "Copy",
  "copied": "Copied!",
  "sharedOn": "Shared on",
  "noNotes": "No notes to share.",
  "page": "Page {current} of {total}"
}
```

**ES additions:** translated equivalents.

---

## Auth

The share page is inside `/dashboard` which is already protected by the existing auth middleware. No additional auth work needed.

---

## Out of Scope

- Automatic posting to LinkedIn/Twitter APIs
- Saving the shared URL back to frontmatter via an API endpoint
- ES notes — only EN notes are shown (EN is the primary language; ES notes share the same `selfHealing` code)
