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

Cuando publicás un artículo y alguien lo comparte, ese link puede vivir años. Si después renombrás el post o cambiás el slug, el link se rompe. Medium lo resuelve con un ID al final de la URL — `mi-articulo-abc123` — que siempre apunta al post correcto sin importar cómo cambió el título.

Implementé lo mismo en este sitio con un campo `selfHealing` en cada nota.

## El campo en el schema

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

## La colección con glob loader (Astro 5)

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

## La ruta que hace la redirección

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

## El CLI para generar códigos

Para no armar los códigos a mano, usá el script incluido:

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

```bash
bun run generate:selfheal "My Post Title"     # Genera código desde el título
bun run generate:selfheal --validate "rhythm" # Valida un código existente
bun run generate:selfheal --alts "Title"      # Genera alternativas
```

## La diferencia con Astro 4

Esto es lo que cambió entre versiones — lo aprendí de las malas cuando migré:

**Antes (Astro 4):**
```typescript
const notes = await getCollection('notes')
const redirect = `/notebook/${note.slug}`
```

**Después (Astro 5):**
```typescript
const notes = await getCollection('notes')
// Usar id o slug explícito del frontmatter
const slug = note.data.slug || note.id.replace(/\.md$/, '')
const redirect = `/notebook/${slug}`
```

En Astro 5 el `slug` ya no se genera automáticamente. Tenés que definirlo en el frontmatter o derivarlo del `id`. Ojo con eso si venís de Astro 4.

Los links que se comparten desde este sitio incluyen el `selfHealing` code — así sobreviven cualquier renombrado futuro. Vale la pena tenerlo en cuenta desde el arranque.
