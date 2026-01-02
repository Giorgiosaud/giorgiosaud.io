---
draft: true
title: "View Transitions API: Smooth Page Navigation"
description: "Learn how to add smooth page transitions with a single CSS rule, customize animations for specific elements, and create SPA-like experiences without JavaScript."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
coverAlt: View Transitions API illustration
selfHealing: vwtrns
lang: en
category: Development
author: giorgio-saud
collections:
  - css
  - frontend
tags:
  - css
  - view-transitions
  - navigation
  - animation
---

## The Simplest Upgrade You Can Make

For years, smooth page transitions were exclusive to SPAs. Multi-page apps had jarring full-page reloads. The View Transitions API changes that with literally one CSS rule.

```css
@view-transition {
  navigation: auto;
}
```

That's it. Your entire site now has smooth fade transitions between pages. No JavaScript, no libraries, no complex setup.

## How It Works

When you navigate between pages:

1. Browser captures a "screenshot" of the current page
2. New page loads in the background
3. Browser captures the new page state
4. Crossfade animation plays between them

All automatic, all native, all performant.

## The Implementation

Here's the actual CSS from this site:

```css
@layer root {
  @view-transition {
    navigation: auto;
  }
}
```

Wrapped in a `@layer` for proper cascade management, but the core is just that one declaration.

## Customizing the Transition

The default crossfade is nice, but you can customize it:

```css
/* Customize the outgoing page animation */
::view-transition-old(root) {
  animation: 300ms ease-out both fade-out;
}

/* Customize the incoming page animation */
::view-transition-new(root) {
  animation: 300ms ease-in both fade-in;
}

@keyframes fade-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.95); }
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(1.05); }
  to { opacity: 1; transform: scale(1); }
}
```

## Element-Level Transitions

Here's where it gets magical. Give elements the same `view-transition-name` on different pages, and they'll morph between states:

**Page 1 - Product listing:**
```html
<img
  src="product.jpg"
  alt="Product"
  style="view-transition-name: product-image;"
/>
```

**Page 2 - Product detail:**
```html
<img
  src="product.jpg"
  alt="Product"
  style="view-transition-name: product-image;"
/>
```

The browser sees matching names and creates a fluid animation of the image moving and resizing between its positions on each page.

## Real Example: Persistent Header

Keep your header in place during transitions:

```css
.header {
  view-transition-name: header;
}
```

Now the header stays fixed while the rest of the page transitions. No layout shift, no flash.

## The Pseudo-Element Tree

During a transition, the browser creates a pseudo-element tree:

```
::view-transition
├── ::view-transition-group(root)
│   ├── ::view-transition-old(root)
│   └── ::view-transition-new(root)
├── ::view-transition-group(header)
│   ├── ::view-transition-old(header)
│   └── ::view-transition-new(header)
└── ...
```

Target any of these for custom animations:

```css
::view-transition-group(header) {
  animation-duration: 0.5s;
}

::view-transition-old(header) {
  /* Old header fades out */
}

::view-transition-new(header) {
  /* New header fades in */
}
```

## Slide Transitions

Create directional slide effects:

```css
@keyframes slide-from-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes slide-to-left {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

::view-transition-old(root) {
  animation: 300ms slide-to-left ease-out;
}

::view-transition-new(root) {
  animation: 300ms slide-from-right ease-out;
}
```

## Conditional Transitions

Different transitions for different navigation patterns:

```css
/* Only apply transitions for same-origin navigations */
@view-transition {
  navigation: auto;
  types: slide, fade; /* Custom types you define */
}

/* Different animations based on navigation type */
html:active-view-transition-type(slide) {
  &::view-transition-old(root) {
    animation-name: slide-out;
  }
  &::view-transition-new(root) {
    animation-name: slide-in;
  }
}
```

## Disable for Specific Links

Some navigations shouldn't animate:

```html
<a href="/logout" style="view-transition-name: none;">Logout</a>
```

Or disable programmatically:

```javascript
// Skip transition for this navigation
document.startViewTransition(() => {
  window.location.href = '/instant-page'
}, { skipTransition: true })
```

## Performance Considerations

View transitions are GPU-accelerated and optimized:

1. **Automatic optimization** - Browser handles layer creation
2. **No layout thrashing** - Works on compositor thread
3. **Memory efficient** - Only captures what's needed

But be mindful:
- Very large pages may have capture delays
- Complex animations can still drop frames
- Test on low-end devices

## Browser Support (2026)

As of early 2026:
- **Chrome 111+**: Full support
- **Edge 111+**: Full support
- **Firefox 129+**: Full support
- **Safari 18+**: Full support

The feature has reached mainstream adoption!

## Graceful Degradation

For older browsers, the CSS is simply ignored:

```css
@view-transition {
  navigation: auto;
}
/* ↑ Unknown at-rule? Ignored. No errors. */
```

Users on older browsers get normal instant navigation - which is what they've always had.

## Key Takeaways

1. **One line activation** - `@view-transition { navigation: auto; }`
2. **Zero JavaScript** - Pure CSS for basic transitions
3. **Element morphing** - Same `view-transition-name` = magic
4. **Full customization** - Control every pseudo-element
5. **Progressive enhancement** - Works everywhere, enhanced where supported

View Transitions bring SPA-like polish to multi-page apps. The barrier to entry is essentially zero - add one CSS rule and you're done. Then customize as needed.

> **Experience it now**: Navigate between pages on this site. Notice the smooth crossfade? That's View Transitions in action.
