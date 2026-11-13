---
draft: false
title: "Definitions Over Examples: Building a Design System AI Agents Can Actually Use"
description: "Coding agents read your design system docs and copy the examples — including the parts that were incidental. Here's how I made the CSS itself the contract, generated the agent-facing artifacts from it, and what I still haven't solved."
publishDate: 2026-08-14
cover: ../../../assets/images/mcps-role-in-the-future-of-ai-technology.png
coverAlt: A design system contract being read by an AI agent, with CSS definitions flowing into machine-readable artifacts
selfHealing: dfntns
lang: en
category: Architecture
author: 000001-jorge-saud
collections:
  - architecture
  - ai
tags:
  - design-systems
  - ai
  - agents
  - css
  - "2026"
linkedinCopy: |
  Fellow devs — your design system documentation was written for humans, and now the main thing reading it is a coding agent. Agents copy examples, and examples carry incidental details that become bugs. So I stopped hand-writing agent docs and made the CSS the contract: public token API, private internals, BEM, layers — all of it extracted at build time into a registry, an AGENTS.md, and an llms.txt. Definitions are the artifact; examples are optional. I also explain the part I have not solved yet, where the generated contract got so complete it started burning the agent's context. Sign in and tell me how your team is handling agents that write UI.
  Read more: https://www.giorgiosaud.io/notebook/dfntns

  #DesignSystems #AI #CSS #WebDev #Agents #DefinitionsOverExamples #MyCSSIsTheAPI

twitterCopy: |
  Fellow devs — agents copy your examples, incidental details and all. So I made the CSS the contract and generated the agent docs from it. Definitions over examples. Sign in and comment: https://www.giorgiosaud.io/notebook/dfntns #DesignSystems #AI #DefinitionsOverExamples
---

Give a coding agent your design system's documentation site and ask it to build a card. It will find an example, copy the markup, and hand you something that renders. Then look closely at what it copied.

It brought the wrapper div that only existed because the docs page needed a preview frame. It brought an inline `style` attribute someone left in an example three months ago. It picked a modifier class that happened to be in the snippet rather than the one your case needs. Everything incidental in that example is now load-bearing in your product.

The agent didn't fail. It did exactly what an example invites you to do: imitate it. The problem is that we've been writing documentation for humans, who read an example and infer the rule behind it, and handing it to machines, which read an example and reproduce it verbatim.

So in [BPL DS](https://ds.bepartnerlabs.com) I inverted it: **definitions are the artifact, examples are optional.**

## The CSS is already the contract

Here's the thing that took me embarrassingly long to see. I was thinking about writing documentation for agents — a hand-maintained file explaining every component, its tokens, its variants. And every component's CSS file already contained all of that, precisely, in a form I was keeping accurate anyway because it's the code that runs.

A component file declares its own public API:

```css
@layer bp-components {
  .bp-btn {
    --_background: var(--btn-background, var(--bp-primary));
    background: var(--_background);
    container-type: inline-size;
  }
}
```

That single declaration says four things without any prose: the component's public token is `--btn-background`, its default falls back to the base token `--bp-primary`, `--_background` is internal plumbing, and the component is a container query context. If an agent knows those four facts it can customize a button correctly. If it only has an HTML example, it will reach for `style="background: red"` — because the example never told it a token existed.

This is the 3-level constructor pattern I wrote about in [Custom Properties With Defaults](https://www.giorgiosaud.io/notebook/custom-properties-with-defaults-LVCSTP), applied as an agent contract:

| Level | Shape | Who touches it |
|---|---|---|
| 1 — base | `--bp-primary` | The consumer, once, when mapping brand values |
| 2 — public | `--btn-background` | **The only level an agent should ever set** |
| 3 — private | `--_background` | Nobody outside the component |

Level 2 is the interesting one: it is never declared anywhere. It exists only when a consumer sets it. The whole customization surface of the design system is a set of variables that don't exist until you use them — which is elegant in CSS and completely invisible to anything reading examples.

## One script, three outputs

So `pnpm build` runs a registry generator before Astro builds anything. It parses sources that already exist and writes three files:

| Input | What gets extracted |
|---|---|
| `src/styles/tokens.css` | Every `--bp-*` base token |
| `src/styles/components/*.css` | Public tokens, private vars, BEM variants, layer declarations, `container-type` usage |
| `src/content/docs/components/*.mdx` | `title` and `description` from frontmatter; canonical HTML shape from the first `<Preview>`, if there is one |

Out come `components.json` for programmatic consumption, `AGENTS.md` as the contract a coding agent reads in the repo, and `llms.txt` for anything crawling the docs site.

Each component lands in the registry like this:

```json
{
  "name": "btn",
  "title": "Button",
  "description": "Action trigger using <button> or <a>.",
  "html": "<button class=\"bp-btn\" type=\"button\">Label</button>",
  "containerQuery": true,
  "publicTokens": {
    "--btn-background": { "default": "var(--bp-primary)", "description": "Background color" }
  },
  "privateVars": ["--_background", "--_color", "--_radius"],
  "variants": ["bp-btn--danger", "bp-btn--ghost", "bp-btn--secondary"],
  "stateAttrs": []
}
```

Note what the `html` field is: a *canonical shape*, the minimum correct structure, not a rich example. And note that it's optional — a component with no `<Preview>` in its MDX still registers, still has its full token API, still gets built correctly by an agent. The example is a nicety for humans. The definition is what ships.

The practical effect on my workflow is that adding a component is writing the CSS file and the MDX frontmatter. That's it. I never touch a registry. There is no step where the documentation drifts from the code, because the documentation is a projection of the code.

## Rules that only exist because agents get them wrong

Generating the token API was the easy half. The other half is the conventions an agent has no way to infer from CSS alone, which I had to state explicitly because I watched them get broken:

- **State lives in the DOM, not in classes.** CSS reads `[aria-selected="true"]`, `[open]`, `:checked`, `:disabled`. JavaScript writes those attributes. Agents love to toggle a `.is-active` class, because that's what most of the training data does.
- **No `style=""`. Anywhere.** Not in production, not in a docs example. Every inline style in an example becomes an inline style in a hundred generated components. Variation is a BEM modifier or a component token.
- **`@container`, not `@media`.** Every component root has `container-type: inline-size`, so breakpoints are relative to the space the component sits in. The registry carries a `containerQuery` flag per component so an agent knows which of the two to reach for — `false` means full-viewport, use `@media`.
- **Never set level 1 or level 3.** An agent that sets `--bp-primary` on a button to make one button blue has just repainted half the site.

None of these are agent-specific good practice. They're all things I'd want a human contributor to follow. The difference is that a human breaks the rule once and learns; an agent breaks it identically in forty files before you look.

There's also a small thing I'm fond of: the package prints where its agent instructions live on install.

```
┌─────────────────────────────────────────────────────────┐
│ BPL DS installed — agent instructions available         │
├─────────────────────────────────────────────────────────┤
│ Local:  node_modules/@be-partner-labs/ds/AGENTS.md      │
│ Online: https://ds.bepartnerlabs.com/AGENTS.md          │
└─────────────────────────────────────────────────────────┘
```

Discovery is a real problem. A contract nobody finds is a contract nobody follows, and the moment right after install is when someone — or something — is deciding how to use your library.

## The part I haven't solved

Here's where I stop selling and tell you what's broken.

Generating `AGENTS.md` from the registry works so well that it generated *everything*. All 27 components, each with its full token list and docs pointer. It grew past 485 lines. Every agent session that loads it spends a meaningful chunk of its context reading token tables for components it will never touch, most of which follow patterns it could have inferred from two or three examples.

I solved documentation drift and bought myself a context problem.

The fix I've specced but not shipped is a canonical component principle: a component earns full treatment in `AGENTS.md` only if it teaches a pattern that can't be inferred from the others. Three cover the whole system:

| Pattern | Canonical component | What it teaches |
|---|---|---|
| Plain CSS component | Button | Level 2 tokens, BEM, private vars |
| Enhanced native element | Accordion | `<details>`/`<summary>`, zero JS, state from the native element |
| JS custom element | Dropdown | Custom element wrapper, keyboard nav, `aria-expanded` |

An agent that understands those three can construct any of the other 24 correctly. The rest become one line each — name, description, token count, docs URL — and the agent fetches details only for what it's actually building.

That's the design. It isn't built yet, and I'm writing this while `AGENTS.md` is still fat, because a post that only describes the parts that worked isn't much use to anyone doing this themselves. If you generate an agent contract from your codebase, you should expect completeness to become the next problem. Machine-generated documentation has no natural instinct for what to leave out — that instinct is the thing you have to encode on purpose.

## What I'd tell you to steal

You probably already have the contract. It's in your component CSS: the tokens you expose, the internals you don't, the naming convention you follow, the layer order you rely on. It's accurate because it's the code that runs, and you maintain it whether or not anyone reads it.

Hand-writing a separate document that describes it is how you get two sources of truth and one of them lying. Extract it instead, at build time, into whatever formats the things reading your system want — JSON for tooling, a markdown contract for the coding agent in the repo, a text file for crawlers.

Then be deliberate about what you leave out, which turns out to be the harder engineering problem of the two.

> **Try it**: BPL DS is MIT-licensed and on npm as `@be-partner-labs/ds`. The generated contract is public at [ds.bepartnerlabs.com/AGENTS.md](https://ds.bepartnerlabs.com/AGENTS.md) — point your agent at it and see how far it gets without reading a single HTML example.
