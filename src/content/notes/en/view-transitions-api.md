---
draft: false
title: "View Transitions API: Smooth Page Navigation"
description: "Learn how to add smooth page transitions with a single CSS rule, customize animations for specific elements, and create SPA-like experiences without JavaScript."
publishDate: 2026-01-02
cover: ../../../assets/images/view-transitions-api.png
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

Here's something that stopped me in my tracks when I first saw it: smooth page transitions across a multi-page site with a single line of CSS. No JavaScript, no library, no framework magic.

```css
@view-transition {
  navigation: auto;
}
```

That's literally it. Your entire site now crossfades between pages. I added this to giorgiosaud.io wrapped in a `@layer` block and it took about two minutes:

```css
@layer root {
  @view-transition {
    navigation: auto;
  }
}
```

Navigate between pages on this site right now and you'll see it working.

## Customizing the animation

The default crossfade is fine, but you can swap it for something with more character:

```css
::view-transition-old(root) {
  animation: 300ms ease-out both fade-out;
}

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

During a transition, the browser builds a pseudo-element tree you can target individually — `::view-transition-old(root)` is the outgoing page snapshot, `::view-transition-new(root)` is the incoming one.

## The part that's actually magic: element morphing

Give an element the same `view-transition-name` on two different pages and the browser animates it moving between positions. Like this:

```html
<!-- Page 1: listing -->
<img src="product.jpg" style="view-transition-name: product-image;" />

<!-- Page 2: detail -->
<img src="product.jpg" style="view-transition-name: product-image;" />
```

The image literally flies from its position on the listing page to its position on the detail page. No JavaScript involved. The browser handles all the interpolation.

You can do the same with headers to keep them anchored during transitions:

```css
.header {
  view-transition-name: header;
}
```

## Browser support

As of early 2026 this is in Chrome, Edge, Firefox, and Safari. For older browsers, the `@view-transition` rule is simply ignored — users get normal instant navigation, which is what they always had. Progressive enhancement for free.

Worth keeping in mind: each `view-transition-name` must be unique on the page or the browser won't know what to animate.
