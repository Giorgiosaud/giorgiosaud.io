---
draft: false
title: "CSS Custom Properties 2026: @property Se Vuelve Mainstream"
description: "Las propiedades personalizadas CSS con @property ahora tienen soporte universal. Aprende variables tipadas, capacidades de animación y control de herencia para sistemas de diseño robustos."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
coverAlt: CSS Custom Properties 2026
selfHealing: csscst
lang: es
category: Development
author: giorgio-saud
collections:
  - css
  - frontend
tags:
  - css
  - custom-properties
  - design-systems
  - 2026
---

## CSS Custom Properties: @property Es Ahora Universal

Las propiedades personalizadas CSS (`--variable`) existen desde 2017, pero `@property` - que agrega tipos, valores por defecto y animación - era experimental hasta hace poco. En 2026, tiene soporte universal y cambia cómo construimos sistemas de diseño.

## Soporte de Navegadores (2026)

| Navegador | Soporte | Notas |
|-----------|---------|-------|
| Chrome 85+ | Completo | Desde Ago 2020 |
| Edge 85+ | Completo | Basado en Chromium |
| Firefox 128+ | Completo | Desde Julio 2024 |
| Safari 15.4+ | Completo | Desde Marzo 2022 |

**Soporte global: ~95%**

No más polyfills o fallbacks necesarios para la mayoría de audiencias.

## El Cambio de Juego: @property

### Antes: Variables Sin Tipo

```css
:root {
  --primary-color: #3b82f6;
  --spacing: 16px;
  --opacity: 0.8;
}

/* Problemas:
   1. No se pueden animar propiedades personalizadas
   2. Sin verificación de tipo - cualquier valor aceptado
   3. Sin fallback para problemas de herencia
*/
```

### Después: Variables Tipadas con @property

```css
@property --primary-color {
  syntax: '<color>';
  inherits: true;
  initial-value: #3b82f6;
}

@property --spacing {
  syntax: '<length>';
  inherits: true;
  initial-value: 16px;
}

@property --opacity {
  syntax: '<number>';
  inherits: false;
  initial-value: 0.8;
}
```

## Los Tres Poderes de @property

### 1. Seguridad de Tipos con `syntax`

Define qué valores son válidos:

```css
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@property --percentage {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

@property --size {
  syntax: '<length> | <percentage>';
  inherits: true;
  initial-value: 100%;
}

/* Los valores inválidos se ignoran */
.element {
  --angle: red; /* Ignorado - no es un ángulo */
  --angle: 45deg; /* Funciona */
}
```

Tipos de syntax disponibles:
- `<length>` - px, rem, em, etc.
- `<number>` - valores numéricos
- `<percentage>` - valores porcentuales
- `<color>` - cualquier valor de color
- `<angle>` - deg, rad, turn
- `<time>` - s, ms
- `<url>` - valores url()
- `<integer>` - números enteros
- `<custom-ident>` - strings de keywords
- `*` - cualquier valor (comportamiento por defecto)

### 2. Soporte de Animación

Antes de `@property`, las propiedades personalizadas no podían animarse:

```css
/* SIN @property - salta instantáneamente */
.card {
  --bg-color: blue;
  background: var(--bg-color);
  transition: --bg-color 0.3s; /* No funciona */
}

.card:hover {
  --bg-color: red; /* Cambio instantáneo, sin transición */
}
```

Con `@property`:

```css
@property --bg-color {
  syntax: '<color>';
  inherits: false;
  initial-value: blue;
}

.card {
  background: var(--bg-color);
  transition: --bg-color 0.3s ease;
}

.card:hover {
  --bg-color: red; /* ¡Transición de color suave! */
}
```

### 3. Control de Herencia

Controla si los valores se propagan hacia abajo:

```css
@property --theme-color {
  syntax: '<color>';
  inherits: true; /* Los hijos heredan esto */
  initial-value: #3b82f6;
}

@property --local-spacing {
  syntax: '<length>';
  inherits: false; /* Cada elemento usa initial-value */
  initial-value: 1rem;
}
```

## Patrones del Mundo Real

### Patrón 1: Gradientes Animados

```css
@property --gradient-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

.animated-gradient {
  background: linear-gradient(
    var(--gradient-angle),
    #3b82f6,
    #8b5cf6
  );
  animation: rotate-gradient 3s linear infinite;
}

@keyframes rotate-gradient {
  to {
    --gradient-angle: 360deg;
  }
}
```

### Patrón 2: Indicadores de Progreso

```css
@property --progress {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

.progress-bar {
  background: linear-gradient(
    90deg,
    #22c55e var(--progress),
    #e5e7eb var(--progress)
  );
  transition: --progress 0.5s ease-out;
}

.progress-bar[data-value="25"] { --progress: 25%; }
.progress-bar[data-value="50"] { --progress: 50%; }
.progress-bar[data-value="75"] { --progress: 75%; }
.progress-bar[data-value="100"] { --progress: 100%; }
```

### Patrón 3: Sistema de Temas

```css
@property --color-primary {
  syntax: '<color>';
  inherits: true;
  initial-value: #3b82f6;
}

@property --color-secondary {
  syntax: '<color>';
  inherits: true;
  initial-value: #64748b;
}

@property --radius {
  syntax: '<length>';
  inherits: true;
  initial-value: 0.5rem;
}

/* Variaciones de tema */
.theme-rounded {
  --radius: 1rem;
}

.theme-sharp {
  --radius: 0;
}

.theme-warm {
  --color-primary: #f59e0b;
  --color-secondary: #92400e;
}
```

### Patrón 4: Escala de Espaciado Responsiva

```css
@property --space-unit {
  syntax: '<length>';
  inherits: true;
  initial-value: 4px;
}

:root {
  --space-1: calc(var(--space-unit) * 1);  /* 4px */
  --space-2: calc(var(--space-unit) * 2);  /* 8px */
  --space-4: calc(var(--space-unit) * 4);  /* 16px */
  --space-8: calc(var(--space-unit) * 8);  /* 32px */
}

@media (min-width: 768px) {
  :root {
    --space-unit: 5px; /* Toda la escala se ajusta */
  }
}
```

## Combinando con Container Queries

```css
@property --card-padding {
  syntax: '<length>';
  inherits: false;
  initial-value: 1rem;
}

.card-container {
  container: card / inline-size;
}

.card {
  padding: var(--card-padding);
  transition: --card-padding 0.2s ease;
}

@container card (width > 400px) {
  .card {
    --card-padding: 2rem;
  }
}
```

## Estrategias de Fallback

Para el ~5% sin `@property`:

```css
/* Define @property para navegadores con soporte */
@property --accent {
  syntax: '<color>';
  inherits: true;
  initial-value: #3b82f6;
}

/* El fallback funciona en todos lados */
.element {
  --accent: #3b82f6;
  background: var(--accent);

  /* La animación solo funciona con soporte de @property */
  transition: --accent 0.3s;
}
```

## Errores Comunes

### Error 1: Olvidar initial-value

```css
/* ❌ Falta initial-value */
@property --spacing {
  syntax: '<length>';
  inherits: true;
}

/* ✅ Siempre proporciona initial-value */
@property --spacing {
  syntax: '<length>';
  inherits: true;
  initial-value: 0px;
}
```

### Error 2: Tipo de Syntax Incorrecto

```css
/* ❌ Intentando usar resultado de calc como <integer> */
@property --columns {
  syntax: '<integer>';
  inherits: false;
  initial-value: 3;
}

.grid {
  --columns: calc(var(--base) / 2); /* No funciona - calc devuelve number */
}

/* ✅ Usa <number> para valores calculados */
@property --columns {
  syntax: '<number>';
  inherits: false;
  initial-value: 3;
}
```

## Puntos Clave

1. **Soporte universal** - `@property` funciona en 95%+ de navegadores
2. **Seguridad de tipos** - `syntax` valida valores a nivel de CSS
3. **Animable** - Las propiedades personalizadas ahora pueden transicionar suavemente
4. **Control de herencia** - Elige si los valores se propagan
5. **Sistemas de diseño** - Construye theming más robusto y predecible

`@property` transforma las propiedades personalizadas CSS de simple sustitución de texto a un sistema de tipos apropiado. En 2026, no hay razón para no usarlo en cualquier sistema de diseño no trivial.
