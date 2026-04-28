---
draft: false
title: "Por qué vi.stubEnv no funciona con import.meta.env.DEV"
description: "vi.stubEnv('DEV', 'false') asigna un string. El DEV de Vite es un boolean. El string 'false' es truthy. Tus tests te mienten en silencio. Acá está el fix."
publishDate: 2026-04-28
cover: ../../../assets/images/home-notebook.webp
coverAlt: Test de Vitest fallando por el problema con DEV env var
selfHealing: mprtmt
category: testing
author: giorgio-saud
collections:
  - frontend
tags:
  - vitest
  - vite
  - astro
  - testing
  - typescript
  - "2026"
---

Este me costó una sesión de debugging. Post corto, pero vale la pena escribirlo.

## El Problema

Tenés código que ramifica según `import.meta.env.DEV`:

```typescript
export function isDraftInDevMode(data: { draft?: boolean }): boolean {
  return import.meta.env.DEV && data.draft === true
}
```

Querés testear ambas ramas, así que usás `vi.stubEnv`:

```typescript
it('retorna false en producción', () => {
  vi.stubEnv('DEV', 'false')  // ← parece correcto
  expect(isDraftInDevMode({ draft: true })).toBe(false)
})
```

El test pasa en CI. Pasa en local. Pero la aserción es una mentira — la función en realidad está retornando `true`.

## Por Qué

`vi.stubEnv` funciona seteando valores en `process.env` (y en `import.meta.env` para el surface de env de Vite). Los valores son siempre **strings** — ese es el contrato de las variables de entorno.

El flag `DEV` de Vite es especial. En build time, Vite reemplaza `import.meta.env.DEV` con el literal booleano `true` o `false`. Pero en **test time** en Vitest, ese reemplazo no ocurre — `import.meta.env` es un objeto mutable y `DEV` se mantiene como sea que fue inicializado.

Entonces cuando llamás `vi.stubEnv('DEV', 'false')`, estás seteando `import.meta.env.DEV` al string `'false'`. Y el string `'false'` es truthy en JavaScript. Tu rama de modo producción nunca se ejecuta de verdad.

```typescript
vi.stubEnv('DEV', 'false')
console.log(typeof import.meta.env.DEV)  // "string"
console.log(!!import.meta.env.DEV)       // true — 'false' es truthy!
```

## El Fix

Saltate `vi.stubEnv` para los flags de entorno booleanos y asigná directamente:

```typescript
import.meta.env.DEV = false  // modo producción
import.meta.env.DEV = true   // modo dev
```

En el entorno de tests de Vitest, `import.meta.env` es un objeto mutable plano. La asignación directa funciona exactamente como esperás:

```typescript
it('retorna false en producción', () => {
  import.meta.env.DEV = false
  expect(isDraftInDevMode({ draft: true })).toBe(false)  // realmente false ahora
})

it('retorna true en dev con draft=true', () => {
  import.meta.env.DEV = true
  expect(isDraftInDevMode({ draft: true })).toBe(true)
})
```

## Cleanup

Si estás seteando `import.meta.env.DEV` en múltiples tests, resetealo en `afterEach` para que los tests no se contaminen entre sí:

```typescript
const originalDEV = import.meta.env.DEV

afterEach(() => {
  import.meta.env.DEV = originalDEV
})
```

O si todo tu bloque describe testea comportamiento en producción, setealo una vez en `beforeAll`:

```typescript
describe('modo producción', () => {
  beforeAll(() => { import.meta.env.DEV = false })
  afterAll(() => { import.meta.env.DEV = true })

  it('filtra drafts', () => { /* ... */ })
  it('filtra fechas futuras', () => { /* ... */ })
})
```

## Cuándo Usar `vi.stubEnv`

`vi.stubEnv` es correcto para env vars de tipo string — `RESEND_API_KEY`, `POSTGRES_URL`, cualquier cosa que venga de archivos `.env`. Esas siempre son strings y `vi.stubEnv` maneja limpiamente el ciclo de vida de restore-on-cleanup.

El problema ocurre solo con `DEV`, `PROD`, `SSR` y `MODE` — los flags específicos de Vite que son booleans/strings que se reemplazan estáticamente en build time pero quedan como objetos mutables en los tests.
