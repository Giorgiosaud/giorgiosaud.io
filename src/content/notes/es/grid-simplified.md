---
draft: false
selfHealing: GSWBRL
title: "Grillas Sin Esfuerzo: Crea Layouts Responsivos Fácilmente"
description: Cómo construir layouts flexibles y bonitos usando una sola clase utilitaria de CSS grid—sin frameworks.
publishDate: 2025-08-04T22:00:00.000Z
category: Development
author: 000001-jorge-saud
collections:
  - css
tags:
  - css
  - grid
  - desarrollo-web
date: 2025-08-31T21:54:52.000Z
slug: sistema-de-grilla-simplificado
cover: ../../../assets/images/grid-simplified.webp
coverAlt: Sistema de grid
---

## Introducción

Soy fan del canal de YouTube de Kevin Powell, y aunque no recuerdo el video exacto, sus ideas sobre grillas inspiraron el layout de mi sitio. Si quieres profundizar, mira sus [videos sobre grid aquí](https://www.youtube.com/@KevinPowell/search?query=grid).

## La estructura de la grilla: una clase, infinitas posibilidades

Este enfoque usa una sola clase `.content-grid` para crear un layout flexible y responsivo. Cualquier elemento dentro puede estar centrado, a todo lo ancho, o en modo “breakout” (más ancho que el contenido principal), ¡todo solo con una clase! Olvídate de pelear con divs contenedores o reescribir tu HTML.

¿Por qué me encanta? Porque siempre trabajo en secciones, y esto me permite ajustar la grilla en CSS sin tocar el markup. Es rápido, limpio y súper mantenible.

Aquí está el CSS base de la grilla:

```css
@layer grid {
  .content-grid {
    --padding-inline: 1rem;
    --content-max-width: 1140px;
    --breakout-max-width: 1440px;

    --breakout-size: calc(
      (var(--breakout-max-width) - var(--content-max-width)) / 2
    );
    display: grid;
    grid-template-columns:
      [full-width-start] minmax(var(--padding-inline), 1fr)
      [breakout-start] minmax(0, var(--breakout-size))
      [content-start] min(
        100% - (var(--padding-inline) * 2),
        var(--content-max-width)
      )
      [content-end]
      minmax(0, var(--breakout-size)) [breakout-end]
      minmax(var(--padding-inline), 1fr) [full-width-end];
  }

  .content-grid > :not(.breakout, .full-width),
  .full-width > :not(.breakout, .full-width) {
    grid-column: content;
  }

  .content-grid > .breakout {
    grid-column: breakout;
  }

  .content-grid > .full-width {
    grid-column: full-width;
    display: grid;
    grid-template-columns: inherit;
  }
}
```

### ¿Cómo funciona?

- **`.content-grid`**: El contenedor mágico. Úsalo donde quieras un layout flexible.
- **Sin clase**: El elemento queda en el área principal (centrado, con ancho máximo).
- **`.breakout`**: El elemento se “escapa” a un contenedor más ancho—ideal para CTAs o destacados.
- **`.full-width`**: El elemento ocupa todo el ancho, perfecto para banners o divisores.

#### Ejemplo HTML

```html
<div class="content-grid">
  <section class="full-width">Sección a todo lo ancho</section>
  <section class="breakout">Sección breakout</section>
  <section>Sección sin clase</section>
</div>
```

Ahora veamos la clase principal `content-grid`—¡la verdadera magia!

```css
 .content-grid {
    --padding-inline: 1rem;
    --content-max-width: 1140px;
    --breakout-max-width: 1440px;

    --breakout-size: calc(
      (var(--breakout-max-width) - var(--content-max-width)) /
      2
    );
    display: grid;
    grid-template-columns:
      [full-width-start] minmax(var(--padding-inline), 1fr)
      [breakout-start] minmax(0, var(--breakout-size))
      [content-start] min(
        100% -
        (var(--padding-inline) * 2),
        var(--content-max-width)
      )
      [content-end]
      minmax(0, var(--breakout-size)) [breakout-end]
      minmax(var(--padding-inline), 1fr) [full-width-end];
  }
```

### Las variables CSS

- `--padding-inline`: Agrega espacio cómodo a los lados.
- `--content-max-width`: Mantiene el contenido principal legible en pantallas grandes.
- `--breakout-max-width`: Permite que ciertos elementos sean más anchos para mayor impacto.

El truco: `--breakout-size` calcula el espacio entre el contenedor principal y el breakout, así todo queda perfectamente balanceado.

```css
 --breakout-size: calc(
      (var(--breakout-max-width) - var(--content-max-width)) /
      2
    );
```

### Las columnas de la grilla

La propiedad `grid-template-columns` define áreas con nombre: `full-width`, `breakout` y `content`. Puedes apuntar a estas áreas con los nombres de columna, ¡y así posicionar el contenido es facilísimo!

```css
 grid-template-columns:
      [full-width-start] minmax(var(--padding-inline), 1fr)
      [breakout-start] minmax(0, var(--breakout-size))
      [content-start] min(
        100% -
        (var(--padding-inline) * 2),
        var(--content-max-width)
      )
      [content-end]
      minmax(0, var(--breakout-size)) [breakout-end]
      minmax(var(--padding-inline), 1fr) [full-width-end];
```

Ahora tenemos 3 áreas: `full-width`, `breakout` y `content`. Cada una puede ser apuntada individualmente usando los nombres de columna definidos, permitiendo colocar el contenido exactamente donde quieras.

Aquí es donde entran en juego las clases:

```css
.content-grid > :not(.breakout, .full-width),
  .full-width > :not(.breakout, .full-width) {
    grid-column: content;
  }

  .content-grid > .breakout {
    grid-column: breakout;
  }

  .content-grid > .full-width {
    grid-column: full-width;
    display: grid;
    grid-template-columns: inherit;
  }
```

- `content-grid` sin ninguna clase toma el espacio del contenedor principal.
- `full-width` ocupa todo el ancho disponible.
- `breakout` toma un contenedor más grande que el principal.

Todo esto es posible solo definiendo el nombre de la columna en la grilla. Dentro de estas áreas puedes usar cualquier grid, flex o estructura personalizada para cada sección.

---

**¿Por qué esto es genial?**

- No más sopa de contenedores: una grilla, infinitos layouts.
- Fácil de mantener: cambia tu grilla en CSS, no en el HTML.
- Súper flexible: mezcla y combina secciones full-width, breakout y content como quieras.

---

¡Pruébalo en tu próximo proyecto y verás lo simple que se vuelve tu layout!
