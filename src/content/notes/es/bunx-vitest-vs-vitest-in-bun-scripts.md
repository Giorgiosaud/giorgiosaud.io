---
draft: false
title: "bunx vitest vs vitest en scripts de Bun"
description: "Si bun run test falla con 'vitest: command not found', el fix es una palabra: bunx. Acá está por qué Bun no siempre pone node_modules/.bin en el PATH, y cuándo importa."
publishDate: 2026-04-28
cover: ../../../assets/images/bunx-vitest-vs-vitest.avif
coverAlt: Terminal mostrando el error vitest command not found bajo bun
selfHealing: bnxvts
category: devops
author: giorgio-saud
collections:
  - frontend
  - architecture
tags:
  - bun
  - vitest
  - testing
  - devops
  - "2026"
---

Corto. Si `bun run test` falla con `vitest: command not found` aunque vitest claramente está en tus `devDependencies`, seguí leyendo.

## Qué Está Pasando

Tu `package.json` probablemente se ve así:

```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

Cuando npm o pnpm ejecutan un script, agregan `node_modules/.bin` al `PATH` antes de ejecutar. Así es como `vitest run` resuelve al binario instalado localmente.

Bun hace esto también — *la mayoría del tiempo*. Pero el comportamiento no siempre es consistente entre versiones de Bun, entornos de shell y setups de CI. En algunos contextos (imágenes Docker, ciertos runners de CI, shells no interactivos), `node_modules/.bin` no llega al `PATH`, y Bun cae al shell del sistema que no tiene idea de qué es `vitest`.

## El Fix

Reemplazá el nombre del binario por `bunx`:

```json
{
  "scripts": {
    "test": "bunx vitest run",
    "test:watch": "bunx vitest",
    "test:coverage": "bunx vitest run --coverage"
  }
}
```

`bunx` es el package runner de Bun — equivalente a `npx` para npm o `pnpx` para pnpm. Resuelve y ejecuta el binario desde `node_modules/.bin` explícitamente, sin importar qué haya en el `PATH`. Sin ambigüedad, sin dependencia del entorno.

## Por Qué No Instalar Vitest Globalmente

Podrías — `bun add -g vitest` — pero entonces introducís una dependencia de versión en lo que esté instalado globalmente en cada máquina. Tu CI pasa con vitest 3.x, alguien lo corre localmente con vitest 4.x, los tests se comportan diferente. `bunx` siempre usa la versión de `node_modules` del proyecto, que está pinneada en `bun.lockb`.

## Por Qué No Hardcodear el Path

```json
"test": "bun node_modules/.bin/vitest run"
```

Funciona pero es frágil. El separador de paths es específico de plataforma, y va a romperse en cualquier proyecto donde `node_modules` esté en otro lugar (monorepos, workspaces). `bunx` maneja todo eso por vos.

## El Patrón

Para cualquier herramienta CLI que ejecutes en scripts de `package.json` bajo Bun, preferí `bunx <herramienta>` sobre el binario directo. Es explícito, portable, y siempre resuelve desde la instalación local:

```json
{
  "scripts": {
    "test": "bunx vitest run",
    "lint": "bunx biome check .",
    "typecheck": "bunx tsc --noEmit"
  }
}
```

La única excepción son los scripts que son builtins de Bun o comandos de shell — esos no van por `bunx`.
