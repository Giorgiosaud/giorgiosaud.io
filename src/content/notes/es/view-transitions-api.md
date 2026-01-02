---
draft: false
title: "View Transitions API: Navegación Fluida entre Páginas"
description: "Aprende a agregar transiciones suaves entre páginas con una sola regla CSS, personalizar animaciones para elementos específicos y crear experiencias tipo SPA sin JavaScript."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
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

## La Mejora Más Simple Que Puedes Hacer

Durante años, las transiciones suaves entre páginas eran exclusivas de SPAs. Las aplicaciones multi-página tenían recargas completas bruscas. La View Transitions API cambia eso con literalmente una regla CSS.

```css
@view-transition {
  navigation: auto;
}
```

Eso es todo. Tu sitio completo ahora tiene transiciones de desvanecimiento suaves entre páginas. Sin JavaScript, sin librerías, sin configuración compleja.

## Cómo Funciona

Cuando navegas entre páginas:

1. El navegador captura una "captura de pantalla" de la página actual
2. La nueva página carga en segundo plano
3. El navegador captura el estado de la nueva página
4. Se reproduce una animación de crossfade entre ellas

Todo automático, todo nativo, todo performante.

## La Implementación

Aquí está el CSS real de este sitio:

```css
@layer root {
  @view-transition {
    navigation: auto;
  }
}
```

Envuelto en un `@layer` para gestión apropiada de la cascada, pero el núcleo es solo esa declaración.

## Personalizando la Transición

El crossfade por defecto es agradable, pero puedes personalizarlo:

```css
/* Personalizar la animación de la página saliente */
::view-transition-old(root) {
  animation: 300ms ease-out both fade-out;
}

/* Personalizar la animación de la página entrante */
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

## Transiciones a Nivel de Elemento

Aquí es donde se pone mágico. Dale a los elementos el mismo `view-transition-name` en diferentes páginas, y se transformarán entre estados:

**Página 1 - Listado de productos:**
```html
<img
  src="product.jpg"
  alt="Producto"
  style="view-transition-name: product-image;"
/>
```

**Página 2 - Detalle del producto:**
```html
<img
  src="product.jpg"
  alt="Producto"
  style="view-transition-name: product-image;"
/>
```

El navegador ve los nombres coincidentes y crea una animación fluida de la imagen moviéndose y redimensionándose entre sus posiciones en cada página.

## Ejemplo Real: Header Persistente

Mantén tu header en su lugar durante las transiciones:

```css
.header {
  view-transition-name: header;
}
```

Ahora el header permanece fijo mientras el resto de la página transiciona. Sin cambio de layout, sin flash.

## El Árbol de Pseudo-Elementos

Durante una transición, el navegador crea un árbol de pseudo-elementos:

```
::view-transition
├── ::view-transition-group(root)
│   ├── ::view-transition-old(root)
│   └── ::view-transition-new(root)
├── ::view-transition-group(header)
│   ├── ::view-transition-old(header)
│   └── ::view-transition-new(header)
└── ...
```

Apunta a cualquiera de estos para animaciones personalizadas:

```css
::view-transition-group(header) {
  animation-duration: 0.5s;
}

::view-transition-old(header) {
  /* El header antiguo se desvanece */
}

::view-transition-new(header) {
  /* El nuevo header aparece */
}
```

## Transiciones de Deslizamiento

Crea efectos de deslizamiento direccionales:

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

## Transiciones Condicionales

Diferentes transiciones para diferentes patrones de navegación:

```css
/* Solo aplicar transiciones para navegaciones del mismo origen */
@view-transition {
  navigation: auto;
  types: slide, fade; /* Tipos personalizados que defines */
}

/* Diferentes animaciones basadas en tipo de navegación */
html:active-view-transition-type(slide) {
  &::view-transition-old(root) {
    animation-name: slide-out;
  }
  &::view-transition-new(root) {
    animation-name: slide-in;
  }
}
```

## Desactivar para Enlaces Específicos

Algunas navegaciones no deberían animar:

```html
<a href="/logout" style="view-transition-name: none;">Cerrar sesión</a>
```

O desactivar programáticamente:

```javascript
// Saltar transición para esta navegación
document.startViewTransition(() => {
  window.location.href = '/pagina-instantanea'
}, { skipTransition: true })
```

## Consideraciones de Rendimiento

Las View Transitions están aceleradas por GPU y optimizadas:

1. **Optimización automática** - El navegador maneja la creación de capas
2. **Sin thrashing de layout** - Funciona en el hilo del compositor
3. **Eficiente en memoria** - Solo captura lo necesario

Pero ten cuidado:
- Páginas muy grandes pueden tener retrasos de captura
- Animaciones complejas pueden bajar frames
- Prueba en dispositivos de gama baja

## Soporte de Navegadores (2026)

A principios de 2026:
- **Chrome 111+**: Soporte completo
- **Edge 111+**: Soporte completo
- **Firefox 129+**: Soporte completo
- **Safari 18+**: Soporte completo

¡La característica ha alcanzado adopción mainstream!

## Degradación Elegante

Para navegadores antiguos, el CSS simplemente se ignora:

```css
@view-transition {
  navigation: auto;
}
/* ↑ ¿Regla-at desconocida? Ignorada. Sin errores. */
```

Los usuarios en navegadores antiguos obtienen navegación instantánea normal - que es lo que siempre han tenido.

## Puntos Clave

1. **Activación de una línea** - `@view-transition { navigation: auto; }`
2. **Cero JavaScript** - CSS puro para transiciones básicas
3. **Morphing de elementos** - Mismo `view-transition-name` = magia
4. **Personalización completa** - Controla cada pseudo-elemento
5. **Mejora progresiva** - Funciona en todas partes, mejorado donde es soportado

View Transitions traen el pulido tipo SPA a apps multi-página. La barrera de entrada es esencialmente cero - agrega una regla CSS y listo. Luego personaliza según necesites.

> **Experiméntalo ahora**: Navega entre páginas en este sitio. ¿Notas el crossfade suave? Eso es View Transitions en acción.
