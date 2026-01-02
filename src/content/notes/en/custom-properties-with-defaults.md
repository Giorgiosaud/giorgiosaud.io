---
draft: false
selfHealing: 'LVCSTP'
starred: false
title: Modern Custom Properties with Defaults
description: Learn how to handle default values in CSS variables using the classic "pseudo-private" technique and the modern @property rule.
publishDate: 2026-01-01T12:00:00.000Z
category: development
author: 000001-jorge-saud
collections:
  - frontend
tags:
  - css
  - tips
  - design-patterns
cover: ../../../assets/images/custom-properties-with-defaults.png
coverAlt: CSS Private and public props
---

Back in 2021, Lea Verou shared a brilliant pattern for handling default values in CSS variables. Now, in 2026, while that pattern remains useful, we also have the powerful `@property` rule as a standard feature. Let's look at both the "Classic" and "Modern" ways to handle component defaults.

### The "Classic" Way: The `--_property` Pattern

This technique solves the specificity wars by using a "private" internal variable.

### The Problem

If we define a component's style using a variable with a fallback in multiple places:

```css
.button {
  background: var(--bg, black);
  border-color: var(--bg, black);
}
```

We are repeating `var(--bg, black)`. If we want to change the default to `blue`, we have to edit it everywhere.

### The Solution: Pseudo-Private Variables

We create a new variable, prefixed with `_` (underscore), which acts as our internal source of truth.

```css
.button {
  /* Internal variable = Public variable OR Default */
  --_bg: var(--bg, black);

  /* Use the internal variable everywhere */
  background: var(--_bg);
  border: 1px solid var(--_bg);
}
```

To customize it, the user just sets the public variable:

```css
.button.red {
  --bg: red;
}
```

This acts like a **Constructor** for your CSS component. It's lightweight, requires no global registration, and works perfectly for local scope.

## The "Modern" Way: `@property`

With widespread support for `@property`, we can now define variables that _really_ have defaults, types, and are even animatable.

Instead of needing a "private" intermediate variable, we register the public property directly.

```css
@property --button-bg {
  syntax: '<color>';
  initial-value: black;
  inherits: true;
}

.button {
  /* No need for var(--button-bg, black) - the fallback is native! */
  background: var(--button-bg);
  border: 1px solid var(--button-bg);

  /* Plus: We can now transition this variable! */
  transition: --button-bg 0.3s;
}
```

### Why use `@property`?

1.  **Type Safety:** The browser knows `--button-bg` is a `<color>`. If someone sets `--button-bg: 20px`, it is invalid and falls back to `black` (the initial value), rather than breaking the UI.
2.  **Animation:** You can transition from `black` to `red` smoothly because the browser knows how to interpolate colors. Standard variables snap from one value to another.
3.  **Cleaner Code:** No need for the `--_` trick if you are okay with global registration.

### Which one to choose?

- **Use the `--_` pattern** for simple, local components where you don't want to pollute the global namespace with registered properties or when you need "soft" defaults that change based on context.

- **Use `@property`** when you need **animation**, strictly enforced types, or are building a robust Design System where properties are well-documented and globally unique.

## My Recommendation: The Professional Setup

To take your CSS architecture to the next level, I recommend combining these patterns with a solid foundational setup:

1.  **Global `:root` Variables:** Define your design tokens (colors, spacing units, scale) in a base file scoped to `:root`.

2.  **Organize with `@layer`:** I highly recommend using the `@layer` rule to manage your CSS cascade. Since it is now **Baseline Widely available**, it provides a robust way to handle context and overrides, especially in platforms or frameworks that inject styles at multiple levels. You can read more in my post: [How I Use @layer in CSS](/notebook/LYRCSS).

3.  **Consistent Spacing & Sizing:** Use a base `--spacing` unit and compute your paddings and margins from it (e.g., `padding: calc(var(--spacing) * 4)`). This ensures visual harmony across the entire project.

4.  **Fluid Typography with `clamp()`:** Don't use static font sizes. Use `clamp()` to create fluid typography that scales beautifully between mobile and desktop without needing a dozen media queries.



```css
/* 1. Global Setup with @layer and :root tokens */
@layer tokens, base, components;

@layer tokens {
  :root {
    --spacing: 0.25rem;
    /* 2. Fluid Typography with clamp() */
    --font-size-base: clamp(1rem, 1.2vw, 1.125rem);
    --color-primary: #3b82f6;
    --color-text: #1f2937;
  }
}

@layer components {
  .card {
    /* 3. Pseudo-private variables for component logic */
    --_bg: var(--card-bg, #ffffff);
    /* 4. Consistent spacing using calc() */
    --_padding: calc(var(--spacing) * 6);
    
    background: var(--_bg);
    padding: var(--_padding);
    font-size: var(--font-size-base);
    color: var(--color-text);
    border: 1px solid var(--color-primary);
    border-radius: calc(var(--spacing) * 2);
    
    /* Enable transition for the custom property */
    transition: --card-bg 0.3s ease;
  }
}

/* 5. Registered @property for smooth transitions */
@property --card-bg {
  syntax: "<color>";
  initial-value: #ffffff;
  inherits: false;
}

.card:hover {
  --card-bg: #f3f4f6;
}
```

By combining Lea's `--_` pattern for components with a global `:root` system, you get the best of both worlds: global consistency and local flexibility. In fact, I used this exact architecture to build this very website!

> Updated for 2026. Based on [Custom properties with defaults: 3+1 strategies](https://lea.verou.me/blog/2021/10/custom-properties-with-defaults/)
