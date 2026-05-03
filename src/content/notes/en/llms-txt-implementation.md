---
draft: false
title: "Implementing llms.txt: Make Your Site AI-Friendly"
description: "Learn the llms.txt standard for providing structured content to AI crawlers. Implement llms.txt and per-page .md endpoints for LLM-optimized content access."
publishDate: 2026-01-02
cover: ../../../assets/images/llms-txt-implementation.png
coverAlt: LLMs.txt Implementation
selfHealing: llmstx
lang: en
category: Architecture
author: giorgio-saud
collections:
  - ai
  - architecture
tags:
  - llms
  - ai
  - seo
  - astro
---

So you've probably noticed that AI assistants are increasingly used to look things up on the web. The problem is that HTML pages are noisy — navigation, footers, cookie banners, ads — and LLMs have to work harder to extract the actual content.

`llms.txt` is an emerging standard (think `robots.txt` but for AI) that lets you provide a structured index of your site's content in plain text. I added it to giorgiosaud.io and it took about 20 minutes.

## The llms.txt endpoint

```typescript
// src/pages/llms.txt.ts
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

export const GET: APIRoute = async () => {
  const notes = await getCollection('notes')
  const sorted = notes
    .filter(n => !n.data.draft)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())

  const content = `# Giorgiosaud.io

> Web developer notebook with notes on Astro, JavaScript, TypeScript, and modern web development.

## Notes
${sorted.map(n => `- [${n.data.title}](/notebook/${n.id}.md): ${n.data.description || ''}`).join('\n')}
`
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
```

## Per-page markdown endpoints

The `.md` links in `llms.txt` point to clean markdown versions of each post. These let AI tools fetch a single article without parsing HTML:

```typescript
// src/pages/notebook/[slug].md.ts
import type { APIRoute, GetStaticPaths } from 'astro'
import { getCollection } from 'astro:content'

export const getStaticPaths: GetStaticPaths = async () => {
  const notes = await getCollection('notes')
  return notes.map(note => ({
    params: { slug: note.id },
    props: { note }
  }))
}

export const GET: APIRoute = async ({ props }) => {
  const { note } = props

  const markdown = `# ${note.data.title}

> ${note.data.description}

Published: ${note.data.publishDate.toISOString().split('T')[0]}

---

${note.body}
`
  return new Response(markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
  })
}
```

## Linking from your HTML

Add this to your `<head>` so crawlers can discover it:

```html
<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM Content Index">
```

That's really all there is to it. The format is simple, the implementation is two files, and it makes the content on this site much easier for AI tools to parse and summarize correctly. If you're building a content site, it's worth doing.
