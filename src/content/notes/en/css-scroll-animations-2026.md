---
draft: true
title: "CSS Scroll Animations 2026: View Timeline Now Stable"
description: "Scroll-driven animations are now production-ready. Learn view timeline, scroll timeline, and animation-range for creating scroll-triggered effects without JavaScript."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
coverAlt: CSS Scroll Animations 2026
selfHealing: cssscr
lang: en
category: Development
author: giorgio-saud
collections:
  - css
  - frontend
tags:
  - css
  - scroll-animations
  - animation
  - "2026"
---

## Scroll Animations: Now Production-Ready

What was experimental in 2024 is now stable in 2026. Scroll-driven animations have broad browser support and are ready for production use without JavaScript intersection observers.

## Browser Support (2026)

| Browser | Support |
|---------|---------|
| Chrome 115+ | Full |
| Edge 115+ | Full |
| Firefox 126+ | Full |
| Safari 18+ | Full |

**Global support: ~90%**

## The Two Timeline Types

### 1. Scroll Timeline
Animation progresses as user scrolls the page:

```css
.progress-bar {
  animation: grow linear;
  animation-timeline: scroll();
}

@keyframes grow {
  from { width: 0%; }
  to { width: 100%; }
}
```

### 2. View Timeline
Animation triggers when element enters/exits viewport:

```css
.fade-in {
  animation: fadeIn linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## Animation Range Explained

Control exactly when animations start and end:

```css
.element {
  animation-timeline: view();
  animation-range: entry 10% cover 50%;
  /* Start: when 10% of element has entered
     End: when element covers 50% of viewport */
}
```

Range keywords:
- `entry` - Element entering viewport
- `exit` - Element leaving viewport
- `cover` - Element covering viewport
- `contain` - Viewport containing element

## Real Example from This Site

```css
main section.scroll-animated {
  animation: fadeSlideIn 1s ease both;
  animation-timeline: view();
  animation-range: entry 10% cover 40%;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

No intersection observers, no JavaScript - pure CSS.

## Advanced: Named Scroll Timelines

```css
.scroll-container {
  overflow-y: scroll;
  scroll-timeline: --container-scroll y;
}

.animated-element {
  animation: slide linear;
  animation-timeline: --container-scroll;
}
```

## Key Takeaways

1. **No JavaScript needed** - Replace intersection observers with CSS
2. **Two timelines** - `scroll()` for page scroll, `view()` for element visibility
3. **Precise control** - `animation-range` for exact timing
4. **Production ready** - 90%+ browser support in 2026
5. **Performant** - GPU-accelerated, compositor-thread animations

Scroll-driven animations eliminate entire categories of JavaScript code while providing smoother, more performant animations.
