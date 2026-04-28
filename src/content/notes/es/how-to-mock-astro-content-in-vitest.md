---
draft: false
title: "Cómo mockear astro:content en Vitest"
description: "Hacer unit testing de helpers de content collections en Astro no es obvio. Aquí está el patrón exacto para mockear getCollection y controlar import.meta.env.DEV para que tus tests reflejen el comportamiento real en producción."
publishDate: 2026-04-28
cover: ../../../assets/images/home-notebook.webp
coverAlt: Output de Vitest testeando un helper de content collections en Astro
selfHealing: hwtmck
category: testing
author: giorgio-saud
collections:
  - frontend
  - architecture
tags:
  - astro
  - vitest
  - testing
  - typescript
  - "2026"
---

Si construiste helpers que llaman a `getCollection` de `astro:content`, probablemente notaste que hacer unit testing de ellos no es trivial. El módulo es virtual — no existe en disco — así que Vitest no puede resolverlo como un import normal. Y si tu helper lee `import.meta.env.DEV` para decidir si incluye drafts, tenés un segundo problema encima del primero.

Acá está exactamente cómo lo hice funcionar.

## El Setup

Supongamos que tenés un helper así:

```typescript
// src/helpers/collections.ts
import { getCollection } from 'astro:content'

export async function getPublishedNotes(lang: 'en' | 'es') {
  const name = lang === 'es' ? 'notas' : 'notes'
  const entries = await getCollection(name, ({ data }) => {
    if (import.meta.env.DEV) return true
    return !data.draft && data.publishDate < new Date()
  })
  return entries.sort((a, b) =>
    b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
  )
}
```

Dos dependencias para controlar: `getCollection` y `import.meta.env.DEV`.

## Mockeando `astro:content`

Vitest soporta mockeo de módulos virtuales con `vi.mock`. La clave es que los llamados a `vi.mock` son **hoisted** — se mueven al inicio del archivo antes de cualquier import. Eso es lo que hace que funcione aunque el import del helper aparezca después del mock.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Esto se eleva automáticamente — corre antes del import de abajo
vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}))

import { getCollection } from 'astro:content'
import { getPublishedNotes } from '@helpers/collections'

const mockGetCollection = vi.mocked(getCollection)
```

Listo. `mockGetCollection` es ahora un mock tipado de Vitest que podés controlar por test.

## Controlando el Filter

La parte complicada: `getCollection` recibe una función de filtro como segundo argumento. Tu helper define la lógica de filtrado *dentro* de ese callback — así que si solo hacés `mockResolvedValue([entry])`, el filtro nunca se aplica y cualquier test que verifique el filtrado en producción va a pasar cuando no debería.

Tenés que llamar al filtro explícitamente:

```typescript
it('excluye drafts en producción', async () => {
  import.meta.env.DEV = false
  const draft = { id: 'test', data: { draft: true, publishDate: new Date('2025-01-01') } }

  mockGetCollection.mockImplementation(async (_name, filter) => {
    const pass = (filter as (e: unknown) => boolean)(draft)
    return pass ? [draft] : []
  })

  const result = await getPublishedNotes('en')
  expect(result).toHaveLength(0)
})
```

## El Problema con `import.meta.env.DEV`

Puede que tientes usar `vi.stubEnv('DEV', 'false')` para cambiar el flag de entorno. No lo hagas. `vi.stubEnv` trabaja con strings, pero el `DEV` de Vite es un **boolean** — así que el string `'false'` es truthy y tus tests de modo producción siempre se van a comportar como si `DEV` estuviera activo.

La asignación directa es el enfoque correcto:

```typescript
import.meta.env.DEV = false  // modo producción
import.meta.env.DEV = true   // modo dev
```

Esto funciona en Vitest porque `import.meta.env` es un objeto mutable en tiempo de test — Vite reemplaza los booleans en build time, pero en el test runner de Vitest son simplemente propiedades escribibles.

## Un Ejemplo Completo

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}))

import { getCollection } from 'astro:content'
import { getPublishedNotes } from '@helpers/collections'

const mockGetCollection = vi.mocked(getCollection)

function makeEntry(overrides: { draft?: boolean; publishDate?: Date } = {}) {
  return {
    id: 'test-note',
    data: {
      draft: false,
      publishDate: new Date('2025-01-01'),
      ...overrides,
    },
  }
}

describe('getPublishedNotes', () => {
  beforeEach(() => {
    mockGetCollection.mockReset()
  })

  it('llama a la colección notes para lang=en', async () => {
    mockGetCollection.mockResolvedValue([])
    await getPublishedNotes('en')
    expect(mockGetCollection).toHaveBeenCalledWith('notes', expect.any(Function))
  })

  it('excluye drafts en producción', async () => {
    import.meta.env.DEV = false
    const draft = makeEntry({ draft: true })
    mockGetCollection.mockImplementation(async (_name, filter) => {
      return (filter as (e: unknown) => boolean)(draft) ? [draft] : []
    })
    const result = await getPublishedNotes('en')
    expect(result).toHaveLength(0)
  })

  it('incluye drafts en modo dev', async () => {
    import.meta.env.DEV = true
    const draft = makeEntry({ draft: true })
    mockGetCollection.mockImplementation(async (_name, filter) => {
      return (filter as (e: unknown) => boolean)(draft) ? [draft] : []
    })
    const result = await getPublishedNotes('en')
    expect(result).toHaveLength(1)
  })

  it('ordena por publishDate descendente', async () => {
    const older = makeEntry({ publishDate: new Date('2024-01-01') })
    const newer = makeEntry({ publishDate: new Date('2025-06-01') })
    mockGetCollection.mockResolvedValue([older, newer])
    const result = await getPublishedNotes('en')
    expect(result[0].data.publishDate.valueOf()).toBeGreaterThan(
      result[1].data.publishDate.valueOf()
    )
  })
})
```

## Por Qué `vi.mock` Tiene Que Ir Primero

Si intentás mover el llamado a `vi.mock` debajo de los imports, el módulo ya está cargado y el mock no tiene efecto. Vitest usa Babel o esbuild para elevar físicamente los llamados a `vi.mock` antes de procesar los imports — no es solo orden de ejecución, es una transformación. Es el mismo comportamiento que el `jest.mock` de Jest.

El patrón funciona siempre que `vitest.config.ts` use `getViteConfig` de `astro/config`, que propaga automáticamente la resolución del path alias `@helpers/*`. No necesitás config de alias extra.
