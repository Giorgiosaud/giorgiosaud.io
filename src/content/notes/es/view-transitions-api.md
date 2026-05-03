---
draft: true
slug: api-view-transitions
title: "View Transitions API: Navegación Fluida entre Páginas"
description: "Aprende a agregar transiciones suaves entre páginas con una sola regla CSS, personalizar animaciones para elementos específicos y crear experiencias tipo SPA sin JavaScript."
publishDate: 2026-01-02
cover: ../../../assets/images/view-transitions-api.png
coverAlt: Ilustración de View Transitions API
selfHealing: vwtrns
lang: es
category: Development
author: giorgio-saud
collections:
  - css
  - frontend
tags:
  - css
  - view-transitions
  - navigation
  - animation
---

Este sitio tiene transiciones suaves entre páginas. No hay ninguna librería de animaciones, no hay JavaScript especial — solo una regla CSS.

```css
@view-transition {
  navigation: auto;
}
```

Eso es todo. El navegador captura la página actual, carga la nueva en segundo plano, y reproduce un crossfade. Nativo, acelerado por GPU, sin configuración.

Acá está exactamente como lo tengo en este sitio:

```css
@layer root {
  @view-transition {
    navigation: auto;
  }
}
```

Envuelto en `@layer` para que no rompa la cascada — pero el núcleo es esa sola declaración.

## Morphing de elementos

Donde se pone interesante es con `view-transition-name`. Si le das el mismo nombre a un elemento en dos páginas distintas, el navegador lo anima entre las dos posiciones automáticamente.

**Página de listado:**
```html
<img
  src="product.jpg"
  alt="Producto"
  style="view-transition-name: product-image;"
/>
```

**Página de detalle:**
```html
<img
  src="product.jpg"
  alt="Producto"
  style="view-transition-name: product-image;"
/>
```

El navegador ve los nombres coincidentes y crea la animación de morph solo. Para el header, por ejemplo:

```css
.header {
  view-transition-name: header;
}
```

Queda fijo mientras el resto de la página transiciona. Sin flash, sin salto de layout.

## Personalizar la animación

Si el crossfade por defecto no te alcanza, tenés control total sobre los pseudo-elementos:

```css
::view-transition-old(root) {
  animation: 300ms ease-out both fade-out;
}

::view-transition-new(root) {
  animation: 300ms ease-in both fade-in;
}

@keyframes fade-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.95); }
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(1.05); }
  to { opacity: 1; transform: scale(1); }
}
```

Y si querés slides direccionales:

```css
@keyframes slide-from-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes slide-to-left {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

::view-transition-old(root) {
  animation: 300ms slide-to-left ease-out;
}

::view-transition-new(root) {
  animation: 300ms slide-from-right ease-out;
}
```

## Soporte actual

A principios de 2026, Chrome, Edge, Firefox y Safari ya soportan View Transitions. Y si algún navegador viejo no lo entiende, simplemente ignora el `@view-transition` — sin errores, sin nada roto.

Navegás entre páginas en este sitio y ya lo estás viendo en acción. Vale la pena tenerlo en cuenta para cualquier sitio multipágina.
