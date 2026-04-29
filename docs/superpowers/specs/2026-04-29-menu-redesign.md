# Menu Redesign — Design Spec

**Date:** 2026-04-29
**Branch:** `fix/menu-responsiveness`
**Status:** Approved

## Goal

Replace the current full-screen hamburger overlay menu with a floating pill bar on desktop and a bottom tab bar on mobile, improving usability, visual coherence, and dark/light mode appearance.

---

## Design Decisions

| Question | Decision |
|----------|----------|
| Desktop layout | Floating pill bar centered between logo and avatar |
| Active item style | Solid accent fill (`--color-main`) inside the pill |
| Mobile layout | Bottom tab bar (app-style), logo-only top bar |
| Language toggle | Inside pill on desktop (after divider); tab in bottom bar on mobile |
| Auth avatar | Single avatar icon replaces separate LoginButton on desktop; top-right on mobile |
| Cookie banner conflict | Banner `bottom` raised to clear the tab bar on mobile (`bottom: calc(4.5rem + 1rem)`) |

---

## Components

### 1. `Navbar/index.astro` (restructured)

- Desktop (`≥ 768px`): `grid-template-columns: auto 1fr auto` — logo | pill | avatar
- Mobile (`< 768px`): top bar shows logo + avatar only; pill hidden; bottom tab bar rendered

### 2. `Navbar/PillNavigation.astro` (new — replaces `Navigation.astro`)

Renders the pill bar for desktop:

```
[ Notebook | About Me | Contact | ─ | ES ]
```

- Outer container: `background: var(--color-surface-2)`, `border: 1px solid var(--color-border)`, `border-radius: 999px`, `padding: 0.3rem 0.4rem`
- Each link: `border-radius: 999px`, `padding: 0.25rem 0.75rem`, `font-size: 0.75rem`, `color: var(--color-muted)`
- Active link: `background: var(--color-main)`, `color: white`, `font-weight: 500`
- Language divider: `1px solid var(--color-border)`, `height: 16px`, `margin: 0 0.25rem`
- Hidden on `width < 768px`

### 3. `Navbar/BottomTabBar.astro` (new)

**View Transition:** Give the tab bar `view-transition-name: bottom-tab-bar` so Astro's view transitions keep it visually anchored during page navigation — it won't flicker or slide out between routes.

```css
.bottom-tab-bar {
  view-transition-name: bottom-tab-bar;
}
```

Add to `astro.config.mjs` (already using view transitions) — no extra config needed; the name alone is enough to opt the element into a matched cross-document transition.

### 3a. `Navbar/BottomTabBar.astro` (continued)

Renders the mobile bottom tab bar:

```
[ 📓 Notebook | 👤 About | ✉️ Contact | 🌐 ES ]
```

- `position: fixed`, `bottom: 0`, `left: 0`, `right: 0`
- `background: light-dark(var(--color-light), var(--color-dark))`, `border-top: 1px solid var(--color-border)`
- `padding: 0.5rem 0 env(safe-area-inset-bottom, 0.75rem)` — respects iPhone safe area
- Each tab: `flex-direction: column`, `align-items: center`, `gap: 3px`, `font-size: 0.6rem`
- Active tab: `color: var(--color-main)`, icon gets `filter: drop-shadow(0 0 4px …)`
- `z-index: 200` (above cookie banner)
- Hidden on `width ≥ 768px`

### 4. `Navbar/LogoNavigation.astro` (unchanged)

No changes needed.

### 5. `Navbar/TranslateButton.astro` (removed from actions area)

Language toggle moves into `PillNavigation` (desktop) and `BottomTabBar` (mobile). `TranslateButton` component is deleted.

### 6. `CookieConsent.svelte` — mobile offset fix

```css
@media (width < 768px) {
  .cookie-banner {
    bottom: calc(4.5rem + 1rem); /* clears bottom tab bar */
    right: 0.75rem;
    width: calc(100vw - 1.5rem);
  }
  .manage-btn {
    bottom: calc(4.5rem + 0.5rem);
  }
}
```

### 7. `Header.astro`

Remove the `&:has([data-opened="true"])` full-screen expansion — no longer needed without the overlay menu.

---

## Behavior

### Scroll behavior (desktop)
Existing `scroll-down` animation kept — header background blurs on scroll.

### Active state detection
Use `Astro.url.pathname` comparison (existing pattern in `Navigation.astro`).

### Mobile body padding
Add `padding-bottom: 4.5rem` to `<body>` on mobile so page content isn't hidden behind the tab bar.

---

## Accessibility

- Bottom tab bar uses `role="navigation"` and `aria-label="Main"`
- Active tab gets `aria-current="page"`
- Pill links get `aria-current="page"` on active item
- Tab icons are decorative (`aria-hidden="true"`); label text provides accessible name

---

## Files Changed

| File | Action |
|------|--------|
| `src/global/components/Navbar/index.astro` | Restructure layout |
| `src/global/components/Navbar/Navigation.astro` | Replace with PillNavigation |
| `src/global/components/Navbar/PillNavigation.astro` | New |
| `src/global/components/Navbar/BottomTabBar.astro` | New |
| `src/global/components/Navbar/TranslateButton.astro` | Remove (logic moved) |
| `src/global/components/Navbar/HamburgerIcon.astro` | Remove |
| `src/global/components/Header.astro` | Remove full-screen open state |
| `src/global/components/CookieConsent.svelte` | Mobile bottom offset |
| `src/global/styles/global.css` | Add mobile body padding |

---

## Out of Scope

- Search / command palette integration
- Notification badges on tabs
- Animated tab indicator (sliding pill within the bottom bar)
