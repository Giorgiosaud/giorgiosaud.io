---
draft: false
title: "CSS Scroll Animations 2026: View Timeline Ahora Estable"
description: "Las animaciones impulsadas por scroll están listas para producción. Aprende view timeline, scroll timeline y animation-range para efectos sin JavaScript."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
coverAlt: CSS Scroll Animations 2026
selfHealing: cssscr
lang: es
category: Development
author: giorgio-saud
collections:
  - css
  - frontend
tags:
  - css
  - scroll-animations
  - animation
  - 2026
---

## Scroll Animations: Ahora Listas para Producción

Lo que era experimental en 2024 ahora es estable en 2026. Las animaciones impulsadas por scroll tienen amplio soporte de navegadores y están listas para producción sin intersection observers de JavaScript.

## Soporte de Navegadores (2026)

| Navegador | Soporte |
|-----------|---------|
| Chrome 115+ | Completo |
| Edge 115+ | Completo |
| Firefox 126+ | Completo |
| Safari 18+ | Completo |

**Soporte global: ~90%**

## Los Dos Tipos de Timeline

### 1. Scroll Timeline
La animación progresa mientras el usuario hace scroll:

```css
.progress-bar {
  animation: grow linear;
  animation-timeline: scroll();
}

@keyframes grow {
  from { width: 0%; }
  to { width: 100%; }
}
```

### 2. View Timeline
La animación se activa cuando el elemento entra/sale del viewport:

```css
.fade-in {
  animation: fadeIn linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## Animation Range Explicado

Controla exactamente cuándo las animaciones comienzan y terminan:

```css
.element {
  animation-timeline: view();
  animation-range: entry 10% cover 50%;
  /* Inicio: cuando 10% del elemento ha entrado
     Fin: cuando el elemento cubre 50% del viewport */
}
```

Keywords de range:
- `entry` - Elemento entrando al viewport
- `exit` - Elemento saliendo del viewport
- `cover` - Elemento cubriendo el viewport
- `contain` - Viewport conteniendo el elemento

## Ejemplo Real de Este Sitio

```css
main section.scroll-animated {
  animation: fadeSlideIn 1s ease both;
  animation-timeline: view();
  animation-range: entry 10% cover 40%;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Sin intersection observers, sin JavaScript - CSS puro.

## Avanzado: Scroll Timelines con Nombre

```css
.scroll-container {
  overflow-y: scroll;
  scroll-timeline: --container-scroll y;
}

.animated-element {
  animation: slide linear;
  animation-timeline: --container-scroll;
}
```

## Puntos Clave

1. **No se necesita JavaScript** - Reemplaza intersection observers con CSS
2. **Dos timelines** - `scroll()` para scroll de página, `view()` para visibilidad de elemento
3. **Control preciso** - `animation-range` para timing exacto
4. **Listo para producción** - 90%+ soporte de navegadores en 2026
5. **Performante** - Animaciones aceleradas por GPU, en hilo del compositor

Las animaciones impulsadas por scroll eliminan categorías enteras de código JavaScript mientras proporcionan animaciones más suaves y performantes.
