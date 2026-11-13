---
draft: false
title: "anchor-scope + position-try-fallbacks: The Chrome Bug That Anchored My Tooltips to the Wrong Element"
description: "I tried to remove the per-instance naming from my design system's tooltip using anchor-scope. It worked until a fallback position engaged — then tooltips started anchoring to a different trigger entirely."
publishDate: 2026-08-13
cover: ../../../assets/images/css-anchor-positioning.png
coverAlt: A tooltip anchored to the wrong trigger element, with a broken anchor line crossing between two buttons
selfHealing: nchrsc
lang: en
category: Development
author: giorgio-saud
collections:
  - css
  - frontend
tags:
  - css
  - anchor-positioning
  - tooltips
  - chrome
  - "2026"
linkedinCopy: |
  Fellow devs — I tried to delete an API from my design system. CSS anchor-scope promised to make tooltip anchoring automatic, so consumers would stop writing a unique name per instance. It worked beautifully until a position-try fallback engaged, and then a tooltip anchored itself to a completely different button on the page. Verified in Chrome 150. Baseline told me both features were available; it did not tell me they compose. I documented the repro, the theory, and what I shipped instead. Sign in and tell me which shiny new CSS feature betrayed you in production.
  Read more: https://www.giorgiosaud.io/notebook/nchrsc

  #CSS #AnchorPositioning #WebDev #Chrome #Baseline #BaselineIsNotAPromise #MyTooltipsWentRogue

twitterCopy: |
  Fellow devs — anchor-scope + position-try-fallbacks in Chrome 150: my tooltip anchored to a different button entirely. Repro and workaround inside. Sign in and comment: https://www.giorgiosaud.io/notebook/nchrsc #CSS #BaselineIsNotAPromise
---

I wanted to delete an API.

The tooltip in my design system supports CSS Anchor Positioning, but only if you opt in per instance. You have to hang a unique dashed-ident on the wrapper yourself:

```html
<span class="bp-tooltip-wrap" style="--tooltip-anchor: --save-tip">
  <button>Save</button>
  <span class="bp-tooltip">Saves without closing</span>
</span>
```

That `--save-tip` is pure ceremony. The consumer has to invent a name, keep it unique across the page, and remember to do it at all — and if they forget, the tooltip silently falls back to `position: absolute` and gets clipped by the first `overflow: hidden` ancestor. Every design system has a few of these papercuts where the implementation leaks into the API. I had a way to close this one, so I took it.

If you need the basics of how anchoring works first, I wrote about that in [CSS Anchor Positioning](https://www.giorgiosaud.io/notebook/css-anchor-positioning-cssnch). This post is about what happens when you push it one step further than the browser is ready for.

## The idea: one shared name, re-scoped per instance

`anchor-scope` exists exactly for this. It limits the visibility of an `anchor-name` to a subtree, so the same name can be reused all over the page without collisions. Each wrapper becomes its own little universe:

```css
.bp-tooltip-wrap {
  anchor-scope: --bp-tooltip-anchor;
}

.bp-tooltip-wrap > :first-child {
  anchor-name: --bp-tooltip-anchor;
}

.bp-tooltip {
  position: fixed;
  position-anchor: --bp-tooltip-anchor;
  bottom: calc(anchor(top) + var(--_offset) * -1);
  inset-inline-start: anchor(center);
  translate: -50% -100%;
}
```

One name, declared once, scoped to each wrapper. No inline styles, no naming, no way for a consumer to get it wrong. The API disappears and the feature stays.

And it works. Hover any single tooltip in isolation and it lands exactly where it should, escapes `overflow: hidden`, renders above everything. I was ready to ship it.

## Where it breaks

The tooltip also has fallback positions, so it flips instead of leaving the viewport:

```css
.bp-tooltip {
  position-try-fallbacks: --bp-tooltip-bottom, --bp-tooltip-end, --bp-tooltip-start;
}

@position-try --bp-tooltip-bottom {
  bottom: auto;
  top: calc(anchor(bottom) + var(--_offset));
  translate: -50% 0;
}
```

That combination is where it falls apart. **Once a fallback position engages, the tooltip can anchor to a different instance's trigger somewhere else on the page.**

Not off by a few pixels. Anchored to the wrong element entirely — a tooltip floating next to a button that has nothing to do with it.

I found it in the worst possible place: the "All placements" preview in my own docs, which renders four tooltips side by side to demo top / bottom / start / end. It's the one spot on the site where several instances sit close enough to crowd each other, so several of them are pushed into their fallbacks at once. Two tooltips visible at the same time, one of them parked next to a stranger's trigger.

The kicker is that this is the exact scenario the docs page exists to show off. If I had only ever tested one tooltip at a time — which is what you do when you're checking whether a tooltip works — I would have shipped it and let someone else discover this in their own product.

## Why I think it happens

I can't point at a spec line and call it settled, so take this as a working theory: `anchor-scope` re-scoping doesn't reliably survive `@position-try` fallback evaluation as of Chrome 150.

It reads like an ordering problem. Fallback evaluation re-resolves the position of the element against its anchor, and somewhere in that re-resolution the scoped name resolves against the wrong subtree — the shared `anchor-name` is genuinely ambiguous at that moment, and the scope that was supposed to disambiguate it isn't applied. Which instance you land on is essentially luck.

Both features are recent. Anchor Positioning and `anchor-scope` both landed as "newly available" in Baseline 2025. Individually they're solid and I use them in production. It's the intersection that's undercooked, and an intersection is exactly the kind of thing nothing tells you about ahead of time.

## How to check it yourself

If you're building on `anchor-scope`, the repro takes a minute:

1. Render **two or more** anchored instances close to each other, not one.
2. Give them `position-try-fallbacks` and crowd them near a viewport edge so a fallback actually engages.
3. Hover each one and watch where the other one goes.

The condition to watch for is cross-anchoring: an element anchoring to a sibling instance's trigger. If everything stays put with a single instance and only misbehaves when several are near each other, that's this bug, not your CSS.

Testing one instance in a clean page proves nothing here. The failure needs neighbours.

## What I shipped instead

I reverted to the opt-in pattern. Consumers still write their own unique name:

```css
@supports (anchor-name: --x) {
  .bp-tooltip-wrap:has(> [style*="--tooltip-anchor"]) {
    > :first-child {
      anchor-name: var(--tooltip-anchor);
    }
  }

  .bp-tooltip-wrap:has(> [style*="--tooltip-anchor"]) .bp-tooltip {
    position: fixed;
    position-anchor: var(--tooltip-anchor);
    bottom: calc(anchor(top) + var(--_offset) * -1);
    inset-inline-start: anchor(center);
    translate: -50% -100%;
    position-try-fallbacks: --bp-tooltip-bottom, --bp-tooltip-end, --bp-tooltip-start;
    z-index: unset;
  }
}
```

More verbose, uglier, and correct. Every instance gets a genuinely distinct name, so there's no ambiguity left for the fallback pass to resolve wrongly.

I also left the reason in the stylesheet rather than in a commit message, because the next person to look at this file will be me in six months, wondering why the automatic version isn't there:

```css
/*
 * Tried making this automatic via `anchor-scope` (one shared
 * anchor-name re-scoped per .bp-tooltip-wrap) so no naming would be
 * needed — but verified in Chrome 150 that anchor-scope combined with
 * position-try-fallbacks cross-contaminates between sibling tooltip
 * instances once a fallback position engages: a tooltip can render
 * anchored to a *different* trigger's position. Reverted to explicit
 * per-instance names until that engine interaction is reliable.
 */
```

A reverted approach with no explanation is an invitation to try it again and lose the same afternoon.

## The takeaway

Baseline tells you a feature is available. It does not tell you that two newly available features compose.

That's not a complaint about Baseline — it answers the question it was built to answer, per feature, honestly. But "Chrome 125+, full support" for Anchor Positioning and "newly available" for `anchor-scope` are two separate promises, and neither of them covers what happens when a fallback position re-resolves a scoped anchor name. Nobody publishes a support matrix for feature intersections. There's no row for that.

So when your design depends on two young features meeting, test the meeting point specifically, with enough instances on the page to make the interesting code path run. The bug you're looking for won't show up in the clean isolated demo. It shows up in the docs page where you put everything side by side to show off — which, if you're lucky like I was, is a page you own.

> **Status**: verified broken in Chrome 150, July 2026. If you're reading this later and the engine interaction has been fixed, the automatic version is worth another look — just re-run the two-instance test before you trust it.
