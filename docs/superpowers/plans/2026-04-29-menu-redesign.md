# Menu Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hamburger overlay menu with a floating pill bar on desktop and a native-feeling bottom tab bar on mobile.

**Architecture:** Desktop keeps the sticky header with a pill-shaped nav bar (logo | pill | avatar). Mobile hides the pill and renders a fixed bottom tab bar anchored with `view-transition-name` so it stays put across page navigations. Language toggle moves inside both nav surfaces, removing `TranslateButton`.

**Tech Stack:** Astro 5, CSS `light-dark()`, CSS custom properties, Astro view transitions, `env(safe-area-inset-bottom)`

---

## File Map

| File | Action |
|------|--------|
| `src/global/components/Navbar/PillNavigation.astro` | **Create** — desktop pill nav |
| `src/global/components/Navbar/BottomTabBar.astro` | **Create** — mobile fixed tab bar |
| `src/global/components/Navbar/index.astro` | **Modify** — remove hamburger, wire new components |
| `src/global/components/Navbar/Navigation.astro` | **Delete** |
| `src/global/components/Navbar/TranslateButton.astro` | **Delete** |
| `src/global/components/Navbar/HamburgerIcon.astro` | **Delete** |
| `src/global/components/Header.astro` | **Modify** — remove full-screen open state |
| `src/global/components/CookieConsent.svelte` | **Modify** — raise banner above tab bar on mobile |
| `src/global/styles/global.css` | **Modify** — add mobile body padding |

---

## Task 1: Create `PillNavigation.astro`

**Files:**
- Create: `src/global/components/Navbar/PillNavigation.astro`

- [ ] **Step 1: Create the component**

```astro
---
import { getLangFromUrl, useTranslatedPath, useTranslations, type RouteNames } from '@i18n/utils'

interface Props {
  pathToTranslate: RouteNames
  pathToTranslateNote?: string
}

const { pathToTranslate, pathToTranslateNote } = Astro.props
const lang = getLangFromUrl(Astro.url)
const t = useTranslations(lang)
const { translatePath } = useTranslatedPath(lang)

const langToTranslate = lang === 'es' ? 'en' : 'es'
const langLabel = lang === 'es' ? 'EN' : 'ES'

const menuItems = [
  { title: t('nav.title'),    path: translatePath('notebook', lang) },
  { title: t('nav.about-me'), path: translatePath('about-me', lang) },
  { title: t('nav.contact'),  path: translatePath('contact', lang) },
]
---

<nav class="pill-nav" aria-label="Main">
  <div class="pill">
    {menuItems.map(({ title, path }) => (
      <a
        href={path}
        class:list={[{ active: path === Astro.url.pathname && path !== '/' }]}
        aria-current={path === Astro.url.pathname && path !== '/' ? 'page' : undefined}
      >
        {title}
      </a>
    ))}
    <div class="lang-sep" aria-hidden="true"></div>
    <a
      href={translatePath(pathToTranslate, langToTranslate, pathToTranslateNote)}
      class="lang-link"
    >
      {langLabel}
    </a>
  </div>
</nav>

<style>
  .pill-nav {
    display: none;

    @media (width >= 48rem) {
      display: flex;
      justify-content: center;
    }
  }

  .pill {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    background: light-dark(#f1f5f9, #1e293b);
    border: 1px solid light-dark(#e2e8f0, #334155);
    border-radius: 999px;
    padding: 0.3rem 0.4rem;
  }

  .pill a {
    color: light-dark(#64748b, #94a3b8);
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    text-decoration: none;
    white-space: nowrap;
    transition: color 0.15s, background 0.15s;

    &:hover {
      color: light-dark(#0f172a, #f8fafc);
    }

    &.active {
      background: var(--color-main);
      color: #fff;
      font-weight: 500;
    }
  }

  .lang-sep {
    width: 1px;
    height: 16px;
    background: light-dark(#e2e8f0, #334155);
    margin: 0 0.1rem;
    flex-shrink: 0;
  }

  .lang-link {
    font-size: 0.7rem !important;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
</style>
```

- [ ] **Step 2: Verify it compiles**

```bash
bun run build 2>&1 | tail -20
```

Expected: no TypeScript or Astro errors mentioning `PillNavigation`.

---

## Task 2: Create `BottomTabBar.astro`

**Files:**
- Create: `src/global/components/Navbar/BottomTabBar.astro`

- [ ] **Step 1: Create the component**

```astro
---
import { getLangFromUrl, useTranslatedPath, useTranslations, type RouteNames } from '@i18n/utils'

interface Props {
  pathToTranslate: RouteNames
  pathToTranslateNote?: string
}

const { pathToTranslate, pathToTranslateNote } = Astro.props
const lang = getLangFromUrl(Astro.url)
const t = useTranslations(lang)
const { translatePath } = useTranslatedPath(lang)

const langToTranslate = lang === 'es' ? 'en' : 'es'
const langLabel = lang === 'es' ? 'EN' : 'ES'

const tabs = [
  { title: t('nav.title'),    path: translatePath('notebook', lang), icon: '📓' },
  { title: t('nav.about-me'), path: translatePath('about-me', lang), icon: '👤' },
  { title: t('nav.contact'),  path: translatePath('contact', lang),  icon: '✉️' },
  {
    title: langLabel,
    path: translatePath(pathToTranslate, langToTranslate, pathToTranslateNote),
    icon: '🌐',
  },
]
---

<nav class="bottom-tab-bar" role="navigation" aria-label="Main">
  {tabs.map(({ title, path, icon }) => (
    <a
      href={path}
      class:list={['tab', { active: path === Astro.url.pathname && path !== '/' }]}
      aria-current={path === Astro.url.pathname && path !== '/' ? 'page' : undefined}
    >
      <span class="tab-icon" aria-hidden="true">{icon}</span>
      <span class="tab-label">{title}</span>
    </a>
  ))}
</nav>

<style>
  .bottom-tab-bar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: light-dark(var(--color-light), var(--color-dark));
    border-top: 1px solid light-dark(#e2e8f0, #1e293b);
    padding: 0.5rem 0;
    padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
    z-index: 200;
    view-transition-name: bottom-tab-bar;

    @media (width >= 48rem) {
      display: none;
    }
  }

  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 0.25rem 0.75rem;
    text-decoration: none;
    color: light-dark(#94a3b8, #475569);
    transition: color 0.15s;

    &:hover {
      color: var(--color-main);
    }

    &.active {
      color: var(--color-main);

      .tab-icon {
        filter: drop-shadow(0 0 4px color-mix(in srgb, var(--color-main) 60%, transparent));
      }
    }
  }

  .tab-icon {
    font-size: 1.1rem;
    line-height: 1;
  }

  .tab-label {
    font-size: 0.6rem;
    font-weight: 500;
    white-space: nowrap;
  }
</style>
```

- [ ] **Step 2: Verify it compiles**

```bash
bun run build 2>&1 | tail -20
```

Expected: no errors mentioning `BottomTabBar`.

---

## Task 3: Restructure `Navbar/index.astro`

**Files:**
- Modify: `src/global/components/Navbar/index.astro`

- [ ] **Step 1: Replace the file contents**

```astro
---
import { UserAvatar, LoginButton } from '@components/auth'
import { getLangFromUrl, type RouteNames } from '@i18n/utils'
import BottomTabBar from './BottomTabBar.astro'
import LogoNavigation from './LogoNavigation.astro'
import PillNavigation from './PillNavigation.astro'

interface Props {
  pathToTranslate: RouteNames
  pathToTranslateNote?: string
}

const { pathToTranslate, pathToTranslateNote } = Astro.props
const lang = getLangFromUrl(Astro.url)
---

<nav class="top-nav" aria-label="Site header">
  <LogoNavigation />
  <PillNavigation pathToTranslate={pathToTranslate} pathToTranslateNote={pathToTranslateNote} />
  <div class="actions">
    <LoginButton client:idle lang={lang} />
    <UserAvatar client:idle lang={lang} />
  </div>
</nav>

<BottomTabBar pathToTranslate={pathToTranslate} pathToTranslateNote={pathToTranslateNote} />

<style>
  .top-nav {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 1rem;
    color: light-dark(var(--color-dark), var(--color-light));
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-self: end;
  }
</style>
```

- [ ] **Step 2: Verify it compiles**

```bash
bun run build 2>&1 | tail -20
```

Expected: no errors mentioning `Navbar`.

---

## Task 4: Clean up `Header.astro`

**Files:**
- Modify: `src/global/components/Header.astro`

- [ ] **Step 1: Remove the full-screen open state**

Replace the entire file with:

```astro
---
import type { RouteNames } from '@i18n/utils'
import Navbar from './Navbar/index.astro'

interface Props {
  pathToTranslate: RouteNames
  notePath?: string
  pathToTranslateNote?: string
}

const { pathToTranslate, pathToTranslateNote } = Astro.props
---

<header>
  <div class="content-grid">
    <Navbar pathToTranslate={pathToTranslate} pathToTranslateNote={pathToTranslateNote} />
  </div>
</header>
<link
  rel="alternate"
  type="application/rss+xml"
  title="Your Site's Title"
  href={new URL("rss.xml", Astro.site)}
/>

<style>
  header {
    view-transition-name: header;
    background-color: light-dark(
      hsl(from var(--color-light) h s l / 0.7),
      hsl(from var(--color-dark) h s l / 0.7)
    );
    animation-timeline: scroll();
    animation-duration: 1ms;
    animation-range: 0px 30%;
    animation-fill-mode: forwards;
    animation-name: scroll-down;
    height: fit-content;
    padding-block: 1lh;
    position: sticky;
    top: 0px;
    isolation: isolate;
    z-index: 100;
  }

  @keyframes scroll-down {
    to {
      background-color: light-dark(
        hsl(from var(--color-light) h s l / 0.2),
        hsl(from var(--color-dark) h s l / 0.2)
      );
      backdrop-filter: blur(10px);
      padding: calc(var(--spacing) * 4) 0;
    }
  }
</style>
```

- [ ] **Step 2: Verify build**

```bash
bun run build 2>&1 | tail -20
```

Expected: clean build.

---

## Task 5: Add mobile body padding to `global.css`

**Files:**
- Modify: `src/global/styles/global.css`

- [ ] **Step 1: Add the mobile padding rule**

Find the `body` rule in `global.css` and add a media query below it (do not nest — add after the existing body block):

```css
@media (width < 48rem) {
  body {
    padding-bottom: 4.5rem;
  }
}
```

- [ ] **Step 2: Verify build**

```bash
bun run build 2>&1 | tail -20
```

Expected: clean build.

---

## Task 6: Fix cookie banner mobile offset in `CookieConsent.svelte`

**Files:**
- Modify: `src/global/components/CookieConsent.svelte`

- [ ] **Step 1: Add mobile media query inside the `<style>` block**

Add before the closing `</style>` tag:

```css
@media (width < 48rem) {
  .cookie-banner {
    bottom: calc(4.5rem + 1rem);
    right: 0.75rem;
    width: calc(100vw - 1.5rem);
  }

  .manage-btn {
    bottom: calc(4.5rem + 0.5rem);
  }
}
```

- [ ] **Step 2: Verify build**

```bash
bun run build 2>&1 | tail -20
```

Expected: clean build.

---

## Task 7: Delete obsolete files

**Files:**
- Delete: `src/global/components/Navbar/Navigation.astro`
- Delete: `src/global/components/Navbar/TranslateButton.astro`
- Delete: `src/global/components/Navbar/HamburgerIcon.astro`

- [ ] **Step 1: Delete the files**

```bash
rm src/global/components/Navbar/Navigation.astro
rm src/global/components/Navbar/TranslateButton.astro
rm src/global/components/Navbar/HamburgerIcon.astro
```

- [ ] **Step 2: Confirm no remaining imports**

```bash
grep -r "Navigation\|TranslateButton\|HamburgerIcon\|hamburger-menu" src/ --include="*.astro" --include="*.ts" --include="*.svelte"
```

Expected: no results (or only results inside the deleted files which are now gone).

- [ ] **Step 3: Verify build**

```bash
bun run build 2>&1 | tail -20
```

Expected: clean build.

---

## Task 8: Run tests and commit

- [ ] **Step 1: Run the test suite**

```bash
bun run test
```

Expected: all 126 tests pass.

- [ ] **Step 2: Commit everything**

```bash
git add \
  src/global/components/Navbar/PillNavigation.astro \
  src/global/components/Navbar/BottomTabBar.astro \
  src/global/components/Navbar/index.astro \
  src/global/components/Header.astro \
  src/global/components/CookieConsent.svelte \
  src/global/styles/global.css
git rm \
  src/global/components/Navbar/Navigation.astro \
  src/global/components/Navbar/TranslateButton.astro \
  src/global/components/Navbar/HamburgerIcon.astro
git commit -m "feat(nav): pill bar desktop, bottom tab bar mobile, remove hamburger overlay"
```

---

## Task 9: Manual visual verification

- [ ] **Step 1: Start dev server**

```bash
bun run dev
```

Open http://localhost:4321

- [ ] **Step 2: Desktop checks (≥ 768px viewport)**
  - Pill bar visible, centered between logo and avatar
  - Active page has `--color-main` filled background in pill
  - Language label (EN/ES) visible after divider in pill
  - Scrolling causes header to blur (existing animation)
  - No hamburger icon visible

- [ ] **Step 3: Mobile checks (< 768px viewport — resize browser or DevTools)**
  - Pill bar hidden
  - Bottom tab bar visible, fixed at bottom
  - Active tab color is `--color-main`
  - Page content not hidden behind tab bar (has bottom padding)
  - Cookie banner sits above tab bar when shown
  - "🍪 Cookies" manage button sits above tab bar

- [ ] **Step 4: View transition check**
  - Navigate between pages on mobile
  - Bottom tab bar stays visually anchored (no slide/fade out between routes)
