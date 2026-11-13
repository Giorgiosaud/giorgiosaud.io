---
draft: false
title: "Giving My Notebook a WebMCP Interface: Two Read-Only Tools for Browser Agents"
description: "WebMCP lets a page hand AI agents real tools instead of making them scrape the DOM. Here's where the API stands in late 2026, how I exposed search and read-as-Markdown on this notebook in under 300 lines, and what I still haven't verified."
publishDate: 2026-11-13
cover: ../../../assets/images/llms-txt-implementation.png
coverAlt: A browser window exposing tool icons to an AI agent instead of raw page markup
selfHealing: wbmcpn
lang: en
category: Development
author: giorgio-saud
collections:
  - ai
  - frontend
tags:
  - webmcp
  - ai
  - agents
  - astro
  - "2026"
linkedinCopy: |
  Fellow devs — right now a browser agent reading your site takes screenshots and guesses which div is the search box. WebMCP flips that: the page registers tools with a name, a JSON Schema and a function, and the agent calls them. I added two to this notebook: search_notes and read_note, both read-only, both thin wrappers over endpoints the site already had. One thing to know before you copy old tutorials: the API moved from navigator.modelContext to document.modelContext this year, and unregisterTool never existed — you remove tools with an AbortSignal. No mainstream agent consumes these tools yet, so I explain why I shipped it anyway and what I still haven't verified. Sign in and tell me what tools your site would expose.
  Read more: https://www.giorgiosaud.io/notebook/wbmcpn

  #WebMCP #AI #Agents #WebDev #Astro #ToolsNotScreenshots #AgentReadyWeb

twitterCopy: |
  Fellow devs — my notebook now registers WebMCP tools: search_notes and read_note. Heads up: it's document.modelContext now, and tools unregister via AbortSignal. Sign in and comment: https://www.giorgiosaud.io/notebook/wbmcpn #WebMCP #ToolsNotScreenshots
---

Watch a browser agent use a website today and it's a little painful. It takes a screenshot, reads the accessibility tree, guesses which input is the search box, types, waits, takes another screenshot, and hopes the results it's looking at are the ones it asked for.

This notebook already has a search API. It already serves every note as clean Markdown (that's how [llms.txt works here](https://www.giorgiosaud.io/notebook/llms-txt-implementation-llmstx)). An agent shouldn't have to *infer* any of that from pixels.

That's the promise of **WebMCP**: the page tells the agent, in code, "here are the things you can do, here's the schema for each, call them." I added two such tools to this site. This post covers where the API stands, the code, and — honestly — what I could and couldn't test.

## What WebMCP is (and isn't)

WebMCP is a proposed browser API, incubated in the W3C Web Machine Learning Community Group. A page registers **tools** — a name, a description, a JSON Schema for input, and a JavaScript function — and an agent running in the browser can discover and call them.

It borrows MCP's vocabulary, but it isn't an MCP server. There's no transport, no separate process, no endpoint to host. The tools run as JavaScript *inside the page*, with the user's session and the page's origin. You could call it a client-side MCP server, and the spec does.

### Where it stands (November 2026)

This moves fast, and most tutorials from early in the year are already wrong:

- **Status:** a Draft Community Group Report. Not a W3C standard, not on the standards track yet.
- **Chrome:** an origin trial started in Chrome 149. For local testing, enable `chrome://flags/#enable-webmcp-testing`. Edge has it behind a flag. Firefox and Safari take part in the discussion but haven't committed to shipping.
- **The entry point moved.** The first implementation used `navigator.modelContext`. The July 2026 draft moved it to **`document.modelContext`**, and Chrome 150 deprecated the old location while still serving both during the trial.
- **Methods were removed.** `provideContext()` and `clearContext()` were dropped in March. There is no `unregisterTool()`. You pass an `AbortSignal` when registering and abort it to remove the tool.
- **Consumers:** as far as I could find, no mainstream agent calls WebMCP tools in production yet. Google has said Gemini in Chrome will be first. That's an announcement, not a release.

So why build it now?

## Why I shipped it anyway

Because it cost almost nothing. Both tools are thin wrappers over URLs the site already serves:

| Tool | What it calls | Already existed for |
|---|---|---|
| `search_notes` | `/api/notes/search.json` | The notebook search page |
| `read_note` | `/notebook/<slug>.md` | `llms.txt` and the `text/markdown` alternate link |

No new endpoints, no new data, no new auth. Browsers without WebMCP skip it with a single `if`. And because the tools call the same endpoints the UI uses, the agent and the page can't disagree about what the notebook contains.

## The code

### Finding the model context

Feature detection has to handle both locations while the trial lasts:

```ts
export function getModelContext(doc: unknown, nav: unknown) {
  const fromDoc = (doc as { modelContext?: ModelContextLike })?.modelContext
  if (fromDoc && typeof fromDoc.registerTool === 'function') return fromDoc
  const fromNav = (nav as { modelContext?: ModelContextLike })?.modelContext
  if (fromNav && typeof fromNav.registerTool === 'function') return fromNav
  return null
}
```

Prefer `document.modelContext`, fall back to `navigator.modelContext`, and check that `registerTool` is actually a function rather than trusting that the property exists.

### Defining a tool

A tool is a plain object. Here's `search_notes`, trimmed:

```ts
const searchNotes = {
  name: 'search_notes',
  title: 'Search notebook',
  description:
    "Search Giorgio Saud's web development notebook. Returns matching notes " +
    'with title, description, URL and a slug you can pass to read_note.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Free-text search. Empty lists the latest notes.' },
      lang: { type: 'string', enum: ['en', 'es'] },
      collection: { type: 'string' },
      page: { type: 'integer', minimum: 1 },
    },
  },
  annotations: { readOnlyHint: true },
  async execute(input) {
    const params = new URLSearchParams({ lang: parseLang(input.lang, env.lang) })
    if (typeof input.query === 'string') params.set('q', input.query)

    const res = await env.fetch(`${env.origin}/api/notes/search.json?${params}`)
    if (!res.ok) return error(`Search failed with HTTP ${res.status}`)

    const data = await res.json()
    return text({
      total: data.total,
      results: data.results.map(note => ({
        slug: note.id,
        title: note.title,
        url: `${env.origin}${note.href}`,
      })),
    })
  },
}
```

A few choices in there are deliberate:

- **The description is written for a model.** It says what the notebook covers and tells the agent the slug goes into `read_note`. That sentence is how the two tools chain together.
- **`readOnlyHint: true`.** The spec defines annotations so an agent (or the browser) can decide how carefully to treat a call. There's also `consequentialHint` for actions with real side effects. I don't have any of those, on purpose.
- **Absolute URLs out.** The search API returns relative `href`s for the UI. The agent gets full URLs it can cite.
- **Errors are results, not exceptions.** A 500 becomes `{ isError: true, content: [...] }` with a sentence the model can read and act on.

`read_note` does one more thing worth copying: with no arguments it reads the note *open in the current tab*, using the `<link rel="alternate" type="text/markdown">` every note page already has. "Summarize this post" works without the agent knowing any slug.

### Treat agent input as untrusted

The slug comes from a model, which got it from who knows where. Before it goes anywhere near a URL, it has to look like a note:

```ts
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function parseNoteRef(ref: string, fallbackLang: NotebookLang) {
  const trimmed = ref.trim()
  if (SLUG_REGEX.test(trimmed)) return { slug: trimmed, lang: fallbackLang }

  const { pathname } = new URL(trimmed, 'https://placeholder.invalid')
  const match = pathname.match(/^\/(?:(es)\/cuaderno|notebook)\/([a-z0-9-]+?)(?:\.md)?\/?$/)
  if (!match) return null
  return { slug: match[2], lang: match[1] ? 'es' : 'en' }
}
```

It accepts a bare slug, a path or a full note URL (models love pasting URLs), and rejects anything else — `../../secret`, `/dashboard`, free text — before a single request goes out. The fetch only ever targets the page's own origin.

### Registering, and un-registering

```ts
export async function registerNotebookTools(ctx, tools) {
  const controller = new AbortController()
  for (const tool of tools) {
    try {
      await ctx.registerTool(tool, { signal: controller.signal })
    } catch (err) {
      console.warn(`[webmcp] could not register ${tool.name}`, err)
    }
  }
  return controller
}
```

`await` covers both the spec's promise-returning `registerTool` and older synchronous builds. One failed registration (a duplicate name, say) doesn't take the others down. Calling `controller.abort()` removes every tool at once. That matters for SPAs where tools should follow the current view. This site is a multi-page Astro app, so tools simply live as long as the page.

### Wiring it into Astro

The whole integration is a component with a `<script>`, rendered once in each layout:

```astro
<script>
  import { createNotebookTools, getModelContext, registerNotebookTools } from '@global-scripts/webmcp'

  const lang = document.documentElement.lang === 'es' ? 'es' : 'en'
  const currentMarkdownPath = document
    .querySelector('link[rel="alternate"][type="text/markdown"]')
    ?.getAttribute('href') ?? null

  const tools = createNotebookTools({
    fetch: window.fetch.bind(window),
    origin: window.location.origin,
    lang,
    currentMarkdownPath,
  })

  const ctx = getModelContext(document, navigator)
  if (ctx) registerNotebookTools(ctx, tools)
</script>
```

Astro processes and bundles the script like any other, and pages that never get WebMCP pay for one feature check. If you send a `Permissions-Policy` header, note that WebMCP is gated by the `tools` feature, which defaults to `'self'`. Don't list it as `tools=()` by accident. It also needs a secure context, and `localhost` counts.

## How I tested it, and what I haven't

I keep [repeating this lesson](https://www.giorgiosaud.io/notebook/anchor-scope-position-try-chrome-bug-nchrsc): passing tests aren't proof that something works in a real browser. So here's exactly what's verified:

- **Unit tests** (Vitest, mocked `fetch`): detection order, slug parsing and rejection, query building, error results, and that every tool registers with the shared signal. 16 tests.
- **In a real browser, against the dev server:** a dev-only hook exposes the tool objects, so I called both tools from the console on a live note page. Search returned real results with absolute URLs. `read_note` with no arguments returned the open note's Markdown. Unknown slugs came back as clean errors.
- **Against a spec-shaped fake `modelContext`:** a promise-returning `registerTool` that rejects duplicates and removes tools when the signal aborts. Both tools registered, executed through the fake registry, and disappeared on `abort()`.

What I **haven't** done yet is watch a real agent call them. That needs Chrome with the testing flag plus Google's Model Context Tool Inspector extension (which asks for a Gemini API key), and the browser I tested in doesn't ship WebMCP at all. When I run that end to end, I'll update this note with what the agent actually did.

## What I didn't build

- **No write tools.** Posting a comment or sending the contact form would be natural tools, and both have consequences. They'd need `consequentialHint` and a real confirmation step. Read-only first.
- **No declarative API.** The spec has a planned HTML-attribute way to turn existing forms into tools, but that section was still marked TODO when I checked. My forms can wait.
- **No library.** There are wrapper packages, but this is under 300 lines including schemas. For two tools, a dependency on an API that changed shape twice this year costs more than it saves.

## If you want to try this on your site

1. List what an agent would actually want to do on your site, and start with the read-only ones.
2. Check whether you already serve that data somewhere, like a search endpoint, a feed or a Markdown version. Wrap that instead of building a new one.
3. Detect `document.modelContext` first, then `navigator.modelContext`, and register with an `AbortSignal`.
4. Write descriptions for a model, validate every input, and return errors as readable results.

Then test it in a real browser. If you find an agent that consumes these tools today, I want to hear about it.
