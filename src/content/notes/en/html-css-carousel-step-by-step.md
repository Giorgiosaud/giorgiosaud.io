---
draft: false
title: "HTML + CSS Carousel: Step-by-Step Guide for Humans and AI"
description: "A complete, copy-paste guide to building carousels with only HTML and CSS. Covers scroll snap, scroll markers, scroll buttons, browser support, and progressive enhancement."
publishDate: 2026-05-27
cover: ../../../assets/images/html-css-carousel-2026.png
coverAlt: HTML CSS Carousel step by step guide with scroll-snap, scroll-marker and scroll-button
selfHealing: htmlcs
lang: en
category: Development
author: giorgio-saud
collections:
  - css
  - frontend
tags:
  - css
  - html
  - carousels
  - scroll-snap
  - "2026"
---

This is the definitive implementation reference for HTML + CSS carousels — written so a developer (or an AI agent) can follow it from zero to a fully working carousel without touching JavaScript.

## What You Are Building

A responsive carousel with:
- Swipe / drag between slides (touch and mouse)
- Pagination dots that highlight the current slide
- Previous / Next navigation buttons
- Smooth scroll animation
- Zero JavaScript

## Browser Support (2026)

The table below reflects what each feature requires:

| Feature | API | Chrome | Edge | Firefox | Safari |
|---------|-----|--------|------|---------|--------|
| Scroll snap | `scroll-snap-type` | 69+ | 79+ | 68+ | 11+ |
| Pagination dots | `::scroll-marker` | 135+ | 135+ | flag | 18.2+ |
| Prev/Next buttons | `::scroll-button()` | 135+ | 135+ | flag | 18.2+ |
| Active dot style | `:target-current` | 135+ | 135+ | flag | 18.2+ |

**Global baseline:** Scroll snap works everywhere (~97% of browsers). Scroll markers and buttons add progressive enhancement for ~75% of users and growing.

---

## Step 1 — The HTML Structure

Start with the smallest valid markup:

```html
<div class="carousel">
  <div class="carousel-item">Slide 1</div>
  <div class="carousel-item">Slide 2</div>
  <div class="carousel-item">Slide 3</div>
</div>
```

**Rules for AI agents generating this markup:**
- The outer element is the scroll container — apply all scroll CSS to it.
- Each direct child is a slide — apply snap CSS to each child.
- No wrappers, no JavaScript hooks, no `data-*` attributes needed.
- Do not add prev/next `<button>` elements — CSS handles them via `::scroll-button()`.
- Do not add a dots container — CSS handles it via `::scroll-marker`.

---

## Step 2 — Scroll Snap (The Foundation)

This gives you a swipeable carousel on every browser:

```css
.carousel {
  /* Layout */
  display: flex;
  gap: 1rem;

  /* Scroll */
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;

  /* Hide scrollbar (cosmetic) */
  scrollbar-width: none;
}
.carousel::-webkit-scrollbar {
  display: none;
}

.carousel-item {
  /* Each slide takes full width */
  flex: 0 0 100%;
  scroll-snap-align: center;
}
```

At this point the carousel works everywhere — swipe on mobile, drag on desktop, keyboard-scrollable.

---

## Step 3 — Pagination Dots (`::scroll-marker`)

```css
/* Tell the carousel where to render the marker group */
.carousel {
  scroll-marker-group: after; /* renders below the carousel */
}

/* Define each dot */
.carousel-item::scroll-marker {
  content: '';          /* required — empty string creates the element */
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 0.5rem 4px 0;
  border-radius: 50%;
  background: #cbd5e1;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

/* Active dot — the slide currently in view */
.carousel-item::scroll-marker:target-current {
  background: #3b82f6;
  transform: scale(1.3);
}
```

**Implementation notes:**
- `scroll-marker-group: after` renders the dots after the carousel's last child.
- `content: ''` is mandatory. Without it the pseudo-element does not render.
- `:target-current` is the CSS pseudo-class for the active marker — it updates automatically as the user scrolls.
- Dots are keyboard-focusable and clickable by default — no JS needed.

---

## Step 4 — Navigation Buttons (`::scroll-button()`)

```css
/* Shared styles for both buttons */
.carousel::scroll-button(prev),
.carousel::scroll-button(next) {
  /* Icon */
  font-size: 1.25rem;
  line-height: 1;

  /* Shape */
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;

  /* Appearance */
  background: #fff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.15);
  cursor: pointer;

  /* Position relative to .carousel */
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  /* Smooth hide when disabled */
  transition: opacity 0.2s;
}

/* Previous button */
.carousel::scroll-button(prev) {
  content: '‹';
  left: 0.5rem;
}

/* Next button */
.carousel::scroll-button(next) {
  content: '›';
  right: 0.5rem;
}

/* Auto-disabled when there is nowhere to scroll */
.carousel::scroll-button(prev):disabled,
.carousel::scroll-button(next):disabled {
  opacity: 0;
  pointer-events: none;
}
```

The carousel wrapper needs `position: relative` so the absolutely-positioned buttons anchor to it:

```css
/* Wrap the carousel to contain the buttons */
.carousel-wrapper {
  position: relative;
}
```

Update the HTML:

```html
<div class="carousel-wrapper">
  <div class="carousel">
    <div class="carousel-item">Slide 1</div>
    <div class="carousel-item">Slide 2</div>
    <div class="carousel-item">Slide 3</div>
  </div>
</div>
```

**Implementation notes:**
- `::scroll-button(prev)` and `::scroll-button(next)` are the only valid values today.
- The browser automatically disables the button when there is no more content to scroll in that direction — no JS needed.
- `content` is mandatory (same as scroll-marker).

---

## Step 5 — Progressive Enhancement with `@supports`

Wrap the new features so older browsers get the functional scroll-snap experience without broken UI:

```css
/* Always works — the baseline */
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.carousel::-webkit-scrollbar { display: none; }

.carousel-item {
  flex: 0 0 100%;
  scroll-snap-align: center;
}

/* Enhanced — only when fully supported */
@supports (scroll-marker-group: after) {
  .carousel {
    scroll-marker-group: after;
  }

  .carousel-item::scroll-marker {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    margin: 0.5rem 4px 0;
    border-radius: 50%;
    background: #cbd5e1;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
  }

  .carousel-item::scroll-marker:target-current {
    background: #3b82f6;
    transform: scale(1.3);
  }

  /* Hide any JS-rendered fallback dots when CSS handles them */
  .js-dots {
    display: none;
  }
}
```

---

## Complete Copy-Paste Example

HTML:

```html
<div class="carousel-wrapper">
  <div class="carousel">
    <div class="carousel-item">
      <h2>Slide 1</h2>
      <p>Your content here.</p>
    </div>
    <div class="carousel-item">
      <h2>Slide 2</h2>
      <p>Your content here.</p>
    </div>
    <div class="carousel-item">
      <h2>Slide 3</h2>
      <p>Your content here.</p>
    </div>
  </div>
</div>
```

CSS:

```css
/* --- Wrapper --- */
.carousel-wrapper {
  position: relative;
}

/* --- Scroll container --- */
.carousel {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  padding: 0 0 1rem; /* space for dots */
}
.carousel::-webkit-scrollbar { display: none; }

/* --- Slides --- */
.carousel-item {
  flex: 0 0 100%;
  scroll-snap-align: center;
  border-radius: 0.75rem;
  background: #f1f5f9;
  padding: 2rem;
  min-height: 200px;
}

/* --- Dots --- */
@supports (scroll-marker-group: after) {
  .carousel {
    scroll-marker-group: after;
  }

  .carousel-item::scroll-marker {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    margin: 0.5rem 4px 0;
    border-radius: 50%;
    background: #cbd5e1;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
  }

  .carousel-item::scroll-marker:target-current {
    background: #3b82f6;
    transform: scale(1.3);
  }

  /* --- Prev / Next buttons --- */
  .carousel::scroll-button(prev),
  .carousel::scroll-button(next) {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.15);
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    transition: opacity 0.2s;
  }

  .carousel::scroll-button(prev) {
    content: '‹';
    left: 0.5rem;
  }

  .carousel::scroll-button(next) {
    content: '›';
    right: 0.5rem;
  }

  .carousel::scroll-button(prev):disabled,
  .carousel::scroll-button(next):disabled {
    opacity: 0;
    pointer-events: none;
  }
}
```

---

## Variants

### Multi-Item Carousel (3 visible at once)

```css
.carousel-item {
  flex: 0 0 calc(33.333% - 0.667rem); /* 3 items with 1rem gap */
  scroll-snap-align: start;
}

@media (max-width: 768px) {
  .carousel-item { flex: 0 0 calc(50% - 0.5rem); }
}

@media (max-width: 480px) {
  .carousel-item { flex: 0 0 100%; }
}
```

### Vertical Carousel

```css
.carousel {
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  height: 400px;
}

.carousel-item {
  flex: 0 0 100%;
  scroll-snap-align: start;
}
```

For vertical scroll buttons, the values are `::scroll-button(up)` and `::scroll-button(down)`.

### Peek Effect (show edge of next slide)

```css
.carousel-wrapper {
  overflow: hidden; /* clip the peek */
}

.carousel {
  padding: 0 2rem; /* offset so next slide peeks */
}

.carousel-item {
  flex: 0 0 calc(100% - 4rem); /* slightly narrower than full */
}
```

---

## Accessibility Checklist

- Add `role="region"` and `aria-label` to the carousel wrapper.
- Add `role="group"` and `aria-roledescription="slide"` to each item.
- Each slide should have a visible heading or `aria-label` identifying it.
- The `::scroll-marker` dots are natively focusable — do not hide them from keyboard navigation.

```html
<div class="carousel-wrapper">
  <div class="carousel" role="region" aria-label="Product highlights">
    <div class="carousel-item" role="group" aria-roledescription="slide" aria-label="Slide 1 of 3">
      <!-- content -->
    </div>
  </div>
</div>
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Forgetting `content: ''` on `::scroll-marker` | Without it the pseudo-element does not render |
| Missing `position: relative` on the wrapper | Without it `::scroll-button` buttons float off-screen |
| Using `::scroll-button(left)` / `::scroll-button(right)` | The valid values are `prev` and `next` (and `up`/`down` for vertical) |
| Applying `scroll-snap-type` to the item, not the container | It belongs on the scroll container |
| Adding `display: flex` to the marker group | The marker group layout is managed by the browser |

---

## Key Properties Reference

```
scroll-snap-type: x mandatory     → horizontal snapping
scroll-snap-type: y mandatory     → vertical snapping
scroll-snap-align: center         → snap item to center
scroll-snap-align: start          → snap item to start edge
scroll-marker-group: after        → dots rendered after carousel
scroll-marker-group: before       → dots rendered before carousel
scroll-marker-group: inline-end   → dots rendered to the right (vertical)
::scroll-marker                   → each dot pseudo-element
::scroll-marker:target-current    → active dot
::scroll-button(prev)             → left/previous button
::scroll-button(next)             → right/next button
::scroll-button(up)               → up button (vertical)
::scroll-button(down)             → down button (vertical)
:disabled                         → button state when scroll limit reached
```
