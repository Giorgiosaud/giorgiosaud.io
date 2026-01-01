---
draft: false
selfHealing: "LVCSTP"
starred: false
title: Propiedades Personalizadas Modernas con Valores Predeterminados
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
---

## Introducción

En 2021, Lea Verou compartió un patrón brillante para manejar valores predeterminados en variables CSS. Ahora, en 2026, aunque ese patrón sigue siendo útil, también tenemos la poderosa regla `@property` como una característica estándar. Veamos las formas "Clásica" y "Moderna" de manejar los valores predeterminados de los componentes.

## La Forma "Clásica": El Patrón `--_`

Esta técnica resuelve las guerras de especificidad utilizando una variable interna "privada".

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

## La Forma "Moderna": `@property`

Con el soporte generalizado de `@property`, ahora podemos definir variables que *realmente* tienen valores predeterminados, tipos e incluso son animables.

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

### ¿Por qué usar `@property`?

1.  **Seguridad de Tipos:** El navegador sabe que `--button-bg` es un `<color>`. Si alguien configura `--button-bg: 20px`, es inválido y vuelve a `black` (el valor inicial), en lugar de romper la UI.
2.  **Animación:** Puedes hacer una transición de `black` a `red` suavemente porque el navegador sabe cómo interpolar colores. Las variables estándar saltan de un valor a otro.
3.  **Código más limpio:** No hay necesidad del truco `--_` si estás de acuerdo con el registro global.

### ¿Cuál elegir?



*   **Usa el patrón `--_`** para componentes locales simples donde no quieres contaminar el espacio de nombres global con propiedades registradas o cuando necesitas valores predeterminados "suaves" que cambien según el contexto.

*   **Usa `@property`** cuando necesites **animación**, tipos estrictamente aplicados o estés construyendo un Sistema de Diseño robusto donde las propiedades estén bien documentadas y sean globalmente únicas.



## Mi Recomendación: La Configuración Profesional



Para llevar tu arquitectura CSS al siguiente nivel, recomiendo combinar estos patrones con una configuración base sólida:



1.  **Variables Globales en `:root`:** Define tus design tokens (colores, unidades de espaciado, escala) en un archivo base con scope `:root` (idealmente usando `@layer` de CSS para un mejor control de la cascada).

2.  **Espaciado y Tamaños Consistentes:** Usa una unidad base `--spacing` y calcula tus paddings y margins a partir de ella (ej. `padding: calc(var(--spacing) * 4)`). Esto garantiza una armonía visual en todo el proyecto.

3.  **Tipografía Fluida con `clamp()`:** No uses tamaños de fuente estáticos. Usa `clamp()` para crear una tipografía fluida que escale perfectamente entre móvil y escritorio sin necesidad de docenas de media queries.



```css



:root {



  --spacing: 0.25rem;



  --font-size-base: clamp(1rem, 1.2vw, 1.125rem);



}



```







Al combinar el patrón `--_` de Lea para componentes con un sistema global en `:root`, obtienes lo mejor de ambos mundos: consistencia global y flexibilidad local. ¡De hecho, utilicé exactamente esta arquitectura para construir este sitio web!







> Actualizado para 2026. Basado en [Custom properties with defaults: 3+1 strategies](https://lea.verou.me/blog/2021/10/custom-properties-with-defaults/)




