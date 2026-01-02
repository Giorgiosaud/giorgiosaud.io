---
draft: false
title: "CSS Anchor Positioning: El Futuro del Posicionamiento UI"
description: "Aprende a usar CSS Anchor Positioning para posicionar tooltips, modales y popovers sin librerías JavaScript. CSS nativo para ubicación precisa de elementos."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
coverAlt: Ilustración de CSS Anchor Positioning
selfHealing: cssnch
lang: es
category: Development
author: giorgio-saud
collections:
  - css
  - frontend
tags:
  - css
  - anchor-positioning
  - ui
  - tooltips
  - modals
---

## El Problema con el Posicionamiento JavaScript

Durante años, posicionar tooltips, popovers y menús desplegables requería librerías JavaScript como Popper.js o Floating UI. Calculabas posiciones, manejabas colisiones con el viewport, gestionabas eventos de scroll y luchabas guerras de z-index.

CSS Anchor Positioning elimina todo eso. Declaras a qué elemento anclar, y dónde colocar el elemento posicionado - eso es todo.

## El Concepto Central

Anchor Positioning funciona en dos pasos:

1. **Nombrar un ancla** - Dale a cualquier elemento un `anchor-name`
2. **Posicionar relativo a él** - Usa `position-anchor` y `position-area` en el elemento posicionado

```css
/* Paso 1: Nombrar el ancla */
.trigger-button {
  anchor-name: --my-button;
}

/* Paso 2: Posicionar relativo a él */
.tooltip {
  position: fixed;
  position-anchor: --my-button;
  position-area: top center;
}
```

Ese es todo el concepto. Sin coordenadas JavaScript, sin resize observers, sin cálculos manuales.

## Ejemplo Real: Modal Flotante de Resumen

Así es como posiciono el modal del resumidor de IA en este sitio:

```css
.summary-bubble {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 64px;
  height: 64px;
  anchor-name: --summary-bot;
}

.summary-modal {
  position: fixed;
  position-anchor: --summary-bot;
  position-area: top left;
  max-width: 400px;
  width: 90vw;
}
```

El modal se posiciona automáticamente arriba y a la izquierda del botón. Cuando el botón se mueve (diferentes tamaños de pantalla, posición de scroll), el modal lo sigue.

## Entendiendo `position-area`

La propiedad `position-area` usa un modelo de grilla de 9 regiones:

```
┌─────────┬────────┬──────────┐
│ top     │ top    │ top      │
│ left    │ center │ right    │
├─────────┼────────┼──────────┤
│ center  │ center │ center   │
│ left    │        │ right    │
├─────────┼────────┼──────────┤
│ bottom  │ bottom │ bottom   │
│ left    │ center │ right    │
└─────────┴────────┴──────────┘
```

Valores comunes:
- `top center` - Arriba del ancla, centrado
- `bottom left` - Debajo del ancla, alineado a la izquierda
- `span-top span-left` - Expandirse por el cuadrante superior izquierdo

## Ejemplo Real: Notificación de Botón Compartir

Aquí hay una notificación posicionada relativa a un botón de compartir:

```css
#share {
  anchor-name: --share-button;
}

#notification {
  position: fixed;
  position-anchor: --share-button;
  bottom: calc(anchor(top) + 10px);
  /* Posicionar 10px arriba del borde superior del ancla */
}
```

La función `anchor()` te da control preciso - referencia cualquier borde del ancla y agrega offsets.

## Ejemplo Real: Navegación de Carrusel

Para navegación de scroll markers en carruseles:

```css
ul.carousel {
  anchor-name: --badges-carousel;
  /* ... estilos de scroll snap */
}

ul.carousel::scroll-marker-group {
  position: fixed;
  position-anchor: --badges-carousel;
  position-area: block-end;
  /* Posicionado debajo del carrusel */
}
```

## Nombres de Ancla Dinámicos

Para listas donde cada elemento necesita su propio ancla, usa propiedades personalizadas CSS:

```astro
---
const items = ['Item 1', 'Item 2', 'Item 3']
---

{items.map((item, i) => (
  <div style={`anchor-name: --item-${i}`}>
    {item}
  </div>
))}
```

O en CSS puro con selectores de atributos:

```css
[data-anchor="tooltip-1"] {
  anchor-name: --tooltip-1;
}

[data-anchor="tooltip-2"] {
  anchor-name: --tooltip-2;
}
```

## Manejo de Colisión con Viewport

El navegador maneja automáticamente las colisiones con el viewport usando `position-try`:

```css
.tooltip {
  position: fixed;
  position-anchor: --button;
  position-area: top center;

  /* Posiciones de respaldo si top no cabe */
  position-try: flip-block, flip-inline, flip-block flip-inline;
}
```

Valores:
- `flip-block` - Voltear verticalmente (top ↔ bottom)
- `flip-inline` - Voltear horizontalmente (left ↔ right)

## La Función `anchor()`

Para posicionamiento preciso, usa la función `anchor()`:

```css
.positioned {
  position: fixed;
  position-anchor: --button;

  /* Posicionar en el borde inferior del ancla + 8px */
  top: calc(anchor(bottom) + 8px);

  /* Centrar horizontalmente con el ancla */
  left: anchor(center);
  translate: -50% 0;
}
```

La función acepta:
- `anchor(top)`, `anchor(bottom)`, `anchor(left)`, `anchor(right)`
- `anchor(center)` - Centro del ancla
- `anchor(start)`, `anchor(end)` - Propiedades lógicas

## Soporte de Navegadores (2026)

A principios de 2026:
- **Chrome 125+**: Soporte completo
- **Edge 125+**: Soporte completo
- **Firefox**: Detrás de flag, esperado pronto
- **Safari**: En desarrollo

Para producción, verifica soporte y proporciona fallbacks:

```css
.tooltip {
  /* Fallback: posición fija */
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@supports (anchor-name: --test) {
  .tooltip {
    position-anchor: --button;
    position-area: top center;
    transform: none;
  }
}
```

## Puntos Clave

1. **No requiere JavaScript** - CSS puro para lógica de posicionamiento
2. **Actualizaciones automáticas** - Elementos posicionados siguen sus anclas
3. **Consciente del viewport** - Detección de colisión integrada con `position-try`
4. **Control preciso** - Función `anchor()` para ubicación pixel-perfect
5. **Mejora progresiva** - Funciona con fallbacks para navegadores no soportados

CSS Anchor Positioning es una de las características CSS más impactantes de los últimos años. Elimina categorías enteras de código JavaScript y hace que el posicionamiento UI sea declarativo y predecible.

> **Míralo en acción**: El botón flotante del robot en la esquina inferior derecha de esta página usa anchor positioning para su modal. ¡Prueba hacer clic en él!
