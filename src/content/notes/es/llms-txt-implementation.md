---
draft: true
slug: implementacion-llms-txt
title: "Implementando llms.txt: Haz Tu Sitio Amigable para IA"
description: "Aprende el estándar llms.txt para proporcionar contenido estructurado a crawlers de IA. Implementa llms.txt y endpoints .md por página para acceso de contenido optimizado para LLMs."
publishDate: 2026-01-02
cover: ../../../assets/images/llms-txt-implementation.png
coverAlt: Implementación LLMs.txt
selfHealing: llmstx
lang: es
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

`llms.txt` es básicamente `robots.txt` pero para modelos de lenguaje. Es un archivo de texto plano en la raíz del sitio que le dice a los crawlers de IA qué hay acá y dónde encontrarlo.

Lo agregué a este sitio porque cada vez más gente llega a contenido técnico a través de asistentes de IA, y si el contenido no está estructurado para que un LLM lo entienda, simplemente se pierde.

## El endpoint en Astro

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

> Notebook de desarrollador web con notas sobre Astro, JavaScript, TypeScript y desarrollo web moderno.

## Notas
${sorted.map(n => `- [${n.data.title}](/notebook/${n.id}.md): ${n.data.description || ''}`).join('\n')}
`
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
```

Genera el archivo dinámicamente en cada request — así siempre está actualizado sin necesidad de rebuild manual.

## El tag para descubrimiento

En el `<head>` de cada página:

```html
<head>
  <link rel="alternate" type="text/plain" href="/llms.txt" title="Índice de Contenido LLM">
  <link rel="alternate" type="text/markdown" href="/notebook/pagina-actual.md" title="Versión Markdown">
</head>
```

Esto le da a los crawlers y asistentes de IA una forma de descubrir el archivo sin tener que adivinar la URL.

La idea es simple: si alguien le pasa una URL de este sitio a Claude o ChatGPT, el asistente puede ir a `/llms.txt`, ver el índice completo, y navegar al endpoint `.md` de la nota específica para leer el contenido limpio. Sin HTML, sin ruido.

Eso es todo por ahora.
