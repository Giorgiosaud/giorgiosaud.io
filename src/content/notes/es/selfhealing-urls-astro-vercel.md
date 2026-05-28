---
draft: false
slug: selfhealing-urls-astro-vercel
title: "URLs Auto-Sanadas en Astro + Vercel: Implementación, Gotchas y el Enfoque Correcto"
description: "Cómo implementar URLs auto-sanadas en Astro desplegado en Vercel — qué funciona, qué falla silenciosamente, y la arquitectura correcta después de tropezar con cada gotcha."
publishDate: 2026-05-27
cover: ../../../assets/images/selfhealing-urls-astro-vercel.png
coverAlt: URLs Auto-Sanadas en Astro y Vercel — URL rota redirigida por middleware al slug correcto
selfHealing: slfhln
lang: es
category: Development
author: giorgio-saud
collections:
  - astro
  - frontend
tags:
  - astro
  - vercel
  - routing
  - middleware
  - "2026"
---

Una URL auto-sanada es un código corto incrustado en una URL que permite al servidor redirigir al destino correcto incluso si el resto de la URL es incorrecto o está desactualizado. Este post documenta el camino de implementación real — incluyendo cada enfoque que falló — en un sitio Astro desplegado en Vercel.

## Qué Resuelven las URLs Auto-Sanadas

Cuando un post del blog es renombrado (y por tanto su slug cambia), cualquier enlace existente a la URL antigua se rompe. Los códigos auto-sanados evitan esto: se asigna un código de 6 caracteres solo consonantes a cada post y se incrusta en la URL. Incluso si el slug es incorrecto o está ausente, el código identifica a dónde enviar al usuario.

**Ejemplos:**
- `/notebook/bttrth` → redirige a `/notebook/better-auth-drizzle-neon-astro`
- `/notebook/better-auth-drizzle-neon-astro-bttrth` → mismo destino
- `/notebook/old-post-title-bttrth` → mismo destino, incluso con slug desactualizado

---

## El Formato del Código

Un código auto-sanado tiene 6 caracteres con solo consonantes (sin vocales, sin dígitos, sin guiones). Esto los hace legibles, sin ambigüedad, y poco probable que coincidan con palabras reales.

Conjunto de caracteres válidos: `b c d f g h j k l m n p q r s t v w x y z`

Genera uno desde el título del post:

```bash
bun run generate:selfheal "Better Auth Drizzle Neon Astro"
# → bttrth
```

El código va en el frontmatter de cada nota:

```yaml
---
title: "Better Auth con Drizzle, Neon y Astro"
selfHealing: bttrth
---
```

---

## Arquitectura: Tres Casos a Manejar

| Patrón de URL | Ejemplo | Handler |
|---------------|---------|---------|
| Código puro (standalone) | `/notebook/bttrth` | Página estática pre-renderizada |
| Código incrustado (al final del slug) | `/notebook/any-slug-bttrth` | Middleware + routing de Vercel |
| Código incrustado (en el medio del slug) | `/notebook/any-bttrth-slug` | Middleware (regex) |

---

## Caso 1: URLs de Código Puro — Páginas Estáticas Pre-renderizadas

El caso más simple: la URL contiene solo el código selfheal como slug.

**Archivo:** `src/pages/notebook/[selfheal].astro`

```astro
---
import { getCollection } from 'astro:content'

export const prerender = true

export async function getStaticPaths() {
  const notes = await getCollection('notes')
  return notes
    .filter(note => note.data.selfHealing)
    .map(note => ({
      params: { selfheal: note.data.selfHealing },
      props: { noteId: note.id.replace(/\.(md|mdx)$/, '') },
    }))
}

const { noteId } = Astro.props
return Astro.redirect(`/notebook/${noteId}`, 301)
---
```

Esto genera un archivo HTML estático para cada código en tiempo de build, por ejemplo `dist/client/notebook/bttrth/index.html`. Vercel lo sirve instantáneamente desde el CDN — sin invocar ninguna función.

**Gotcha:** `note.id` en el Content Layer de Astro 5 incluye la extensión del archivo (`.md` o `.mdx`). Elimínala antes de usarla como segmento de URL.

**Gotcha:** `getCollection()` es solo de tiempo de build en Astro 5. NO lo uses dentro de una función serverless o middleware — lanza un error porque la base de datos SQLite de contenido no existe en runtime.

---

## Caso 2: URLs con Código Incrustado — Middleware

Para URLs como `/notebook/better-auth-drizzle-neon-astro-bttrth` no existe un archivo estático. Estas pasan por el middleware de Astro.

### Construyendo el Mapa de Códigos

El middleware necesita una tabla de lookup: código → URL destino. El enfoque naive es `import.meta.glob` sobre los archivos markdown:

```typescript
// ❌ Este enfoque falla en el bundle SSR de Vercel
const mods = import.meta.glob('./content/notes/en/**/*.md', { eager: true })
```

**Por qué falla en Vercel:** El `import.meta.glob` de Vite funciona en tiempo de build. En el bundle serverless de Vercel, el resultado del glob está vacío porque los archivos markdown no se incluyen en la salida de la función.

La variante `?raw` tiene el mismo problema:

```typescript
// ❌ También falla en el bundle SSR de Vercel
const mods = import.meta.glob('./content/notes/en/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})
```

### El Enfoque Correcto: JSON Pre-generado

Genera un archivo JSON estático antes de que corra `astro build`, luego impórtalo como módulo plano — los imports JSON son manejados nativamente por Node.js/esbuild y siempre se empaquetan correctamente.

**`scripts/generateSelfHealMap.ts`:**

```typescript
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory()) {
      files.push(...await getMarkdownFiles(join(dir, entry.name)))
    } else if (entry.name.match(/\.(md|mdx)$/)) {
      files.push(join(dir, entry.name))
    }
  }
  return files
}

function extractSelfHealing(raw: string): string | undefined {
  return raw.match(/^selfHealing:\s*["']?([^"'\s]+)["']?/m)?.[1]
}

const map: Record<string, string> = {}

const enDir = join(root, 'src/content/notes/en')
const esDir = join(root, 'src/content/notes/es')

for (const filePath of await getMarkdownFiles(enDir)) {
  const code = extractSelfHealing(await readFile(filePath, 'utf-8'))
  if (code) {
    const slug = filePath.replace(enDir + '/', '').replace(/\.(md|mdx)$/, '')
    map[code] = `/notebook/${slug}`
  }
}

for (const filePath of await getMarkdownFiles(esDir)) {
  const code = extractSelfHealing(await readFile(filePath, 'utf-8'))
  if (code) {
    const slug = filePath.replace(esDir + '/', '').replace(/\.(md|mdx)$/, '')
    map[`es:${code}`] = `/es/cuaderno/${slug}`
  }
}

await mkdir(join(root, 'src/generated'), { recursive: true })
await writeFile(join(root, 'src/generated/selfheal-map.json'), JSON.stringify(map, null, 2))
console.log(`[selfheal-map] wrote ${Object.keys(map).length} entries`)
```

Córrelo antes de `astro build` en `package.json`:

```json
{
  "scripts": {
    "build": "bun scripts/generateSelfHealMap.ts && astro build && ..."
  }
}
```

Commitea `src/generated/selfheal-map.json` al repositorio — esto asegura que Vercel siempre tenga el archivo incluso si el paso de pre-build fallara.

### El Middleware

```typescript
// src/middleware.ts
import { defineMiddleware, sequence } from 'astro:middleware'
import selfhealMapData from './generated/selfheal-map.json'

const selfHealMap = new Map<string, string>(Object.entries(selfhealMapData))

// Coincide 6 consonantes minúsculas precedidas por inicio-o-guion, seguidas por guion-o-fin
const selfHealRegex = /(?:^|-)[b-df-hj-np-tv-z]{6}(?:-|$)/g

const selfhealMiddleware = defineMiddleware((context, next) => {
  const { pathname } = context.url
  const isEs = pathname.startsWith('/es/cuaderno/')
  const isEn = pathname.startsWith('/notebook/')
  if (!isEn && !isEs) return next()

  const segment = isEs
    ? pathname.replace('/es/cuaderno/', '')
    : pathname.replace('/notebook/', '')

  const match = segment.match(selfHealRegex)
  if (!match) return next()

  const code = match[0].replace(/-/g, '')
  const key = isEs ? `es:${code}` : code
  const destination = selfHealMap.get(key)
  if (destination) return context.redirect(destination, 301)

  return next()
})

export const onRequest = sequence(selfhealMiddleware, /* ...otros middleware */)
```

---

## Gotcha de Routing en Vercel — El Override de `status: 404`

Este es el gotcha más grande. Incluso con el middleware correctamente identificado y retornando un `301`, la redirección no llegará al navegador para rutas desconocidas.

**Por qué:** El adaptador de Vercel de Astro genera una ruta catch-all al final de `.vercel/output/config.json`:

```json
{ "src": "^/.*$", "dest": "_render", "status": 404 }
```

Según la Build Output API v3 de Vercel: cuando `status` está presente en una ruta, anula el status de la respuesta de la función. Un `301` retornado por el middleware se convierte en un `404` en el navegador.

Esto afecta a cualquier URL que:
- No tenga un archivo estático en el CDN
- No coincida con una ruta explícita `_render` generada por el adaptador

Las URLs selfheal incrustadas (`/notebook/slug-bttrth`) no tienen archivo estático, entonces llegan al catch-all.

### La Solución: Parchear el Config de Salida

Agrega un script post-build que inserta rutas explícitas para el patrón de URL con código incrustado **antes** del catch-all con `status: 404`:

**`scripts/patchVercelRoutes.ts`:**

```typescript
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const configPath = join(root, '.vercel/output/config.json')

const config = JSON.parse(await readFile(configPath, 'utf-8'))

const selfhealRoutes = [
  { src: '^/notebook/[^/]+-[b-df-hj-np-tv-z]{6}/?$', dest: '_render' },
  { src: '^/es/cuaderno/[^/]+-[b-df-hj-np-tv-z]{6}/?$', dest: '_render' },
]

const catchAllIndex = config.routes.findIndex(
  (r: { src?: string; status?: number }) =>
    r.status === 404 && r.src?.includes('.*'),
)

if (catchAllIndex === -1) {
  config.routes.push(...selfhealRoutes)
} else {
  config.routes.splice(catchAllIndex, 0, ...selfhealRoutes)
}

await writeFile(configPath, JSON.stringify(config, null, 2))
```

Actualiza `package.json`:

```json
{
  "scripts": {
    "build": "bun scripts/generateSelfHealMap.ts && astro build && bun scripts/patchVercelRoutes.ts && ..."
  }
}
```

Ahora las solicitudes a `/notebook/old-slug-bttrth`:
1. Fallan la verificación del filesystem (no hay archivo estático)
2. Coinciden con la nueva ruta explícita (`/notebook/*-[consonantes]{6}`)
3. Llegan a `_render` **sin** `status: 404`
4. El middleware redirige a la URL correcta con 301 real

**¿Por qué no usar rutas en `vercel.json`?** El adaptador de Vercel de Astro no lee la clave `routes` de `vercel.json` — solo lee `trailingSlash`. Los `redirects` en la config de Astro se convierten en rutas vía `getRedirects()`, pero solo admiten mapeo de destinos estáticos, no lookup en runtime.

---

## Resumen: Qué No Hacer

| Enfoque | Por Qué Falla |
|---------|---------------|
| `import.meta.glob` sobre archivos `.md` en middleware | Vacío en el bundle SSR de Vercel |
| `import.meta.glob` con `?raw` en middleware | Mismo problema de bundle |
| `getCollection()` en middleware o serverless | La base de datos de contenido es solo de build time en Astro 5 |
| Rutas en `vercel.json` | No las lee el adaptador de Vercel de Astro |
| Confiar en el catch-all para llegar al middleware | `status: 404` anula la respuesta de redirección |

---

## Diagrama de Arquitectura Final

```
Build time:
  generateSelfHealMap.ts → src/generated/selfheal-map.json
  astro build            → páginas estáticas, bundle serverless (importa JSON)
  patchVercelRoutes.ts   → .vercel/output/config.json (agrega rutas explícitas)

Runtime — URL de código puro (/notebook/bttrth):
  CDN Vercel → handle:filesystem → HTML estático (instantáneo, sin función)

Runtime — URL con código incrustado (/notebook/slug-bttrth):
  CDN Vercel → handle:filesystem (miss) → ruta explícita → _render (sin override 404)
  → Middleware Astro → selfhealMiddleware → context.redirect(301)
```
