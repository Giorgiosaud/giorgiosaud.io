---
draft: true
title: "Implementing llms.txt: Make Your Site AI-Friendly"
description: "Learn the llms.txt standard for providing structured content to AI crawlers. Implement llms.txt and per-page .md endpoints for LLM-optimized content access."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
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

## llms.txt: The New Standard for AI Crawlers

As LLMs become integrated into search and development workflows, there's a need for sites to provide machine-readable content summaries. The `llms.txt` standard (similar to `robots.txt`) gives AI systems a structured way to understand your site.

## What is llms.txt?

A plain text file at `/llms.txt` that provides:
1. Site description and purpose
2. List of important pages with summaries
3. Links to markdown versions of content

Think of it as a sitemap optimized for AI comprehension rather than search engine crawling.

## Basic Structure

```text
# Site Name

> Brief description of what this site is about.

## Section Name
- [Page Title](/path/to/page.md): Brief description
- [Another Page](/another/page.md): Description

## Another Section
- [Resource](/resource.md): What this resource covers
```

## Implementation in Astro

### 1. Create llms.txt Endpoint

```typescript
// src/pages/llms.txt.ts
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

export const GET: APIRoute = async () => {
  const notes = await getCollection('notes')
  const sorted = notes
    .filter(n => !n.data.draft)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())

  const content = `# My Developer Blog

> Technical notes on web development, JavaScript, and modern frameworks.

## Recent Notes
${sorted.slice(0, 20).map(n =>
  `- [${n.data.title}](/notebook/${n.id}.md): ${n.data.description || ''}`
).join('\n')}

## Categories
- [Architecture](/notebook/categories/architecture.md): System design and patterns
- [Frontend](/notebook/categories/frontend.md): CSS, JavaScript, frameworks
- [Astro](/notebook/categories/astro.md): Astro framework guides
`

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
```

### 2. Create Per-Page Markdown Endpoints

For each content page, provide a `.md` version:

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
  const { Content } = await note.render()

  // Create markdown representation
  const markdown = `# ${note.data.title}

> ${note.data.description}

Published: ${note.data.publishDate.toISOString().split('T')[0]}
Category: ${note.data.category}
Tags: ${note.data.tags?.join(', ') || 'none'}

---

${note.body}
`

  return new Response(markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
  })
}
```

### 3. Multilingual Support

For multilingual sites, create language-specific llms.txt:

```typescript
// src/pages/es/llms.txt.ts
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

export const GET: APIRoute = async () => {
  const notas = await getCollection('notas') // Spanish collection
  const sorted = notas
    .filter(n => !n.data.draft)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())

  const content = `# Mi Blog de Desarrollo

> Notas técnicas sobre desarrollo web, JavaScript y frameworks modernos.

## Notas Recientes
${sorted.slice(0, 20).map(n =>
  `- [${n.data.title}](/es/notebook/${n.id}.md): ${n.data.description || ''}`
).join('\n')}
`

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
```

## Dynamic vs Static Generation

### Static (Prerendered)

For build-time generation:

```typescript
// src/pages/llms.txt.ts
export const prerender = true

export const GET: APIRoute = async () => {
  // Content generated at build time
}
```

### Dynamic (Server-Side)

For always-fresh content:

```typescript
// src/pages/llms.txt.ts
export const prerender = false

export const GET: APIRoute = async () => {
  // Content generated on each request
}
```

## Best Practices

### 1. Keep It Concise

```text
# Good
- [CSS Grid Guide](/css-grid.md): Complete guide to CSS Grid layout

# Bad (too verbose)
- [CSS Grid Guide](/css-grid.md): This comprehensive guide covers everything you need to know about CSS Grid including rows, columns, areas, alignment, and responsive patterns with practical examples and best practices for modern web development
```

### 2. Logical Grouping

```text
## Tutorials
- [Getting Started](/tutorials/start.md): First steps with the framework
- [Advanced Patterns](/tutorials/advanced.md): Complex use cases

## Reference
- [API Reference](/reference/api.md): Complete API documentation
- [Configuration](/reference/config.md): All configuration options
```

### 3. Include Metadata in Markdown Endpoints

```typescript
const markdown = `---
title: ${note.data.title}
description: ${note.data.description}
date: ${note.data.publishDate.toISOString()}
author: ${note.data.author}
---

${note.body}
`
```

## Linking from HTML Pages

Add a link in your HTML head for discoverability:

```html
<head>
  <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM Content Index">
  <link rel="alternate" type="text/markdown" href="/notebook/current-page.md" title="Markdown Version">
</head>
```

## Testing Your Implementation

```bash
# Check llms.txt
curl -s https://yoursite.com/llms.txt

# Check markdown endpoint
curl -s https://yoursite.com/notebook/my-post.md

# Validate structure
curl -s https://yoursite.com/llms.txt | head -20
```

## Integration with AI Tools

### Claude/ChatGPT

When users share your URLs with AI assistants, the AI can:
1. Fetch `/llms.txt` for site overview
2. Navigate to specific `.md` endpoints
3. Get clean, parseable content

### Development Assistants

Tools like Cursor, GitHub Copilot, and Claude Code can use llms.txt to understand project documentation structure.

## Real Implementation Example

From this site:

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

## Key Takeaways

1. **Simple format** - Plain text with markdown-style links
2. **Machine-readable** - Structured for AI parsing
3. **Per-page markdown** - Provide `.md` versions of pages
4. **Multilingual** - Create language-specific files
5. **Keep updated** - Generate dynamically or rebuild on content changes

The llms.txt standard is emerging as a way to make websites more accessible to AI systems. Implementing it now ensures your content is ready for the AI-integrated web.
