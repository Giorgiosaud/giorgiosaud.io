---
draft: false
title: "Four Levels and No @property: How the BPL Design System Wires Its Tokens"
description: "A tour of the token architecture behind BPL DS — primitives, semantic base tokens, component slots and private --_* resolvers — and why we deliberately stopped registering our theme tokens with @property."
publishDate: 2026-11-13
cover: ../../../assets/images/css-custom-properties-2026.png
coverAlt: Layers of CSS custom properties flowing from a raw color palette into semantic tokens and then into components
selfHealing: tknsbp
lang: en
category: Architecture
author: giorgio-saud
collections:
  - architecture
  - frontend
tags:
  - design-systems
  - css
  - custom-properties
  - tokens
  - "2026"
linkedinCopy: |
  Fellow devs — our design system ships zero JavaScript and works the same in Astro, Next.js or a plain HTML file, because the whole theming API is CSS custom properties. Four levels: raw palette, semantic base tokens, one public slot per component property, and private --_* resolvers nobody outside the component touches. The surprise: we used to register our brand tokens with @property, and we stopped on purpose. A registered color resolves light-dark() where it is declared, so a dark section inside a light page never flips. Unregistered tokens resolve where they are used. I wrote up the chain, the five rules that keep it honest, and the trade-off. Sign in and tell me how you theme nested sections.
  Read more: https://www.giorgiosaud.io/notebook/tknsbp

  #CSS #DesignSystems #CustomProperties #WebDev #DesignTokens #FourLevelsNoProperty #CSSIsTheAPI

twitterCopy: |
  Fellow devs — 4 token levels, zero JS, and why we un-registered our theme tokens from @property: light-dark() should resolve where a token is used, not where it is declared. Sign in and comment: https://www.giorgiosaud.io/notebook/tknsbp #CSS #DesignSystems #FourLevelsNoProperty
---

Every design system eventually has to answer the same question: *how does a client change the brand color without forking the CSS?*

Most answer it with a build step — a theme file, a Sass map, a Tailwind config, a JavaScript provider. [BPL DS](https://ds.bepartnerlabs.com), the design system we use at Be Partner Labs, answers it with nothing but CSS custom properties. There's no runtime and no build step on the consumer side: you import a stylesheet and set a variable. That's also what makes it framework-agnostic. The same `@import '@be-partner-labs/ds/full'` works in an Astro layout, a Next.js app or a static HTML file, because custom properties don't care who renders the markup.

That only works if the variables are organized well enough that "set a variable" is always the right answer. This post is about that organization: four levels, five rules, and one decision that surprised me — we removed `@property` from our theme tokens on purpose.

## The four levels

```
Level 0  --figma-blue-500     Raw palette (primitives). Never used directly in components.
Level 1  --bp-primary         Semantic base tokens on :root. This is what a client remaps.
Level 2  --btn-background     A component's public slot, named after the CSS property it controls.
Level 3  --_background        Private resolver inside the component. Never set from outside.
```

**Level 0 — primitives.** This is the raw palette, typically whatever Figma or Style Dictionary exports: `--figma-blue-500`, `--figma-white`. Components never read these. They exist so the client's design file has a home.

**Level 1 — semantic base tokens.** These describe *roles*, not colors: `--bp-primary`, `--bp-color-bg`, `--bp-color-text-muted`, `--bp-radius`, `--bp-space-4`. They live on `:root` inside `@layer bp-tokens`. Rebranding means mapping primitives onto this level and nothing else:

```css
:root {
  --bp-primary: var(--figma-blue-500);
  --bp-radius: 0.375rem;
}
```

The client surface is deliberately tiny. `--bp-primary` and `--bp-radius` are the two you're expected to touch; the rest of the scale derives from them:

```css
:root {
  --bp-primary: #5fcb9f;
  --bp-primary-hover: color-mix(in srgb, var(--bp-primary) 82%, black);
  --bp-radius-sm: calc(var(--bp-radius) * 0.5);
  --bp-radius-lg: calc(var(--bp-radius) * 1.5);
}

@supports (color: oklch(from red l c h)) {
  :root {
    --bp-primary-hover: oklch(from var(--bp-primary) calc(l - 0.08) c h);
  }
}
```

`color-mix()` is the baseline; browsers with relative color syntax get a perceptually better hover in OKLCH. Change one hex value and the hover, subtle and foreground shades follow.

**Level 2 — component slots.** Each component exposes a small public API: `--btn-background`, `--btn-color`, `--btn-border-radius`, `--card-padding`. These are for *per-instance exceptions*, not for theming.

**Level 3 — private resolvers.** Inside the component, every slot is resolved exactly once, on the root selector, into a `--_*` variable that the rest of the component consumes:

```css
@layer bp-components {
  .bp-btn {
    --_background: var(--btn-background, var(--bp-primary));
    --_color: var(--btn-color, var(--bp-primary-fg));
    --_border-radius: var(--btn-border-radius, var(--bp-radius-md));

    background-color: var(--_background);
    color: var(--_color);
    border-radius: var(--_border-radius);
  }
}
```

Read the first line as a sentence: *the background is whatever the consumer put in `--btn-background`, or else the brand's primary color.* That one line is the whole contract between the component, the theme and the consumer. It's the [constructor pattern for custom properties](https://www.giorgiosaud.io/notebook/custom-properties-with-defaults-LVCSTP) applied to an entire system.

Everything sits in a fixed layer order — `@layer bp-tokens, bp-reset, bp-grid, bp-components, bp-utilities` — so consumer CSS outside the layers always wins without a specificity fight.

## The five rules that keep it honest

Four levels are easy to draw and easy to erode. These are the rules we wrote down after the erosion started:

**1. Slot names match the CSS property.** `--btn-background`, not `--btn-bg` or `--btn-theme`. One slot, one property. If you know CSS, you can guess the API.

**2. No state tokens.** We used to have `--btn-bg-hover`. It's gone. A hover re-declares the private resolver, and a consumer who wants a custom hover sets the *same* public slot in their own `:hover`:

```css
/* DS source */
.bp-btn:hover {
  --_background: var(--btn-background, var(--bp-primary-hover));
}

/* Consumer: a one-off CTA */
.hero__cta { --btn-background: var(--brand-cta); }
.hero__cta:hover { --btn-background: var(--brand-cta-hover); }
```

State tokens double the API surface for every state you support, and they're the first thing agents and humans get wrong.

**3. Private variables live only on the component root.** Child elements consume `--_*`; they never declare one. That keeps the resolution in one place you can read top to bottom.

**4. Component slots never go on `:root`.** `:root { --btn-background: red }` restyles every button on the site and is miserable to override locally. Global changes go through Level 1; Level 2 is scoped to a selector.

**5. Child slots only when someone needs them.** `--card-link-color` exists only if a consumer has a documented reason. An API you didn't expose is an API you never have to keep stable.

These aren't just guidelines in a README. A validator (`pnpm validate:ds` in the DS repo, plus a consumer-side script) flags the violations that matter most — editing `.bp-*` classes directly, component tokens on `:root`, inline `style=""` on DS elements — and the same contract is what we [generate the agent-facing docs from](https://www.giorgiosaud.io/notebook/definitions-over-examples-agentic-design-system-dfntns).

## The decision: no `@property` on theme tokens

Here's the part I didn't expect to write.

Before the DS was a package, our brand site had its own token file, and the brand colors were registered:

```css
@property --bpl-mint {
  syntax: "<color>";
  initial-value: #5FCB9F;
  inherits: true;
}
```

That looked like best practice. [`@property` gives you typed, animatable custom properties](https://www.giorgiosaud.io/notebook/css-custom-properties-2026-csscst): an invalid value falls back to the initial value instead of silently breaking, and you can transition the variable itself.

When we folded the site into the shared package, we dropped the registrations and wrote this comment in `tokens.css` instead:

> The tokens stay unregistered on purpose: an unregistered custom property inherits the `light-dark()` expression unresolved, so it resolves where it is used, with that element's color-scheme.

The reason is dark mode. Every color token holds both values:

```css
:root {
  color-scheme: light dark;
  --bp-color-bg: light-dark(#f8f6f2, #16140f);
  --bp-color-text: light-dark(#181715, #f2eee6);
}

[data-theme='dark'] { color-scheme: dark; }
```

Now picture a light page with one dark section — a footer, a hero, a pricing band — marked `data-theme="dark"`.

- **Registered as `<color>`**, `--bp-color-bg` is computed *on `:root`*. `light-dark()` resolves there, against the root's color scheme, to a single concrete color. Descendants inherit that resolved light value. The dark section flips its `color-scheme`, and the token doesn't care. To make it work you'd have to re-declare every color token inside `[data-theme]`.
- **Unregistered**, the token inherits as the literal expression `light-dark(#f8f6f2, #16140f)`. It's only resolved when something uses it — `background: var(--bp-color-bg)` on an element inside the dark section — and at that point it resolves against *that element's* color scheme.

So a themed subtree only has to flip one property, `color-scheme`. No token gets re-declared, and a client's override on `:root` still reaches every section, light or dark.

### What we gave up

It's a real trade-off, not a free win:

- **No type safety.** Set `--bp-primary: 12px` and you get a broken color, not a fallback to the initial value.
- **No animating the token itself.** You can't transition `--bp-primary` between two brand colors. You can still transition `background-color` on the component, which is what you usually want anyway.
- **No `inherits: false`.** Every theme token inherits. For theme tokens that's the point.

If you need an animatable value, register *that* value, close to the component that animates it. A gradient angle or a progress percentage is a great `@property` candidate. Your theme palette isn't.

## What I'd take from this

- **Separate roles from values.** Components should depend on `--bp-primary`, never on `#5fcb9f` and never on `--figma-blue-500`. Rebranding then becomes one block of mappings.
- **Resolve once, privately.** The `--_*` resolver on the component root is what lets you have public slots, state and defaults without a combinatorial explosion of variables.
- **Ask where a token should resolve.** For anything built on `light-dark()`, the honest answer is "where it's used", and that's an argument *against* registering it.

> **Try it**: BPL DS is MIT-licensed and on npm as `@be-partner-labs/ds`. Import it, set `--bp-primary` on `:root`, then drop a `data-theme="dark"` on any section and watch it flip without touching a single token.
