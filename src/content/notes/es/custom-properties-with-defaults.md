---
draft: false
selfHealing: LVCSTP
starred: false
title: Propiedades CSS con valores predeterminados
description: Aprende a manejar valores predeterminados en variables CSS usando la técnica clásica "pseudo-privada" y la moderna regla @property.
publishDate: 2026-01-01T12:00:00.000Z
category: development
author: 000001-jorge-saud
collections:
  - frontend
tags:
  - css
  - tips
  - design-patterns
cover: ../../../assets/images/custom-properties-with-defaults.jpeg
coverAlt: CSS Private and public props
---

En 2021, Lea Verou compartió un patrón brillante para manejar valores predeterminados en variables CSS. Ahora, en 2026, aunque ese patrón sigue siendo útil, también tenemos la poderosa regla `@property` como una característica estándar. Veamos las formas "Clásica" y "Moderna" de manejar los valores predeterminados de los componentes.

## La Forma "Clásica": El Patrón `--_`

Esta técnica resuelve los problemas de especificidad utilizando una variable interna "privada".

### El Problema

Si definimos el estilo de un componente usando una variable con un fallback en múltiples lugares:

```css
.button {
  background: var(--bg, black);
  border-color: var(--bg, black);
}
```

Estamos repitiendo `var(--bg, black)`. Si queremos cambiar el valor predeterminado a `blue`, tenemos que editarlo en todas partes.

### La Solución: Variables Pseudo-Privadas

Creamos una nueva variable, con el prefijo `_` (guion bajo), que actúa como nuestra fuente de verdad interna.

```css
.button {
  /* Variable interna = Variable pública O Predeterminado */
  --_bg: var(--bg, black);

  /* Usamos la variable interna en todas partes */
  background: var(--_bg);
  border: 1px solid var(--_bg);
}
```

Para personalizarlo, el usuario simplemente configura la variable pública:

```css
.button.red {
  --bg: red;
}
```

Esto actúa como un **Constructor** para tu componente CSS. Es ligero, no requiere registro global y funciona perfectamente para el alcance local.

## La Forma "Moderna": usando `@property`

Con el soporte generalizado de `@property`, ahora podemos definir variables que _realmente_ tienen valores predeterminados, tipos e incluso son animables.

En lugar de necesitar una variable intermedia "privada", registramos la propiedad pública directamente.

```css
@property --button-bg {
  syntax: "<color>";
  initial-value: black;
  inherits: true;
}

.button {
  /* No es necesario var(--button-bg, black) - ¡el fallback es nativo! */
  background: var(--button-bg);
  border: 1px solid var(--button-bg);

  /* Plus: ¡Ahora podemos transicionar esta variable! */
  transition: --button-bg 0.3s;
}
```

#### ¿Por qué usar `@property`?

1.  **Seguridad de Tipos:** El navegador sabe que `--button-bg` es un `<color>`. Si alguien configura `--button-bg: 20px`, es inválido y vuelve a `black` (el valor inicial), en lugar de romper la UI.
2.  **Animación:** Puedes hacer una transición de `black` a `red` suavemente porque el navegador sabe cómo interpolar colores. Las variables estándar saltan de un valor a otro.
3.  **Código más limpio:** No hay necesidad del truco `--_` si estás de acuerdo con el registro global.

#### ¿Cuál elegir?

- **Usa el patrón `--_`** para componentes locales simples donde no quieres contaminar el espacio de nombres global con propiedades registradas o cuando necesitas valores predeterminados "suaves" que cambien según el contexto.

- **Usa `@property`** cuando necesites **animación**, tipos estrictamente aplicados o estés construyendo un Sistema de Diseño robusto donde las propiedades estén bien documentadas y sean globalmente únicas.

### Mi Recomendación: La Configuración Profesional

Para llevar tu arquitectura CSS al siguiente nivel, recomiendo combinar estos patrones con una configuración base sólida:

1.  **Variables Globales en `:root`:** Define tus design tokens (colores, unidades de espaciado, escala) en un archivo base con scope `:root`.
2.  **Organiza con `@layer`:** Recomiendo encarecidamente usar la regla `@layer` para gestionar la cascada de CSS. Ahora que tiene el estatus de **Baseline Widely available**, es la mejor forma de manejar el contexto y los overrides, especialmente en plataformas o frameworks que inyectan estilos a muchos niveles. Puedes leer más en mi post: [Organiza Estilos en CSS con @layer Eficazmente](/notebook/LYRCSS).
3.  **Espaciado y Tamaños Consistentes:** Usa una unidad base `--spacing` y calcula tus paddings y margins a partir de ella (ej. `padding: calc(var(--spacing) * 4)`). Esto garantiza una armonía visual en todo el proyecto.
4.  **Tipografía Fluida con `clamp()`:** No uses tamaños de fuente estáticos. Usa `clamp()` para crear una tipografía fluida que escale perfectamente entre móvil y escritorio sin necesidad de docenas de media queries.

```css
/* 1. Configuración Global con @layer y tokens en :root */
@layer tokens, base, components;

@layer tokens {
  :root {
    --spacing: 0.25rem;
    /* 2. Tipografía Fluida con clamp() */
    --font-size-base: clamp(1rem, 1.2vw, 1.125rem);
    --color-primary: #3b82f6;
    --color-text: #1f2937;
  }
}

@layer components {
  .card {
    /* 3. Variables pseudo-privadas para la lógica del componente */
    --_bg: var(--card-bg, #ffffff);
    /* 4. Espaciado consistente usando calc() */
    --_padding: calc(var(--spacing) * 6);

    background: var(--_bg);
    padding: var(--_padding);
    font-size: var(--font-size-base);
    color: var(--color-text);
    border: 1px solid var(--color-primary);
    border-radius: calc(var(--spacing) * 2);

    /* Habilitar transición para la propiedad personalizada */
    transition: --card-bg 0.3s ease;
  }
}

/* 5. @property registrada para transiciones suaves */
@property --card-bg {
  syntax: "<color>";
  initial-value: #ffffff;
  inherits: false;
}

.card:hover {
  --card-bg: #f3f4f6;
}
```

Al combinar el patrón `--_` de Lea para componentes con un sistema global en `:root`, obtienes lo mejor de ambos mundos: consistencia global y flexibilidad local. ¡De hecho, utilicé exactamente esta arquitectura para construir este sitio web!

> Actualizado para 2026. Basado en [Custom properties with defaults: 3+1 strategies](https://lea.verou.me/blog/2021/10/custom-properties-with-defaults/)
