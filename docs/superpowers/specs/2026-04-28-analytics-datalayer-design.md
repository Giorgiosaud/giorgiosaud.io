# Analytics & DataLayer Design

**Date**: 2026-04-28
**Status**: Approved

## Goal

Replace Google Tag Manager with a direct GA4 integration. Introduce a typed `trackEvent()` helper as the single event bus. Remove all direct `gtag()` calls from components. Cover all meaningful user interactions across the site.

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Analytics backend | GA4 direct (`gtag.js`) | GTM CSP injection risk removed |
| Event mechanism | `dataLayer.push()` via typed helper | Schema enforced at build time |
| Consent model | Always-on + `anonymize_ip: true` | Personal site, no PII collected |
| Language dimension | `lang` on every event | Segment EN vs ES behavior in GA4 |

---

## 1. Environment Variables

### Remove
- `TAG_MANAGER_ID` — GTM only, no other consumers

### Add
- `GA4_MEASUREMENT_ID` — GA4 Measurement ID (`G-XXXXXXXXXX`), client-side public

Update `astro.config.mjs` `env.schema` accordingly.

---

## 2. Files to Delete

- `src/global/components/DebuggerTagManager.astro` — GTM noscript fallback, GTM-only

---

## 3. GA4 Script (Head replacement)

Remove the deferred GTM loader from `src/global/components/Head/index.astro`.

Replace with a synchronous GA4 init block:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id={GA4_MEASUREMENT_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', GA4_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true,
  });
</script>
```

CSP impact: `script-src` needs `https://www.googletagmanager.com` (same host, narrower than before).

---

## 4. Typed Event Helper

**File**: `src/helpers/datalayer.ts`

### Event Schema (discriminated union)

```ts
type Lang = 'en' | 'es'

type AnalyticsEvent =
  | { event: 'note_view';          note_id: string; note_title: string; category: string; lang: Lang }
  | { event: 'scroll_depth';       note_id: string; depth: 25|50|75|100; lang: Lang }
  | { event: 'page_exit_scroll';   note_id: string; max_depth: number; lang: Lang }
  | { event: 'search_performed';   q: string; results_count: number; collection: string; lang: Lang }
  | { event: 'collection_filter';  collection: string; lang: Lang }
  | { event: 'search_result_click';note_id: string; note_title: string; position: number; lang: Lang }
  | { event: 'related_note_click'; note_id: string; source_note_id: string; lang: Lang }
  | { event: 'share_click';        note_id: string; method: 'copy' | 'native'; lang: Lang }
  | { event: 'ai_summarizer_open'; note_id: string; lang: Lang }
```

### trackEvent implementation

```ts
export function trackEvent(payload: AnalyticsEvent): void {
  window.dataLayer = window.dataLayer || []
  // Define queuing stub if gtag.js hasn't loaded yet
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments) }
  }
  const { event, ...params } = payload
  window.gtag('event', event, params)
}
```

Events fired before `gtag.js` loads are queued in `dataLayer` and flushed automatically when the script initialises.

---

## 5. Event Implementation Map

| Event | File | Trigger |
|---|---|---|
| `note_view` | `src/pages/notebook/[note].astro` | Page script on load |
| `note_view` | `src/pages/es/cuaderno/[note].astro` | Page script on load |
| `scroll_depth` | `src/components/ScrollTracker.svelte` | 25/50/75/100% thresholds |
| `page_exit_scroll` | `src/components/ScrollTracker.svelte` | `visibilitychange` / `pagehide` |
| `search_performed` | `src/global/scripts/notebook-search.ts` | After debounced fetch resolves |
| `collection_filter` | `src/global/scripts/notebook-search.ts` | Chip click handler |
| `search_result_click` | `src/global/scripts/notebook-search.ts` | Card `click` via event delegation |
| `related_note_click` | `src/components/RelatedNotes.astro` | Inline script on card click |
| `share_click` | `src/pages/notebook/[note].astro` | Share button handler |
| `share_click` | `src/pages/es/cuaderno/[note].astro` | Share button handler |
| `ai_summarizer_open` | `src/components/AISummarizer.astro` | Robot button click |

---

## 6. Files Changed Summary

| File | Action |
|---|---|
| `astro.config.mjs` | Remove `TAG_MANAGER_ID`, add `GA4_MEASUREMENT_ID` |
| `.env.example` | Replace `TAG_MANAGER_ID` with `GA4_MEASUREMENT_ID` |
| `src/global/components/Head/index.astro` | Replace GTM loader with GA4 script |
| `src/global/components/DebuggerTagManager.astro` | **Delete** |
| `src/global/templates/Base.astro` | Remove `DebuggerTagManager` import + usage |
| `src/global/templates/Note.astro` | Remove `DebuggerTagManager` import + usage |
| `src/global.d.ts` | Add `gtag` and `dataLayer` window types |
| `src/helpers/datalayer.ts` | **Create** — typed helper |
| `src/pages/notebook/[note].astro` | Replace `gtag()` with `trackEvent()` + add `share_click` |
| `src/pages/es/cuaderno/[note].astro` | Same |
| `src/components/ScrollTracker.svelte` | Replace `gtag()` with `trackEvent()` |
| `src/global/scripts/notebook-search.ts` | Add `search_performed`, `collection_filter`, `search_result_click` |
| `src/components/RelatedNotes.astro` | Add `related_note_click` |
| `src/components/AISummarizer.astro` | Add `ai_summarizer_open` |

---

## 7. Out of Scope

- Server-side event tracking
- Consent-gated firing (always-on with anonymization is sufficient)
- Any analytics backend other than GA4
- GA4 dashboard / report configuration
