# Share Button Redesign + Safari Reader Mode — Design Spec

**Date:** 2026-05-23

## Overview

Replace the full-width primary share button in notebook posts with a compact icon row, add a purple "Reader Mode" badge, and enable Safari's Reader Mode flag by switching the content wrapper from `<div>` to `<article>`.

## Changes

### 1. Share section — both `src/pages/notebook/[note].astro` and `src/pages/es/cuaderno/[note].astro`

**Remove:**
- `<p>Share this note:</p>` label
- Full-width `button-primary` button

**Add:**
- Flex row, right-aligned (`justify-content: flex-end`)
- Purple `Reader` / `Lector` badge (pill, `background: #7c3aed`, white text, book icon)
- Ghost icon button: copy link (chain SVG icon), triggers existing `copyLink` logic
- Ghost icon button: native share (upload SVG icon), triggers existing `shareViaShareApi` logic
- Both icon buttons: `2rem × 2rem`, `border-radius: 8px`, ghost style (no fill, subtle border)
- Toast notification (`#notification`) stays unchanged

**i18n:**
- EN badge label: `Reader`
- ES badge label: `Lector`

### 2. Safari Reader Mode — same two files

**Change:**
```html
<!-- before -->
<div id="content">
  <h1>...</h1>
  <Content />
</div>

<!-- after -->
<article id="content">
  <h1>...</h1>
  <Content />
</article>
```

This is the semantic signal Safari uses to detect readable content and show the purple flag in the address bar.

## Styles

```css
.share {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 2rem;
}

.reader-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  background: #7c3aed;
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  border-radius: 9999px;
  text-transform: uppercase;
  margin-right: auto; /* pushes icon buttons to the right */
}

#share-copy, #share-native {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  border: 1px solid light-dark(#e2e8f0, rgba(255,255,255,0.12));
  background: transparent;
  color: light-dark(#64748b, #94a3b8);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

#share-copy:hover, #share-native:hover {
  background: light-dark(#f1f5f9, rgba(255,255,255,0.08));
  color: light-dark(#1e293b, #e2e8f0);
}
```

## Files to change

| File | Change |
|------|--------|
| `src/pages/notebook/[note].astro` | Share section markup + styles + `div→article` |
| `src/pages/es/cuaderno/[note].astro` | Same, ES label |

## Out of scope

- No new component created — changes are inline in the two page files
- No changes to `trackEvent` calls or share logic
- No changes to NoteTemplate
