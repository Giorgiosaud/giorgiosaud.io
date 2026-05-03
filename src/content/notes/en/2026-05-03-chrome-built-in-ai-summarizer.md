---
draft: false
title: "Chrome Built-in AI: The Summarizer API"
description: "Chrome ships a native Summarizer API powered by on-device AI. No API keys, no server costs, no privacy concerns — the model runs entirely in your browser."
publishDate: 2026-05-03
cover: ../../../assets/images/chrome-built-in-ai-summarizer.png
coverAlt: Chrome browser with a robot summarizing text on screen
selfHealing: chrmbl
lang: en
category: Development
author: giorgio-saud
collections:
  - ai
  - frontend
tags:
  - ai
  - chrome
  - browser-api
  - summarizer
  - built-in-ai
---

## The Browser Is Becoming an AI Runtime

For the past few years AI features meant calling an external API — OpenAI, Anthropic, Google. You send text to a server, pay per token, and hope latency is acceptable. Chrome is changing that model. Starting with Chrome 131, a set of built-in AI APIs runs models **directly on the user's device**, inside the browser, with zero network requests.

The first one worth integrating today is the **Summarizer API**.

> **Try it now**: if you're on Chrome with the flag enabled, the 🤖 button on this page uses exactly this API to summarize the article you're reading.

## What Is the Summarizer API?

It's a native browser API that condenses text into a shorter form. The model runs locally using Chrome's on-device inference engine (powered by Gemini Nano). No API key, no server round-trip, no data leaving the device.

```js
// Check availability
const availability = await Summarizer.availability({ expectedOutputLanguage: 'en' })
// → "available" | "downloadable" | "downloading" | "unavailable"

// Create a session
const summarizer = await Summarizer.create({
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
  expectedInputLanguages: ['en'],
  expectedOutputLanguage: 'en',
})

// Summarize
const summary = await summarizer.summarize(document.body.innerText)
console.log(summary)
```

## Streaming Output

For a better UX, stream the result as it generates — same pattern as any LLM streaming API:

```js
const stream = summarizer.summarizeStreaming(text)
let result = ''

for await (const chunk of stream) {
  result += chunk
  outputEl.innerHTML = marked.parse(result) // render markdown incrementally
}
```

The user sees the summary build up word by word instead of waiting for the whole thing.

## Configuration Options

### `type`
Controls what kind of summary you get:

| Value | Output |
|-------|--------|
| `tl;dr` | One sentence |
| `teaser` | Engaging hook paragraph |
| `key-points` | Bullet list of main ideas |
| `headline` | Single headline |

### `length`
`short`, `medium`, or `long` — relative to the input size.

### `format`
`plain-text` or `markdown`. Use `markdown` if you're going to render it.

### `sharedContext`
A prompt that sets the tone and audience:

```js
const summarizer = await Summarizer.create({
  sharedContext: 'A technical blog post for frontend developers. Keep the tone informal but precise.',
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
  expectedOutputLanguage: 'en',
})
```

## Checking Availability Before Use

The model may need to download on first use. Always check before creating a session:

```js
const options = {
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
  expectedOutputLanguage: 'en',
}

const availability = await Summarizer.availability(options)

if (availability === 'unavailable') {
  // API not supported or disabled
  return
}

if (availability === 'downloadable') {
  // Model needs to download — can still create, but there'll be a delay
  // Optionally show a "downloading model..." UI
}

const summarizer = await Summarizer.create(options)
```

## Real Implementation: This Site

Here's a condensed version of the 🤖 button on this page:

```js
if ('Summarizer' in self) {
  // Show the button — API is available
  button.hidden = false

  button.addEventListener('click', async () => {
    modal.classList.add('show')
    content.innerHTML = '<p>Generating summary...</p>'

    try {
      const options = {
        sharedContext: 'A frontend development article. Informal but technical tone.',
        type: 'key-points',
        format: 'markdown',
        length: 'medium',
        expectedInputLanguages: ['en'],
        expectedOutputLanguage: 'en',
      }

      const availability = await Summarizer.availability(options)
      if (availability === 'unavailable') {
        content.innerHTML = '<p>Not available in this browser.</p>'
        return
      }

      const { marked } = await import('https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js')
      const summarizer = await Summarizer.create(options)
      const stream = summarizer.summarizeStreaming(document.getElementById('content').innerText)

      let result = ''
      for await (const chunk of stream) {
        result += chunk
        content.innerHTML = marked.parse(result)
      }
    } catch (err) {
      content.innerHTML = '<p>Something went wrong.</p>'
      console.error(err)
    }
  })
}
```

A few things worth noting:
- `marked` is lazy-loaded only when the user clicks — no impact on initial page load
- The `define:vars` Astro script trick: `'Summarizer' in self` keeps it out of the module graph since TypeScript doesn't know about this API yet
- Pass `options` to `Summarizer.availability(options)` — the API needs them to check model compatibility for your specific configuration

## How to Enable It

The API is behind a flag in Chrome 131+:

1. Open `chrome://flags`
2. Search for **Summarization API for Gemini Nano**
3. Set to **Enabled**
4. Relaunch Chrome

Chrome will then download the Gemini Nano model in the background (a few hundred MB, one-time).

## Why This Matters

On-device AI flips the usual tradeoffs:

| | Cloud API | Built-in AI |
|--|-----------|-------------|
| **Cost** | Per token | Free |
| **Latency** | Network round-trip | Near instant |
| **Privacy** | Data leaves device | Stays on device |
| **Offline** | ❌ | ✅ |
| **Availability** | Any browser | Chrome only (for now) |

For features like summarizing private documents, offline note-taking apps, or adding AI to tools where sending data to a server isn't acceptable, on-device is the only viable option.

## What's Coming

The Summarizer is just the first. Chrome's built-in AI roadmap includes:

- **Translator API** — translate text between languages on-device
- **Language Detector API** — identify what language a string is written in
- **Writer / Rewriter API** — generate and rephrase text
- **Prompt API** — a general-purpose interface to Gemini Nano

These are all experimental today, but the direction is clear: the browser is becoming a first-class AI runtime, and the APIs are being designed with web standards in mind from the start.

## Progressive Enhancement Pattern

Since this is Chrome-only for now, always treat it as an enhancement:

```js
async function addSummaryFeature() {
  if (!('Summarizer' in self)) return // graceful no-op

  const availability = await Summarizer.availability({ expectedOutputLanguage: 'en' })
  if (availability === 'unavailable') return

  // Safe to proceed — show AI feature
}
```

Users on Firefox, Safari, or older Chrome get the normal experience. Users on Chrome with the feature available get the enhanced one. No broken states.

## Key Takeaways

1. **Zero cost, zero latency** — the model runs on the user's GPU
2. **Pass options to `availability()`** — required for the API to check model compatibility
3. **Stream for better UX** — `summarizeStreaming()` + `for await...of`
4. **Lazy-load dependencies** — don't bundle markdown renderers on initial load
5. **Progressive enhancement** — `'Summarizer' in self` before anything else
6. **More APIs are coming** — Translator, Writer, Prompt API are all in the pipeline

The web platform is getting smarter. This is worth watching.
