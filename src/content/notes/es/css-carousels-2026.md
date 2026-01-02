---
draft: false
title: "CSS Carousels 2026: Scroll Markers Nativos Por Fin Aquí"
description: "Construye carruseles con CSS puro usando scroll-marker, scroll-button y scroll snap. No se necesitan librerías JavaScript para puntos de paginación y navegación."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
coverAlt: CSS Carousels 2026
selfHealing: csscrs
lang: es
category: Development
author: giorgio-saud
collections:
  - css
  - frontend
tags:
  - css
  - carousels
  - scroll-snap
  - 2026
---

## CSS Carousels: Finalmente Sin JavaScript

Durante años, los carruseles significaban librerías JavaScript, consideraciones complejas de accesibilidad y debates sobre tamaño de bundle. En 2026, CSS puede manejarlo nativamente con los pseudo-elementos `::scroll-marker` y `::scroll-button`.

## Soporte de Navegadores (2026)

| Navegador | Soporte | Notas |
|-----------|---------|-------|
| Chrome 135+ | Completo | Desde Marzo 2025 |
| Edge 135+ | Completo | Basado en Chromium |
| Firefox | Parcial | Habilitado con flag |
| Safari 18.2+ | Completo | Desde Dic 2025 |

**Soporte global: ~75%** (Creciendo rápidamente)

Considera mejora progresiva - scroll snap funciona en todos lados, los markers añaden UX mejorada.

## La Base: Scroll Snap

Antes de los markers, necesitas scroll snapping:

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1rem;
}

.carousel-item {
  flex: 0 0 100%;
  scroll-snap-align: center;
}
```

Esto te da un carrusel deslizable básico. Ahora agreguemos navegación nativa.

## Scroll Markers: Puntos de Paginación

El pseudo-elemento `::scroll-marker` crea indicadores de paginación:

```css
.carousel {
  scroll-marker-group: after; /* Mostrar markers después del carrusel */
}

.carousel-item::scroll-marker {
  content: '';
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
}

.carousel-item::scroll-marker:target-current {
  background: #3b82f6;
  transform: scale(1.2);
}
```

`:target-current` estiliza el marker para el item actualmente visible.

## Scroll Buttons: Navegación Anterior/Siguiente

Botones de scroll nativos para navegación con flechas:

```css
.carousel::scroll-button(prev) {
  content: '←';
  position: absolute;
  left: 0;
  /* Estilos para botón anterior */
}

.carousel::scroll-button(next) {
  content: '→';
  position: absolute;
  right: 0;
  /* Estilos para botón siguiente */
}

/* Ocultar cuando no se puede hacer más scroll */
.carousel::scroll-button(prev):disabled,
.carousel::scroll-button(next):disabled {
  opacity: 0.3;
  pointer-events: none;
}
```

## Ejemplo Completo de Carrusel

```css
.carousel-wrapper {
  position: relative;
}

.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  gap: 1rem;
  padding: 1rem;

  /* Habilitar scroll markers */
  scroll-marker-group: after;

  /* Ocultar scrollbar */
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.carousel-item {
  flex: 0 0 calc(100% - 2rem);
  scroll-snap-align: center;
  border-radius: 8px;
  background: #f1f5f9;
  padding: 2rem;
}

/* Puntos de paginación */
.carousel-item::scroll-marker {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 0 4px;
  border-radius: 50%;
  background: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.carousel-item::scroll-marker:target-current {
  background: #3b82f6;
  transform: scale(1.3);
}

.carousel-item::scroll-marker:hover:not(:target-current) {
  background: #94a3b8;
}

/* Botones de navegación */
.carousel::scroll-button(prev),
.carousel::scroll-button(next) {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;
}

.carousel::scroll-button(prev) {
  content: '‹';
  left: 8px;
}

.carousel::scroll-button(next) {
  content: '›';
  right: 8px;
}

.carousel::scroll-button(prev):disabled,
.carousel::scroll-button(next):disabled {
  opacity: 0;
  pointer-events: none;
}
```

## Carrusel Multi-Item

Mostrar múltiples items a la vez:

```css
.multi-carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-marker-group: after;
}

.multi-carousel-item {
  flex: 0 0 calc(33.333% - 1rem); /* 3 items visibles */
  scroll-snap-align: start;
}

@media (max-width: 768px) {
  .multi-carousel-item {
    flex: 0 0 calc(50% - 0.5rem); /* 2 items en tablet */
  }
}

@media (max-width: 480px) {
  .multi-carousel-item {
    flex: 0 0 100%; /* 1 item en móvil */
  }
}
```

## Carrusel Vertical

Funciona en el eje Y también:

```css
.vertical-carousel {
  display: flex;
  flex-direction: column;
  height: 400px;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-marker-group: inline-end; /* Markers a la derecha */
}

.vertical-carousel-item {
  flex: 0 0 100%;
  scroll-snap-align: start;
}

.vertical-carousel-item::scroll-marker {
  content: '';
  display: block;
  width: 10px;
  height: 10px;
  margin: 4px 0;
  border-radius: 50%;
  background: #cbd5e1;
}
```

## Mejora Progresiva

Para navegadores sin soporte de scroll marker:

```css
/* Experiencia base - siempre funciona */
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

/* Experiencia mejorada cuando hay soporte */
@supports (scroll-marker-group: after) {
  .carousel {
    scroll-marker-group: after;
  }

  .carousel-item::scroll-marker {
    content: '';
    /* ... estilos del marker */
  }

  /* Ocultar puntos de fallback JS */
  .js-pagination {
    display: none;
  }
}
```

## Consideraciones de Accesibilidad

Los carruseles CSS obtienen mejoras de accesibilidad gratis:

1. **Navegación por teclado** - Las flechas hacen scroll entre items
2. **Gestión de foco** - Los markers son enfocables por defecto
3. **Lectores de pantalla** - Semántica nativa para navegación

Mejora con ARIA donde sea necesario:

```html
<div class="carousel" role="region" aria-label="Productos destacados">
  <div class="carousel-item" role="group" aria-roledescription="slide">
    <!-- Contenido -->
  </div>
</div>
```

## Comparación: Antes vs Después

### Antes (JavaScript)

```html
<div class="carousel" data-carousel>
  <div class="carousel-track">...</div>
  <div class="carousel-dots"></div>
  <button class="prev">←</button>
  <button class="next">→</button>
</div>
<script src="carousel.js"></script> <!-- 15-50KB -->
```

### Después (Solo CSS)

```html
<div class="carousel">
  <div class="carousel-item">...</div>
  <div class="carousel-item">...</div>
</div>
<!-- Cero JavaScript -->
```

## Puntos Clave

1. **Paginación nativa** - `::scroll-marker` crea puntos sin JavaScript
2. **Navegación nativa** - `::scroll-button(prev/next)` para botones de flechas
3. **Estados inteligentes** - `:target-current` y `:disabled` manejan estados activos
4. **Progresivo** - Scroll snap funciona en todos lados, markers mejoran
5. **Accesible** - Soporte integrado de teclado y lector de pantalla

Los carruseles CSS en 2026 eliminan la necesidad de Swiper, Slick y librerías similares para la mayoría de casos de uso. El navegador maneja lo que antes requería cientos de líneas de JavaScript.
