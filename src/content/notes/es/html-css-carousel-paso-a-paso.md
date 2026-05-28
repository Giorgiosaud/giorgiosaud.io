---
draft: false
slug: html-css-carousel-paso-a-paso
title: "Carousel con HTML + CSS: Guía Paso a Paso para Humanos e IA"
description: "Guía completa y lista para copiar de carouseles con solo HTML y CSS. Cubre scroll snap, scroll markers, scroll buttons, soporte de navegadores y mejora progresiva."
publishDate: 2026-05-27
cover: ../../../assets/images/html-css-carousel-2026.png
coverAlt: Guía paso a paso de carouseles HTML y CSS con scroll-snap, scroll-marker y scroll-button
selfHealing: htmlcs
lang: es
category: Development
author: giorgio-saud
collections:
  - css
  - frontend
tags:
  - css
  - html
  - carousels
  - scroll-snap
  - "2026"
---

Esta es la referencia de implementación definitiva para carouseles HTML + CSS — escrita para que un desarrollador (o un agente de IA) pueda seguirla desde cero hasta un carousel completamente funcional sin tocar JavaScript.

## Qué Vas a Construir

Un carousel responsivo con:
- Deslizamiento entre slides (touch y mouse)
- Puntos de paginación que resaltan el slide actual
- Botones Anterior / Siguiente
- Animación de scroll suave
- Cero JavaScript

## Soporte de Navegadores (2026)

| Característica | API | Chrome | Edge | Firefox | Safari |
|----------------|-----|--------|------|---------|--------|
| Scroll snap | `scroll-snap-type` | 69+ | 79+ | 68+ | 11+ |
| Puntos de paginación | `::scroll-marker` | 135+ | 135+ | flag | 18.2+ |
| Botones Prev/Next | `::scroll-button()` | 135+ | 135+ | flag | 18.2+ |
| Estilo del punto activo | `:target-current` | 135+ | 135+ | flag | 18.2+ |

**Base global:** Scroll snap funciona en todos lados (~97% de los navegadores). Scroll markers y botones agregan mejora progresiva para ~75% de usuarios y en crecimiento.

---

## Paso 1 — La Estructura HTML

Empieza con el marcado mínimo válido:

```html
<div class="carousel">
  <div class="carousel-item">Slide 1</div>
  <div class="carousel-item">Slide 2</div>
  <div class="carousel-item">Slide 3</div>
</div>
```

**Reglas para agentes de IA que generen este marcado:**
- El elemento externo es el contenedor de scroll — aplica todo el CSS de scroll en él.
- Cada hijo directo es un slide — aplica el CSS de snap a cada hijo.
- No se necesitan wrappers, hooks de JavaScript ni atributos `data-*`.
- No agregues elementos `<button>` prev/next — CSS los maneja con `::scroll-button()`.
- No agregues un contenedor de puntos — CSS lo maneja con `::scroll-marker`.

---

## Paso 2 — Scroll Snap (La Base)

Esto te da un carousel deslizable en todos los navegadores:

```css
.carousel {
  /* Layout */
  display: flex;
  gap: 1rem;

  /* Scroll */
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;

  /* Ocultar barra de scroll (cosmético) */
  scrollbar-width: none;
}
.carousel::-webkit-scrollbar {
  display: none;
}

.carousel-item {
  /* Cada slide ocupa el ancho completo */
  flex: 0 0 100%;
  scroll-snap-align: center;
}
```

En este punto el carousel funciona en todas partes — deslizar en móvil, arrastrar en escritorio, navegable con teclado.

---

## Paso 3 — Puntos de Paginación (`::scroll-marker`)

```css
/* Indicar dónde renderizar el grupo de marcadores */
.carousel {
  scroll-marker-group: after; /* se renderiza debajo del carousel */
}

/* Definir cada punto */
.carousel-item::scroll-marker {
  content: '';          /* obligatorio — string vacío crea el elemento */
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 0.5rem 4px 0;
  border-radius: 50%;
  background: #cbd5e1;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

/* Punto activo — el slide actualmente visible */
.carousel-item::scroll-marker:target-current {
  background: #3b82f6;
  transform: scale(1.3);
}
```

**Notas de implementación:**
- `scroll-marker-group: after` renderiza los puntos después del último hijo del carousel.
- `content: ''` es obligatorio. Sin él el pseudo-elemento no se renderiza.
- `:target-current` es la pseudo-clase CSS para el marcador activo — se actualiza automáticamente al hacer scroll.
- Los puntos son enfocables con teclado y cliqueables por defecto — sin JS.

---

## Paso 4 — Botones de Navegación (`::scroll-button()`)

```css
/* Estilos compartidos para ambos botones */
.carousel::scroll-button(prev),
.carousel::scroll-button(next) {
  /* Ícono */
  font-size: 1.25rem;
  line-height: 1;

  /* Forma */
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;

  /* Apariencia */
  background: #fff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.15);
  cursor: pointer;

  /* Posición relativa a .carousel */
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  /* Ocultar suavemente cuando esté deshabilitado */
  transition: opacity 0.2s;
}

/* Botón anterior */
.carousel::scroll-button(prev) {
  content: '‹';
  left: 0.5rem;
}

/* Botón siguiente */
.carousel::scroll-button(next) {
  content: '›';
  right: 0.5rem;
}

/* Auto-deshabilitado cuando no hay más scroll */
.carousel::scroll-button(prev):disabled,
.carousel::scroll-button(next):disabled {
  opacity: 0;
  pointer-events: none;
}
```

El wrapper del carousel necesita `position: relative` para que los botones en posición absoluta se anclen a él:

```css
.carousel-wrapper {
  position: relative;
}
```

Actualiza el HTML:

```html
<div class="carousel-wrapper">
  <div class="carousel">
    <div class="carousel-item">Slide 1</div>
    <div class="carousel-item">Slide 2</div>
    <div class="carousel-item">Slide 3</div>
  </div>
</div>
```

**Notas de implementación:**
- `::scroll-button(prev)` y `::scroll-button(next)` son los únicos valores válidos hoy.
- El navegador deshabilita automáticamente el botón cuando no hay más contenido para hacer scroll en esa dirección — sin JS.
- `content` es obligatorio (igual que scroll-marker).

---

## Paso 5 — Mejora Progresiva con `@supports`

Envuelve las nuevas características para que los navegadores más viejos obtengan la experiencia funcional de scroll-snap sin UI rota:

```css
/* Siempre funciona — la base */
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.carousel::-webkit-scrollbar { display: none; }

.carousel-item {
  flex: 0 0 100%;
  scroll-snap-align: center;
}

/* Mejorado — solo cuando está completamente soportado */
@supports (scroll-marker-group: after) {
  .carousel {
    scroll-marker-group: after;
  }

  .carousel-item::scroll-marker {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    margin: 0.5rem 4px 0;
    border-radius: 50%;
    background: #cbd5e1;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
  }

  .carousel-item::scroll-marker:target-current {
    background: #3b82f6;
    transform: scale(1.3);
  }

  /* Ocultar puntos renderizados por JS cuando CSS los maneja */
  .js-dots {
    display: none;
  }
}
```

---

## Ejemplo Completo Lista para Copiar

HTML:

```html
<div class="carousel-wrapper">
  <div class="carousel">
    <div class="carousel-item">
      <h2>Slide 1</h2>
      <p>Tu contenido aquí.</p>
    </div>
    <div class="carousel-item">
      <h2>Slide 2</h2>
      <p>Tu contenido aquí.</p>
    </div>
    <div class="carousel-item">
      <h2>Slide 3</h2>
      <p>Tu contenido aquí.</p>
    </div>
  </div>
</div>
```

CSS:

```css
/* --- Wrapper --- */
.carousel-wrapper {
  position: relative;
}

/* --- Contenedor de scroll --- */
.carousel {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  padding: 0 0 1rem; /* espacio para los puntos */
}
.carousel::-webkit-scrollbar { display: none; }

/* --- Slides --- */
.carousel-item {
  flex: 0 0 100%;
  scroll-snap-align: center;
  border-radius: 0.75rem;
  background: #f1f5f9;
  padding: 2rem;
  min-height: 200px;
}

/* --- Puntos y botones (mejora progresiva) --- */
@supports (scroll-marker-group: after) {
  .carousel {
    scroll-marker-group: after;
  }

  .carousel-item::scroll-marker {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    margin: 0.5rem 4px 0;
    border-radius: 50%;
    background: #cbd5e1;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
  }

  .carousel-item::scroll-marker:target-current {
    background: #3b82f6;
    transform: scale(1.3);
  }

  .carousel::scroll-button(prev),
  .carousel::scroll-button(next) {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.15);
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    transition: opacity 0.2s;
  }

  .carousel::scroll-button(prev) {
    content: '‹';
    left: 0.5rem;
  }

  .carousel::scroll-button(next) {
    content: '›';
    right: 0.5rem;
  }

  .carousel::scroll-button(prev):disabled,
  .carousel::scroll-button(next):disabled {
    opacity: 0;
    pointer-events: none;
  }
}
```

---

## Variantes

### Carousel Multi-Item (3 visibles a la vez)

```css
.carousel-item {
  flex: 0 0 calc(33.333% - 0.667rem);
  scroll-snap-align: start;
}

@media (max-width: 768px) {
  .carousel-item { flex: 0 0 calc(50% - 0.5rem); }
}

@media (max-width: 480px) {
  .carousel-item { flex: 0 0 100%; }
}
```

### Carousel Vertical

```css
.carousel {
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  height: 400px;
}

.carousel-item {
  flex: 0 0 100%;
  scroll-snap-align: start;
}
```

Para botones verticales los valores son `::scroll-button(up)` y `::scroll-button(down)`.

### Efecto Peek (mostrar el borde del próximo slide)

```css
.carousel-wrapper {
  overflow: hidden;
}

.carousel {
  padding: 0 2rem;
}

.carousel-item {
  flex: 0 0 calc(100% - 4rem);
}
```

---

## Lista de Verificación de Accesibilidad

- Agrega `role="region"` y `aria-label` al wrapper del carousel.
- Agrega `role="group"` y `aria-roledescription="slide"` a cada item.
- Cada slide debe tener un heading visible o `aria-label` que lo identifique.
- Los puntos `::scroll-marker` son nativamente enfocables — no los ocultes de la navegación por teclado.

```html
<div class="carousel-wrapper">
  <div class="carousel" role="region" aria-label="Productos destacados">
    <div class="carousel-item" role="group" aria-roledescription="slide" aria-label="Slide 1 de 3">
      <!-- contenido -->
    </div>
  </div>
</div>
```

---

## Errores Comunes

| Error | Solución |
|-------|----------|
| Olvidar `content: ''` en `::scroll-marker` | Sin él el pseudo-elemento no se renderiza |
| Falta `position: relative` en el wrapper | Sin él los botones `::scroll-button` flotan fuera de la pantalla |
| Usar `::scroll-button(left)` / `::scroll-button(right)` | Los valores válidos son `prev` y `next` (y `up`/`down` para vertical) |
| Aplicar `scroll-snap-type` al item en vez del contenedor | Pertenece al contenedor de scroll |
| Agregar `display: flex` al grupo de marcadores | El layout del grupo de marcadores lo gestiona el navegador |

---

## Referencia Rápida de Propiedades

```
scroll-snap-type: x mandatory     → snap horizontal
scroll-snap-type: y mandatory     → snap vertical
scroll-snap-align: center         → alinear item al centro
scroll-snap-align: start          → alinear item al inicio
scroll-marker-group: after        → puntos debajo del carousel
scroll-marker-group: before       → puntos encima del carousel
scroll-marker-group: inline-end   → puntos a la derecha (vertical)
::scroll-marker                   → pseudo-elemento de cada punto
::scroll-marker:target-current    → punto activo
::scroll-button(prev)             → botón izquierdo/anterior
::scroll-button(next)             → botón derecho/siguiente
::scroll-button(up)               → botón arriba (vertical)
::scroll-button(down)             → botón abajo (vertical)
:disabled                         → estado del botón al llegar al límite
```
