---
draft: false
title: "Cuatro niveles y nada de @property: cómo el BPL Design System conecta sus tokens"
description: "Un recorrido por la arquitectura de tokens de BPL DS — primitives, tokens semánticos, slots por componente y resolvers privados --_* — y por qué dejamos a propósito de registrar los tokens del tema con @property."
publishDate: 2026-11-13
cover: ../../../assets/images/bpl-design-system-token-architecture.webp
coverAlt: "Cuatro capas translúcidas apiladas, desde swatches de color crudos hasta tokens semánticos, un componente y un nivel privado con candado, junto a una luna mitad clara, mitad oscura"
selfHealing: tknsbp
lang: es
category: Architecture
author: giorgio-saud
collections:
  - architecture
  - frontend
tags:
  - design-systems
  - css
  - custom-properties
  - tokens
  - "2026"
linkedinCopy: |
  Compañeros devs — antes registrábamos los colores de marca con @property. Lo dejamos de hacer a propósito.

  Nuestro design system no tiene ni una línea de JavaScript. El mismo CSS funciona en Astro, Next.js o un HTML plano, porque toda la API de theming son custom properties, en cuatro niveles:

  → paleta cruda
  → tokens semánticos base
  → un slot público por cada propiedad del componente
  → resolvers privados --_* que nadie fuera del componente toca

  Lo de @property me sorprendió. Un color registrado resuelve light-dark() donde se declara, así que una sección oscura dentro de una página clara nunca cambia. Sin registrar, se resuelve donde se usa. Los tokens tipados parecían lo "correcto" y rompían el theming anidado.

  Escribí la cadena completa, las cinco reglas que la mantienen ordenada y el trade-off.

  Inicia sesión y cuéntame cómo manejas el theming de secciones anidadas 👇
  https://www.giorgiosaud.io/es/cuaderno/tknsbp

  #CSS #DesignSystems #CustomProperties #DesarrolloWeb #DesignTokens #CuatroNivelesSinProperty #ElCSSEsLaAPI
twitterCopy: |
  Compañeros devs — dejamos de registrar los tokens de color con @property: un color registrado resuelve light-dark() donde se declara y rompe el theming anidado. Cuatro niveles y cinco reglas: https://www.giorgiosaud.io/es/cuaderno/tknsbp #CSS #ElCSSEsLaAPI
---

Todo design system termina enfrentando la misma pregunta: *¿cómo cambia un cliente el color de marca sin hacer fork del CSS?*

La mayoría la resuelve con un build step: un archivo de tema, un mapa de Sass, una config de Tailwind, un provider de JavaScript. [BPL DS](https://ds.bepartnerlabs.com), el design system que usamos en Be Partner Labs, la resuelve solo con custom properties de CSS. No hay runtime ni build step del lado del consumidor: importas una hoja de estilos y defines una variable. Eso es también lo que lo hace framework-agnostic. El mismo `@import '@be-partner-labs/ds/full'` funciona en un layout de Astro, en una app de Next.js o en un HTML estático, porque a las custom properties no les importa quién renderiza el markup.

Eso solo funciona si las variables están tan bien organizadas que "define una variable" siempre sea la respuesta correcta. Este post trata de esa organización: cuatro niveles, cinco reglas y una decisión que me sorprendió — sacamos `@property` de los tokens del tema a propósito.

## Los cuatro niveles

```
Nivel 0  --figma-blue-500     Paleta cruda (primitives). Los componentes nunca la usan directo.
Nivel 1  --bp-primary         Tokens semánticos base en :root. Es lo que el cliente remapea.
Nivel 2  --btn-background     Slot público del componente, con el nombre de la propiedad CSS que controla.
Nivel 3  --_background        Resolver privado dentro del componente. Nunca se define desde afuera.
```

**Nivel 0 — primitives.** Es la paleta cruda, normalmente lo que exporta Figma o Style Dictionary: `--figma-blue-500`, `--figma-white`. Los componentes nunca los leen. Existen para que el archivo de diseño del cliente tenga dónde vivir.

**Nivel 1 — tokens semánticos base.** Describen *roles*, no colores: `--bp-primary`, `--bp-color-bg`, `--bp-color-text-muted`, `--bp-radius`, `--bp-space-4`. Viven en `:root` dentro de `@layer bp-tokens`. Cambiar de marca significa mapear primitives sobre este nivel y nada más:

```css
:root {
  --bp-primary: var(--figma-blue-500);
  --bp-radius: 0.375rem;
}
```

La superficie para el cliente es pequeña a propósito. `--bp-primary` y `--bp-radius` son las dos que se espera que toques; el resto de la escala se deriva de ellas:

```css
:root {
  --bp-primary: #5fcb9f;
  --bp-primary-hover: color-mix(in srgb, var(--bp-primary) 82%, black);
  --bp-radius-sm: calc(var(--bp-radius) * 0.5);
  --bp-radius-lg: calc(var(--bp-radius) * 1.5);
}

@supports (color: oklch(from red l c h)) {
  :root {
    --bp-primary-hover: oklch(from var(--bp-primary) calc(l - 0.08) c h);
  }
}
```

`color-mix()` es la base; los navegadores con sintaxis de color relativo obtienen un hover perceptualmente mejor en OKLCH. Cambias un hex y el hover, el tono sutil y el de primer plano lo siguen.

**Nivel 2 — slots del componente.** Cada componente expone una API pública pequeña: `--btn-background`, `--btn-color`, `--btn-border-radius`, `--card-padding`. Son para *excepciones por instancia*, no para tematizar.

**Nivel 3 — resolvers privados.** Dentro del componente, cada slot se resuelve exactamente una vez, en el selector raíz, en una variable `--_*` que consume el resto del componente:

```css
@layer bp-components {
  .bp-btn {
    --_background: var(--btn-background, var(--bp-primary));
    --_color: var(--btn-color, var(--bp-primary-fg));
    --_border-radius: var(--btn-border-radius, var(--bp-radius-md));

    background-color: var(--_background);
    color: var(--_color);
    border-radius: var(--_border-radius);
  }
}
```

Lee la primera línea como una frase: *el fondo es lo que el consumidor puso en `--btn-background`, y si no puso nada, el color primario de la marca.* Esa línea es todo el contrato entre el componente, el tema y el consumidor. Es el [patrón constructor para custom properties](https://www.giorgiosaud.io/es/cuaderno/custom-properties-with-defaults-LVCSTP) aplicado a un sistema completo.

Todo está en un orden de capas fijo — `@layer bp-tokens, bp-reset, bp-grid, bp-components, bp-utilities` — así que el CSS del consumidor, fuera de las capas, siempre gana sin pelear especificidad.

## Las cinco reglas que lo mantienen honesto

Cuatro niveles son fáciles de dibujar y fáciles de erosionar. Estas son las reglas que escribimos cuando empezó la erosión:

**1. El nombre del slot coincide con la propiedad CSS.** `--btn-background`, no `--btn-bg` ni `--btn-theme`. Un slot, una propiedad. Si sabes CSS, puedes adivinar la API.

**2. Nada de tokens de estado.** Antes teníamos `--btn-bg-hover`. Ya no existe. Un hover redeclara el resolver privado, y el consumidor que quiere un hover propio define el *mismo* slot público en su propio `:hover`:

```css
/* Fuente del DS */
.bp-btn:hover {
  --_background: var(--btn-background, var(--bp-primary-hover));
}

/* Consumidor: un CTA puntual */
.hero__cta { --btn-background: var(--brand-cta); }
.hero__cta:hover { --btn-background: var(--brand-cta-hover); }
```

Los tokens de estado duplican la superficie de la API por cada estado que soportas, y son lo primero que agentes y humanos hacen mal.

**3. Las variables privadas viven solo en la raíz del componente.** Los elementos hijos consumen `--_*`; nunca declaran una. Así la resolución queda en un solo lugar que se lee de arriba abajo.

**4. Los slots de componente nunca van en `:root`.** `:root { --btn-background: red }` cambia todos los botones del sitio y es un dolor sobrescribirlo localmente. Los cambios globales van por el Nivel 1; el Nivel 2 se acota a un selector.

**5. Slots para hijos solo cuando alguien los necesita.** `--card-link-color` existe solo si un consumidor tiene una razón documentada. Una API que no expusiste es una API que nunca tienes que mantener estable.

No son solo recomendaciones en un README. Un validador (`pnpm validate:ds` en el repo del DS, más un script del lado del consumidor) marca las violaciones que más importan — editar clases `.bp-*` directamente, tokens de componente en `:root`, `style=""` inline sobre elementos del DS — y ese mismo contrato es del que [generamos la documentación para agentes](https://www.giorgiosaud.io/es/cuaderno/definitions-over-examples-agentic-design-system-dfntns).

## La decisión: nada de `@property` en los tokens del tema

Esta es la parte que no esperaba escribir.

Antes de que el DS fuera un paquete, el sitio de la marca tenía su propio archivo de tokens, y los colores de marca estaban registrados:

```css
@property --bpl-mint {
  syntax: "<color>";
  initial-value: #5FCB9F;
  inherits: true;
}
```

Parecía buena práctica. [`@property` te da custom properties tipadas y animables](https://www.giorgiosaud.io/es/cuaderno/css-custom-properties-2026-csscst): un valor inválido cae al valor inicial en vez de romperse en silencio, y puedes hacer transición sobre la variable misma.

Cuando pasamos el sitio al paquete compartido, quitamos los registros y en su lugar dejamos este comentario en `tokens.css`:

> Los tokens quedan sin registrar a propósito: una custom property no registrada hereda la expresión `light-dark()` sin resolver, así que se resuelve donde se usa, con el color-scheme de ese elemento.

La razón es el modo oscuro. Cada token de color guarda los dos valores:

```css
:root {
  color-scheme: light dark;
  --bp-color-bg: light-dark(#f8f6f2, #16140f);
  --bp-color-text: light-dark(#181715, #f2eee6);
}

[data-theme='dark'] { color-scheme: dark; }
```

Ahora imagina una página clara con una sección oscura — un footer, un hero, una franja de precios — marcada con `data-theme="dark"`.

- **Registrado como `<color>`**, `--bp-color-bg` se calcula *en `:root`*. `light-dark()` se resuelve ahí, contra el color scheme de la raíz, a un único color concreto. Los descendientes heredan ese valor claro ya resuelto. La sección oscura cambia su `color-scheme` y al token le da igual. Para que funcione tendrías que redeclarar cada token de color dentro de `[data-theme]`.
- **Sin registrar**, el token se hereda como la expresión literal `light-dark(#f8f6f2, #16140f)`. Solo se resuelve cuando algo lo usa — `background: var(--bp-color-bg)` en un elemento dentro de la sección oscura — y en ese momento se resuelve contra el color scheme de *ese* elemento.

Entonces un subárbol tematizado solo tiene que cambiar una propiedad, `color-scheme`. No se redeclara ningún token, y el override del cliente en `:root` sigue llegando a todas las secciones, claras u oscuras.

### Lo que perdimos

Es un trade-off real, no una victoria gratis:

- **Sin type safety.** Si defines `--bp-primary: 12px` obtienes un color roto, no un fallback al valor inicial.
- **Sin animar el token en sí.** No puedes hacer transición de `--bp-primary` entre dos colores de marca. Sí puedes hacer transición de `background-color` en el componente, que suele ser lo que quieres.
- **Sin `inherits: false`.** Todos los tokens del tema heredan. Para tokens de tema, esa es justamente la idea.

Si necesitas un valor animable, registra *ese* valor, cerca del componente que lo anima. El ángulo de un gradiente o un porcentaje de progreso son buenos candidatos para `@property`. La paleta de tu tema, no.

## Lo que me llevo

- **Separa roles de valores.** Los componentes deben depender de `--bp-primary`, nunca de `#5fcb9f` y nunca de `--figma-blue-500`. Cambiar de marca pasa a ser un bloque de mapeos.
- **Resuelve una vez, en privado.** El resolver `--_*` en la raíz del componente es lo que permite tener slots públicos, estados y defaults sin una explosión combinatoria de variables.
- **Pregúntate dónde debe resolverse un token.** Para todo lo que se construye sobre `light-dark()`, la respuesta honesta es "donde se usa", y ese es un argumento *en contra* de registrarlo.

> **Pruébalo**: BPL DS tiene licencia MIT y está en npm como `@be-partner-labs/ds`. Impórtalo, define `--bp-primary` en `:root`, ponle `data-theme="dark"` a cualquier sección y mira cómo cambia sin tocar un solo token.
