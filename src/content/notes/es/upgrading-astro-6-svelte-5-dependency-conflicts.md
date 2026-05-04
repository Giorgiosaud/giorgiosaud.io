---
draft: false
title: "Actualizando a Astro 6, Svelte 5 y Better Auth 1.6: Qué se rompió y cómo lo arreglé"
description: "Relato completo de los problemas al actualizar un sitio Astro en producción: fallos de preprocesamiento TypeScript en Svelte, conflictos de dependencias transitivas en better-auth y problemas con la caché de build en Vercel."
publishDate: 2026-05-04
cover: ../../../assets/images/mock-astro-content-vitest.png
coverAlt: Conflictos de dependencias en la actualización de Astro
selfHealing: ctlznd
lang: es
category: Architecture
author: giorgio-saud
collections:
  - astro
  - architecture
tags:
  - astro
  - svelte
  - better-auth
  - dependencias
  - "2026"
---

Me pasé un domingo actualizando giorgiosaud.io de Astro 5 a Astro 6, `@astrojs/svelte` 7 a 8, y `better-auth` 1.4 a 1.6. El build se rompió de tres maneras distintas. Acá va el post-mortem para que no tengas que redescubrir cada una.

## Problema 1: Async IIFE dentro de `onMount` rompe el preprocesamiento TypeScript de Svelte

Después de actualizar `@astrojs/svelte` a la versión 8.x, el build empezó a fallar con:

```
[vite-plugin-svelte:compile] Unexpected token
```

El error apuntaba a una anotación de tipo como `: boolean` que no había sido eliminada del output compilado — TypeScript crudo llegando al compilador de Svelte.

La causa era una async IIFE con prefijo de punto y coma dentro de `onMount`:

```svelte
<script lang="ts">
onMount(() => {
  ;(async () => {
    pushSupported = isPushSupported()
    // ...
  })()
})
</script>
```

Cuando `vitePreprocess({ script: true })` ejecuta esbuild para eliminar TypeScript de los bloques `<script lang="ts">` de Svelte, el token `(async` genera una ambigüedad en modo TypeScript. Puede interpretarse como el inicio de una expresión de llamada genérica (`async<Type>(...)`), lo que confunde los límites del parser de esbuild. El resultado es que las anotaciones de tipo posteriores en el mismo bloque de script no se eliminan.

**Fix:** reemplazar la IIFE con una función async nombrada.

```svelte
<script lang="ts">
onMount(() => {
  async function initPush() {
    pushSupported = isPushSupported()
    // ...
  }
  initPush()
})
</script>
```

## Problema 2: Casteos `as` de TypeScript en templates de Svelte

Otro error de compilación de Svelte apareció con este patrón en un template:

```svelte
<span class:admin={(user as { role?: string }).role === 'admin'}>
  {(user as { role?: string }).role === 'admin' ? t.admin : t.user}
</span>
```

Los casteos `as` de TypeScript no son válidos en expresiones de template de Svelte — los templates compilan a JavaScript, no TypeScript. El preprocesador solo maneja el bloque `<script>`.

**Fix:** mover la lógica del casteo al bloque script como valor derivado.

```svelte
<script lang="ts">
  const isAdmin = $derived((user as { role?: string })?.role === 'admin')
</script>

<span class:admin={isAdmin}>
  {isAdmin ? t.admin : t.user}
</span>
```

## Problema 3: Conflictos de versiones de dependencias transitivas con better-auth 1.6

`better-auth@1.6.9` incluye copias propias de sus dependencias peer en las versiones con las que fue compilado. Si versiones más antiguas de esos paquetes están hoisted en la raíz de `node_modules`, el build se rompe.

Me encontré con tres conflictos:

| Paquete | Versión hoisted | Versión requerida | Error |
|---|---|---|---|
| `@better-auth/core` | 1.4.10 | 1.6.9 | Missing `./utils/error-codes` specifier |
| `better-call` | 1.1.7 | 1.3.5 | Missing export `kAPIErrorHeaderSymbol` |
| `@peculiar/asn1-schema` | 2.6.0 | 2.7.0 | `Cannot get schema for 'AlgorithmIdentifier'` |

**Fix:** agregar `overrides` (y `resolutions` para compatibilidad con bun) en `package.json`:

```json
{
  "overrides": {
    "@better-auth/core": "1.6.9",
    "better-call": "1.3.5",
    "@peculiar/asn1-schema": "2.7.0"
  },
  "resolutions": {
    "@better-auth/core": "1.6.9",
    "better-call": "1.3.5",
    "@peculiar/asn1-schema": "2.7.0"
  }
}
```

## Problema 4: Conflicto de `estree-walker` rompe la carga de la config de Astro en Vercel

Incluso después de arreglar lo anterior, los builds en Vercel fallaban con:

```
[astro] Unable to load your Astro config
No "exports" main defined in /vercel/path0/node_modules/estree-walker/package.json
```

`estree-walker@3.x` es solo ESM y tiene un campo `exports` correcto. `estree-walker@2.x` no. Algo en el árbol de dependencias estaba instalando `2.0.2` como versión hoisted en el entorno de Vercel.

Localmente el build pasaba porque `3.0.3` ya era la versión hoisted de una instalación previa. Vercel restauró una caché del build anterior a la actualización, por lo que tenía `2.0.2` bloqueado.

**Fix:** agregar `estree-walker` a los overrides y, crucialmente, **limpiar la caché de build de Vercel** antes de redesplegar. Sin limpiar la caché, Vercel restaura los `node_modules` viejos y el override nunca tiene efecto.

```json
{
  "overrides": {
    "estree-walker": "3.0.3"
  },
  "resolutions": {
    "estree-walker": "3.0.3"
  }
}
```

Para limpiar la caché en Vercel: abrí el deployment fallido → **Redeploy** → marcá **"Clear cache and redeploy"**.

## El patrón

Los cuatro problemas comparten la misma raíz: **un paquete que incluye sus propias dependencias en una versión específica queda tapado por una versión más antigua hoisted**. El fix es siempre el mismo — forzar la versión correcta con `overrides`/`resolutions` — pero diagnosticar qué paquete está en conflicto requiere leer el error con atención y cruzarlo con los `node_modules` anidados.

Si después de una actualización mayor de dependencias encontrás errores de `Missing specifier` o `does not provide an export named`, revisá los `node_modules` anidados con:

```bash
find node_modules -name "package.json" -path "*/<paquete>/package.json" | xargs grep '"version"'
```

Comparás versiones: la anidada es la que necesita el paquete, la hoisted es la que está rompiéndolo.
