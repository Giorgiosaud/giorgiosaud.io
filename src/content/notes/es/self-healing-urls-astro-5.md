---
draft: true
slug: urls-auto-reparables-astro-5
title: "URLs Auto-Reparables en Astro 5: Actualización de Content Collections"
description: "Implementación actualizada de URLs auto-reparables para la nueva API de content collections de Astro 5. Aprende los cambios de getCollection a glob loaders y curación de URLs type-safe."
publishDate: 2026-01-02
cover: ../../../assets/images/selfhealing_url_lygv2g.webp
coverAlt: Self-Healing URLs Astro 5
selfHealing: slfhln
lang: es
category: Architecture
author: giorgio-saud
collections:
  - astro
  - architecture
tags:
  - astro
  - urls
  - seo
  - "2026"
---

## URLs Auto-Reparables: Actualizadas para Astro 5

Las URLs auto-reparables aseguran que los enlaces compartidos permanezcan funcionales incluso cuando el slug cambia. Como el patrón `titulo-articulo-abc123` de Medium, un identificador único permite redirección a la URL actual sin importar cómo esté malformada la ruta.

Astro 5 introdujo cambios significativos en content collections. Aquí está cómo implementar URLs auto-reparables con la nueva API.

## Qué Cambió en Astro 5

### API Anterior (Astro 4)

```typescript
import { getCollection } from 'astro:content'

const notes = await getCollection('notes')
// notes[0].slug se generaba automáticamente del nombre de archivo
```

### Nueva API (Astro 5)

```typescript
import { getCollection } from 'astro:content'

const notes = await getCollection('notes')
// notes[0].id es ahora el identificador
// El slug debe definirse explícitamente en frontmatter o derivarse del id
```

Cambios clave:
1. `slug` ya no se genera automáticamente - usa `id` o `slug` explícito en frontmatter
2. Las colecciones usan `glob` loader con configuración explícita
3. Las referencias funcionan diferente con el nuevo sistema de esquemas

## Implementando Códigos Auto-Reparables

### 1. Definición del Esquema

```typescript
// src/content/schemas/noteSchema.ts
import { z } from 'astro:content'

export const noteSchema = z.object({
  draft: z.boolean(),
  title: z.string(),
  description: z.string(),
  publishDate: z.date(),
  // Código auto-reparable: 6 caracteres, sin vocales
  selfHealing: z.string().regex(/^[^aeiouAEIOU-]{6}$/).length(6),
  // ... otros campos
})
```

### 2. Configuración de Colección

```typescript
// src/content/notes/config.ts
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { noteSchema } from '../schemas/noteSchema'

export const notes = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.md',
    base: './src/content/notes/en',
  }),
  schema: noteSchema,
})
```

### 3. Generar Códigos Auto-Reparables

Crea una herramienta CLI para generación consistente de códigos:

```typescript
// scripts/generateSelfHealingCode.ts
function generateCode(title: string): string {
  // Remover vocales y caracteres especiales
  const consonants = title
    .toLowerCase()
    .replace(/[aeiou\s\-\_\.\,\!\?\:\;]/g, '')
    .slice(0, 6)
    .padEnd(6, 'x')

  return consonants
}

function validateCode(code: string): boolean {
  return /^[^aeiouAEIOU-]{6}$/.test(code) && code.length === 6
}

// Uso
const title = process.argv[2]
const code = generateCode(title)
console.log(`selfHealing: "${code}"`)
```

### 4. Manejador de Ruta Auto-Reparable

```astro
---
// src/pages/notebook/[selfheal].astro
import { getCollection } from 'astro:content'

export const prerender = false

const path = Astro.url.pathname

// Extraer código auto-reparable potencial (6 consonantes al final)
const codeMatch = path.match(/([^aeiouAEIOU\-\/]{6})(?:\/)?$/)

if (!codeMatch) {
  return Astro.redirect('/404')
}

const code = codeMatch[1]

// Encontrar nota con código selfHealing coincidente
const notes = await getCollection('notes', (entry) => {
  return entry.data.selfHealing === code
})

if (notes.length > 0) {
  const note = notes[0]
  // En Astro 5, usar id o slug explícito
  const slug = note.data.slug || note.id.replace(/\.md$/, '')
  return Astro.redirect(`/notebook/${slug}`)
}

return Astro.redirect('/404')
---
```

### 5. Funciones Auxiliares

```typescript
// src/helpers/selfHeal.ts
import { getCollection } from 'astro:content'

export async function findNoteByHealingCode(code: string) {
  const notes = await getCollection('notes', (entry) => {
    return entry.data.selfHealing === code
  })
  return notes[0] || null
}

export function extractHealingCode(path: string): string | null {
  const match = path.match(/([^aeiouAEIOU\-\/]{6})(?:\/)?$/)
  return match ? match[1] : null
}

export function buildSharableUrl(baseUrl: string, slug: string, code: string): string {
  // Incluir código de curación para compartir resiliente
  return `${baseUrl}/notebook/${slug}-${code}`
}
```

## Usando URLs Auto-Reparables

### En Templates

```astro
---
import { buildSharableUrl } from '@helpers/selfHeal'

const { note } = Astro.props
const shareUrl = buildSharableUrl(
  Astro.site.origin,
  note.id,
  note.data.selfHealing
)
---

<a href={shareUrl} class="share-link">
  Compartir este artículo
</a>
```

### Meta Tags para Redes Sociales

```astro
---
const canonicalUrl = `${Astro.site}notebook/${note.id}`
const shareUrl = `${Astro.site}notebook/${note.id}-${note.data.selfHealing}`
---

<head>
  <link rel="canonical" href={canonicalUrl} />
  <!-- Usar URL de curación para compartir -->
  <meta property="og:url" content={shareUrl} />
</head>
```

## Implementación Type-Safe

### Con TypeScript

```typescript
// src/types/content.ts
import type { CollectionEntry } from 'astro:content'

type NoteEntry = CollectionEntry<'notes'>

export function getNoteUrl(note: NoteEntry): string {
  const slug = note.data.slug || note.id.replace(/\.md$/, '')
  return `/notebook/${slug}`
}

export function getShareableUrl(note: NoteEntry): string {
  const slug = note.data.slug || note.id.replace(/\.md$/, '')
  return `/notebook/${slug}-${note.data.selfHealing}`
}
```

## Migración desde Astro 4

### Antes (Astro 4)

```typescript
const notes = await getCollection('notes')
const redirect = `/notebook/${note.slug}`
```

### Después (Astro 5)

```typescript
const notes = await getCollection('notes')
// Usar id o slug explícito del frontmatter
const slug = note.data.slug || note.id.replace(/\.md$/, '')
const redirect = `/notebook/${slug}`
```

## Consideraciones SEO

### URLs Canónicas

Siempre establece canonical a la URL "limpia":

```astro
<link rel="canonical" href={`${Astro.site}notebook/${slug}`} />
```

### Sitemap

Incluye solo URLs canónicas en el sitemap:

```typescript
// astro.config.mjs
export default defineConfig({
  integrations: [
    sitemap({
      filter: (page) => !page.includes('-') || page.split('-').pop().length !== 6
    })
  ]
})
```

## Probando Auto-Reparación

```typescript
// tests/selfHealing.test.ts
import { describe, it, expect } from 'vitest'
import { extractHealingCode, findNoteByHealingCode } from '@helpers/selfHeal'

describe('URLs Auto-Reparables', () => {
  it('extrae código de URL', () => {
    expect(extractHealingCode('/notebook/mi-post-brwsrn')).toBe('brwsrn')
    expect(extractHealingCode('/notebook/brwsrn')).toBe('brwsrn')
  })

  it('rechaza códigos inválidos', () => {
    expect(extractHealingCode('/notebook/post-abc')).toBe(null) // muy corto
    expect(extractHealingCode('/notebook/aeiou')).toBe(null) // vocales
  })
})
```

## Puntos Clave

1. **Astro 5 usa `id`** - No `slug` para identificación de contenido
2. **Slugs explícitos** - Definir en frontmatter o derivar de `id`
3. **Glob loader** - Colecciones configuradas con patrón `glob()`
4. **Validación de código** - 6 consonantes, validado con regex en esquema
5. **Canonical importa** - Siempre apunta canonical a URL limpia

Las URLs auto-reparables protegen contra enlaces rotos y mejoran la resiliencia de enlaces compartidos. Con los cambios de content collections de Astro 5, la implementación es ligeramente diferente pero el concepto sigue siendo poderoso para SEO y experiencia de usuario.
