# Social Share Dashboard — Design Spec

**Date:** 2026-05-28
**Status:** Approved

---

## Overview

Add a "Share" tab to the user dashboard that shows copyable social media text for every published EN note. Notes already shared (have a `linkedin` or `twitter` URL in frontmatter) are visually marked as shared but remain visible for reposting. Cards are paginated.

---

## Schema Changes

Add four optional fields to `noteSchema` in `src/content/schemas/noteSchema.ts`:

```ts
linkedinCopy: z.string().optional(),   // hand-written LinkedIn post text
twitterCopy: z.string().optional(),    // hand-written tweet text
linkedin: z.string().url().optional(), // URL of the published LinkedIn post
twitter: z.string().url().optional(),  // URL of the published tweet
```

`linkedinCopy` / `twitterCopy` — authored by you in frontmatter, shown verbatim in the copy block. A note missing both is flagged as "needs copy written".

`linkedin` / `twitter` — URL added after sharing. Presence marks the note as shared and changes the card's visual state.

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

1. `share.astro` runs server-side: calls `getCollection('notes')`, filters out drafts, sorts by `publishDate` desc, maps to a plain serializable array with: `{ title, selfHealing, publishDate, linkedinCopy?, twitterCopy?, linkedin?, twitter? }`
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
- Header: note title + publish date + status badges (LinkedIn ✓ / Twitter ✓ if post URLs present)
- Shared state: card has muted/green border, collapsed by default — click to expand for repost
- Unshared state: card expanded by default
- **LinkedIn copy block**: readonly textarea showing `linkedinCopy` value + "Copy" button. If `linkedinCopy` is missing, shows a "Write LinkedIn copy in frontmatter" placeholder message instead.
- **Twitter/X copy block**: readonly textarea showing `twitterCopy` value + "Copy" button. Same placeholder if missing.
- Copy button changes to "Copied!" for 2 seconds on click
- Cards missing both `linkedinCopy` and `twitterCopy` get a "needs copy" warning badge

### Filter states
- **"Unshared only"** (default): notes where `linkedin` or `twitter` URL is absent
- **"Needs copy"**: notes where `linkedinCopy` or `twitterCopy` is absent
- **"All"**: every published note

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
