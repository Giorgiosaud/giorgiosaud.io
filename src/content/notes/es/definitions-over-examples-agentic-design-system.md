---
draft: false
title: "Definiciones sobre ejemplos: construir un design system que los agentes de IA sí puedan usar"
description: "Los agentes leen la documentación de tu design system y copian los ejemplos — incluyendo lo que era accidental. Así hice que el CSS fuera el contrato, generé desde ahí los artefactos para agentes, y esto es lo que todavía no resuelvo."
publishDate: 2026-08-14
cover: ../../../assets/images/mcps-role-in-the-future-of-ai-technology.png
coverAlt: Un contrato de design system siendo leído por un agente de IA, con definiciones CSS fluyendo hacia artefactos legibles por máquina
selfHealing: dfntns
lang: es
category: Architecture
author: giorgio-saud
collections:
  - architecture
  - ai
tags:
  - design-systems
  - ai
  - agentes
  - css
  - "2026"
---

Dale a un agente la documentación de tu design system y pídele que construya una card. Va a encontrar un ejemplo, copiar el markup y entregarte algo que renderiza. Ahora mira con calma qué fue lo que copió.

Se trajo el div contenedor que solo existía porque la página de docs necesitaba un marco de preview. Se trajo un atributo `style` inline que alguien dejó en un ejemplo hace tres meses. Eligió la clase modificadora que estaba en el snippet, no la que tu caso necesita. Todo lo accidental de ese ejemplo ahora carga peso en tu producto.

El agente no falló. Hizo exactamente lo que un ejemplo invita a hacer: imitarlo. El problema es que llevamos años escribiendo documentación para humanos, que leen un ejemplo e infieren la regla detrás, y ahora se la estamos entregando a máquinas, que leen un ejemplo y lo reproducen literal.

Así que en [BPL DS](https://ds.bepartnerlabs.com) lo invertí: **las definiciones son el artefacto, los ejemplos son opcionales.**

## El CSS ya es el contrato

Aquí está lo que me tomó vergonzosamente mucho tiempo ver. Yo estaba pensando en escribir documentación para agentes — un archivo mantenido a mano explicando cada componente, sus tokens, sus variantes. Y el CSS de cada componente ya contenía todo eso, con precisión, en un formato que igual mantenía correcto porque es el código que corre.

El archivo de un componente declara su propia API pública:

```css
@layer bp-components {
  .bp-btn {
    --_background: var(--btn-background, var(--bp-primary));
    background: var(--_background);
    container-type: inline-size;
  }
}
```

Esa sola declaración dice cuatro cosas sin una línea de prosa: el token público del componente es `--btn-background`, su default cae al token base `--bp-primary`, `--_background` es plomería interna, y el componente es un contexto de container query. Si un agente sabe esas cuatro cosas, puede customizar un botón correctamente. Si solo tiene un ejemplo de HTML, va a tirar de `style="background: red"` — porque el ejemplo nunca le dijo que existía un token.

Este es el patrón constructor de 3 niveles del que escribí en [Custom Properties con defaults](https://www.giorgiosaud.io/notebook/custom-properties-with-defaults-LVCSTP), aplicado como contrato para agentes:

| Nivel | Forma | Quién lo toca |
|---|---|---|
| 1 — base | `--bp-primary` | El consumidor, una vez, al mapear los valores de marca |
| 2 — público | `--btn-background` | **El único nivel que un agente debería tocar** |
| 3 — privado | `--_background` | Nadie fuera del componente |

El nivel 2 es el interesante: no está declarado en ninguna parte. Existe solo cuando el consumidor lo define. Toda la superficie de customización del design system es un conjunto de variables que no existen hasta que las usas — elegante en CSS y completamente invisible para cualquier cosa que esté leyendo ejemplos.

## Un script, tres salidas

Entonces `pnpm build` corre un generador de registry antes de que Astro construya nada. Parsea fuentes que ya existen y escribe tres archivos:

| Entrada | Qué se extrae |
|---|---|
| `src/styles/tokens.css` | Todos los tokens base `--bp-*` |
| `src/styles/components/*.css` | Tokens públicos, vars privadas, variantes BEM, declaraciones de layer, uso de `container-type` |
| `src/content/docs/components/*.mdx` | `title` y `description` del frontmatter; forma canónica del HTML desde el primer `<Preview>`, si lo hay |

Salen `components.json` para consumo programático, `AGENTS.md` como el contrato que lee un agente dentro del repo, y `llms.txt` para lo que sea que esté crawleando el sitio de documentación.

Cada componente aterriza en el registry así:

```json
{
  "name": "btn",
  "title": "Button",
  "description": "Action trigger using <button> or <a>.",
  "html": "<button class=\"bp-btn\" type=\"button\">Label</button>",
  "containerQuery": true,
  "publicTokens": {
    "--btn-background": { "default": "var(--bp-primary)", "description": "Background color" }
  },
  "privateVars": ["--_background", "--_color", "--_radius"],
  "variants": ["bp-btn--danger", "bp-btn--ghost", "bp-btn--secondary"],
  "stateAttrs": []
}
```

Fíjate en qué es el campo `html`: una *forma canónica*, la estructura mínima correcta, no un ejemplo rico. Y fíjate en que es opcional — un componente sin `<Preview>` en su MDX igual se registra, igual tiene su API de tokens completa, igual lo construye bien un agente. El ejemplo es una cortesía para humanos. La definición es lo que se envía.

El efecto práctico en mi flujo es que agregar un componente es escribir el archivo CSS y el frontmatter del MDX. Ya. Nunca toco un registry. No hay un paso donde la documentación se desvíe del código, porque la documentación es una proyección del código.

## Reglas que existen solo porque los agentes las rompen

Generar la API de tokens era la mitad fácil. La otra mitad son las convenciones que un agente no puede inferir del CSS solo, y que tuve que escribir explícitamente porque las vi romperse:

- **El estado vive en el DOM, no en clases.** El CSS lee `[aria-selected="true"]`, `[open]`, `:checked`, `:disabled`. El JavaScript escribe esos atributos. A los agentes les encanta togglear una clase `.is-active`, porque eso es lo que hace la mayoría de la data con la que fueron entrenados.
- **Nada de `style=""`. En ningún lado.** Ni en producción, ni en un ejemplo de docs. Cada estilo inline en un ejemplo se convierte en un estilo inline en cien componentes generados. La variación es un modificador BEM o un token de componente.
- **`@container`, no `@media`.** Cada raíz de componente tiene `container-type: inline-size`, así que los breakpoints son relativos al espacio donde el componente está parado. El registry lleva un flag `containerQuery` por componente para que el agente sepa cuál de los dos usar — `false` significa full-viewport, usa `@media`.
- **Nunca definir nivel 1 ni nivel 3.** Un agente que define `--bp-primary` sobre un botón para poner *un* botón azul acaba de repintar medio sitio.

Ninguna de estas es buena práctica exclusiva de agentes. Son todas cosas que querría que siguiera un contribuidor humano. La diferencia es que un humano rompe la regla una vez y aprende; un agente la rompe idéntica en cuarenta archivos antes de que voltees a ver.

Hay también un detalle pequeño que me gusta: el paquete imprime dónde viven sus instrucciones para agentes al instalarse.

```
┌─────────────────────────────────────────────────────────┐
│ BPL DS installed — agent instructions available         │
├─────────────────────────────────────────────────────────┤
│ Local:  node_modules/@be-partner-labs/ds/AGENTS.md      │
│ Online: https://ds.bepartnerlabs.com/AGENTS.md          │
└─────────────────────────────────────────────────────────┘
```

El descubrimiento es un problema real. Un contrato que nadie encuentra es un contrato que nadie sigue, y el momento justo después del install es cuando alguien — o algo — está decidiendo cómo usar tu librería.

## La parte que no he resuelto

Aquí dejo de vender y te cuento lo que está roto.

Generar `AGENTS.md` desde el registry funciona tan bien que generó *todo*. Los 27 componentes, cada uno con su lista completa de tokens y su puntero a docs. Pasó de las 485 líneas. Cada sesión de agente que lo carga gasta una porción nada despreciable de su contexto leyendo tablas de tokens de componentes que nunca va a tocar, la mayoría de los cuales siguen patrones que habría podido inferir de dos o tres ejemplos.

Resolví el drift de documentación y me compré un problema de contexto.

El arreglo que tengo especificado pero sin construir es un principio de componente canónico: un componente se gana el tratamiento completo en `AGENTS.md` solo si enseña un patrón que no se puede inferir de los otros. Tres cubren todo el sistema:

| Patrón | Componente canónico | Qué enseña |
|---|---|---|
| Componente de CSS puro | Button | Tokens de nivel 2, BEM, vars privadas |
| Elemento nativo mejorado | Accordion | `<details>`/`<summary>`, cero JS, estado desde el elemento nativo |
| Custom element con JS | Dropdown | Wrapper de custom element, navegación por teclado, `aria-expanded` |

Un agente que entiende esos tres puede construir correctamente cualquiera de los otros 24. El resto pasan a ser una línea cada uno — nombre, descripción, cantidad de tokens, URL de docs — y el agente busca el detalle solo de lo que realmente está construyendo.

Ese es el diseño. Todavía no está construido, y escribo esto con `AGENTS.md` aún gordo, porque un post que solo cuenta las partes que funcionaron no le sirve de mucho a nadie que esté haciendo esto por su cuenta. Si generas un contrato para agentes desde tu código, cuenta con que la completitud va a ser el siguiente problema. La documentación generada por máquina no tiene instinto natural para saber qué dejar afuera — ese instinto es justamente lo que te toca codificar a propósito.

## Qué te robaría de aquí

Lo más probable es que ya tengas el contrato. Está en el CSS de tus componentes: los tokens que expones, los internos que no, la convención de nombres que sigues, el orden de layers del que dependes. Es exacto porque es el código que corre, y lo mantienes lea alguien o no lo lea nadie.

Escribir a mano un documento aparte que describa todo eso es la receta para tener dos fuentes de verdad y que una de las dos mienta. Extráelo, en tiempo de build, hacia los formatos que quieran las cosas que leen tu sistema — JSON para tooling, un contrato en markdown para el agente que vive en el repo, un archivo de texto para los crawlers.

Y después sé deliberado con lo que dejas afuera, que resulta ser el problema de ingeniería más difícil de los dos.

> **Pruébalo**: BPL DS es MIT y está en npm como `@be-partner-labs/ds`. El contrato generado es público en [ds.bepartnerlabs.com/AGENTS.md](https://ds.bepartnerlabs.com/AGENTS.md) — apunta tu agente ahí y mira hasta dónde llega sin leer un solo ejemplo de HTML.
