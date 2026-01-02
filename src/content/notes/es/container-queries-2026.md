---
draft: false
title: "Container Queries 2026: Diseño de Componentes Listo para Producción"
description: "Container queries están completamente maduros con 95%+ de soporte de navegadores. Aprende patrones avanzados, style queries y técnicas listas para producción."
publishDate: 2026-01-02
cover: ../../../assets/images/container-query.webp
coverAlt: Ilustración de Container Queries 2026
selfHealing: cntnrq
lang: es
category: Development
author: giorgio-saud
collections:
  - css
  - frontend
tags:
  - css
  - container-queries
  - responsive-design
  - 2026
---

## Container Queries: Completamente Maduros en 2026

En 2023, container queries estaban "recién disponibles." En 2026, están listos para producción con **95%+ de soporte global de navegadores**. No más advertencias, no más fallbacks necesarios para la mayoría de casos.

Esta nota cubre qué ha cambiado y los patrones avanzados que ahora puedes usar con confianza.

## Estado del Soporte de Navegadores

| Navegador | Soporte | Notas |
|-----------|---------|-------|
| Chrome 105+ | Completo | Desde Sept 2022 |
| Edge 105+ | Completo | Desde Sept 2022 |
| Firefox 110+ | Completo | Desde Feb 2023 |
| Safari 16+ | Completo | Desde Sept 2022 |

**Soporte global: ~96%** (Can I Use, Ene 2026)

Ahora puedes usar container queries sin detección de características o fallbacks para la mayoría de audiencias.

## El Concepto Central (Repaso Rápido)

```css
/* 1. Definir el contenedor */
.card-wrapper {
  container: card / inline-size;
}

/* 2. Consultar el contenedor */
@container card (width > 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

Los componentes responden a su contenedor, no al viewport. Este es el cambio fundamental respecto a `@media` queries.

## Qué Hay de Nuevo en 2026

### Style Queries (Ahora Estables)

Consulta valores CSS calculados, no solo dimensiones:

```css
/* Define una propiedad personalizada */
.theme-wrapper {
  container-name: theme;
  --theme: light;
}

/* Consulta el estilo */
@container theme style(--theme: dark) {
  .card {
    background: #1a1a1a;
    color: white;
  }
}
```

Style queries permiten tematización sin alternar clases o JavaScript.

### Unidades de Container Query

Unidades de tamaño relativas al contenedor consultado:

| Unidad | Significado |
|--------|-------------|
| `cqw` | 1% del ancho del contenedor |
| `cqh` | 1% del alto del contenedor |
| `cqi` | 1% del tamaño inline del contenedor |
| `cqb` | 1% del tamaño block del contenedor |
| `cqmin` | Menor de `cqi` o `cqb` |
| `cqmax` | Mayor de `cqi` o `cqb` |

```css
.responsive-text {
  font-size: clamp(1rem, 4cqi, 2rem);
  /* La fuente escala con el contenedor, no el viewport */
}
```

## Patrones de Producción

### Patrón 1: Cards Autocontenidas

Cards que se adaptan donde sea que se coloquen:

```css
.card-container {
  container: card / inline-size;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@container card (width > 300px) {
  .card {
    flex-direction: row;
    align-items: center;
  }

  .card-image {
    flex: 0 0 40%;
  }
}

@container card (width > 500px) {
  .card {
    padding: 2rem;
  }

  .card-title {
    font-size: 1.5rem;
  }
}
```

### Patrón 2: Navegación Responsiva

Navegación que se adapta a ubicación en sidebar o header:

```css
.nav-container {
  container: nav / inline-size;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@container nav (width > 600px) {
  .nav-links {
    flex-direction: row;
    gap: 2rem;
  }

  .nav-label {
    display: inline; /* Mostrar etiquetas cuando hay espacio */
  }
}
```

### Patrón 3: Adaptación de Items de Grid

Items de grid que se adaptan al tamaño de su celda:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.grid-item {
  container: item / inline-size;
}

@container item (width < 300px) {
  .item-content {
    /* Layout compacto */
    padding: 0.5rem;
  }

  .item-description {
    display: none;
  }
}

@container item (width >= 300px) {
  .item-content {
    /* Layout completo */
    padding: 1.5rem;
  }
}
```

## Style Queries en Práctica

### Cambio de Tema

```css
:root {
  --color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-scheme: dark;
  }
}

.themed-section {
  container-name: themed;
}

@container themed style(--color-scheme: dark) {
  .content {
    background: #0a0a0a;
    color: #fafafa;
  }
}
```

### Feature Flags

```css
.feature-wrapper {
  container-name: features;
  --show-premium: false;
}

.feature-wrapper.premium {
  --show-premium: true;
}

@container features style(--show-premium: true) {
  .premium-badge {
    display: block;
  }

  .premium-features {
    opacity: 1;
  }
}
```

## Combinando con Otro CSS Moderno

### Con CSS Nesting

```css
.card-container {
  container: card / inline-size;

  .card {
    display: flex;
    flex-direction: column;

    @container card (width > 400px) {
      flex-direction: row;
    }
  }
}
```

### Con Subgrid

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.grid-item {
  container: item / inline-size;
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;

  @container item (width > 250px) {
    /* Expandir contenido cuando el item tiene espacio */
  }
}
```

## Consideraciones de Rendimiento

Container queries están altamente optimizados en navegadores 2026:

1. **Containment de layout es automático** - No se necesita trabajo extra
2. **Renderizado incremental** - Solo los contenedores afectados re-renderizan
3. **Acelerado por hardware** - Optimizado para GPU en todos los navegadores principales

Tips:
- Preferir `inline-size` sobre `size` (evita problemas de containment de altura)
- No anidar contenedores más de 2-3 niveles de profundidad
- Usar unidades de container query para sizing fluido

## Migración desde Media Queries

Antes (basado en viewport):

```css
@media (min-width: 768px) {
  .card {
    flex-direction: row;
  }
}
```

Después (basado en contenedor):

```css
.card-wrapper {
  container: card / inline-size;
}

@container card (width > 400px) {
  .card {
    flex-direction: row;
  }
}
```

El componente ahora funciona en cualquier contexto - sidebar, modal, contenido principal.

## Puntos Clave

1. **Listo para producción** - 96% soporte de navegadores, no se necesitan fallbacks
2. **Style queries** - Consulta valores CSS, no solo dimensiones
3. **Unidades de contenedor** - `cqi`, `cqw` para sizing relativo al contenedor
4. **Pensamiento de componentes** - Componentes poseen su comportamiento responsivo
5. **Sin JavaScript** - Adaptación de componentes con CSS puro

Container queries cambian fundamentalmente cómo construimos interfaces responsivas. En 2026, no hay razón para no usarlos en cada componente que necesite adaptarse a su contexto.
