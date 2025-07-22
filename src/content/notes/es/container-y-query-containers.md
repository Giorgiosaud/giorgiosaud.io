---
draft: false
selfHealing: "CQX001"
starred: true
title: "Consultas de contenedor y @container explicadas: cómo las usé en este proyecto"
resume: "Aquí explico cómo utilicé la consulta @container en el rediseño de mi notebook"
image: { src: "container-query", alt: "Animaciones de scroll en CSS" }
publishDate: "2025-02-10 15:15"
category: "development"
author: 000001-jorge-saud
collections: [frontend]
tags: [design-patterns, development, css]
---

Las consultas de contenedor (container queries) son una característica de Baseline 2023, ya disponible en todos los navegadores principales, incluidos Chrome, Edge, Firefox y Safari.

- [Aquí está la especificación](https://developer.mozilla.org/en-US/docs/Web/CSS/@container)

> Esta característica está marcada como [recién disponible].

## ¿Qué son las consultas de contenedor?

La regla `@container` nos permite crear componentes realmente responsivos. A diferencia de las consultas `@media`, que responden al tamaño del viewport, las consultas de contenedor permiten que los componentes se adapten según el tamaño de su contenedor padre. Esto significa que un componente puede verse bien sin importar dónde se coloque, siempre que esté bien configurado.

---

## Tipos de contenedores

Para usar consultas de contenedor, primero debes definir un contenedor. Hay tres tipos principales:

- **Contenedores de tamaño**: Responden al ancho, alto o ambos del contenedor.
- **Contenedores de tamaño en línea (inline-size)**: Responden al tamaño en línea (usualmente horizontal) del contenedor. Es el más común y ampliamente soportado.
- **Contenedores de estilo**: Responden a valores de estilos computados (menos comunes, pero útiles en escenarios avanzados).

Defines un contenedor usando la propiedad `container-type` o la abreviatura `container`:

```css
/* Abreviado: nombre/tipo */
.component-wrapper {
  container: hero/inline-size;
}

/* O solo el tipo */
.component-wrapper {
  container-type: inline-size;
}
```

---

## Nombres de contenedor

Nombrar tu contenedor te permite apuntarlo específicamente en tus consultas:

```css
.container {
  container-name: sidebar;
  container-type: inline-size;
}
```

O con la abreviatura:

```css
.container {
  container: sidebar/inline-size;
}
```

---

## Sintaxis de las consultas de contenedor

Las consultas de contenedor son similares a las consultas de medios, pero apuntan al contenedor en vez del viewport.

```css
@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}
```

Si usas un contenedor nombrado:

```css
@container sidebar (min-width: 400px) {
  .sidebar-content {
    display: flex;
  }
}
```

Puedes usar operadores lógicos como `and`, `or` y `not`:

```css
@container (min-width: 400px) and (max-width: 800px) {
  /* estilos */
}
```

---

## Características soportadas en las consultas

Puedes consultar las siguientes características del contenedor:

- `width`, `min-width`, `max-width`
- `height`, `min-height`, `max-height`
- `inline-size`, `min-inline-size`, `max-inline-size`
- `block-size`, `min-block-size`, `max-block-size`
- `aspect-ratio`, `orientation`

Ejemplo:

```css
@container (min-inline-size: 600px) {
  .gallery {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Unidades de contenedor

Las consultas de contenedor introducen nuevas unidades relativas al contenedor:

- `cqw`, `cqh`, `cqi`, `cqb`, `cqmin`, `cqmax`

Por ejemplo:

```css
.card {
  width: 80cqw; /* 80% del ancho del contenedor */
  height: 50cqh; /* 50% de la altura del contenedor */
}
```

---

## Anidamiento y consultas agnósticas

Puedes anidar consultas de contenedor y usarlas sin especificar un nombre, haciéndolas más genéricas. Esto es útil para componentes reutilizables.

```css
@container (min-width: 500px) {
  .profile {
    flex-direction: row;
  }
}
```

---

## Ejemplo práctico

Supón que tienes un componente hero que debe cambiar su layout según el tamaño de su contenedor:

```css
.hero-wrapper {
  container: hero/inline-size;
}

@container hero (min-width: 48ch) {
  .hero__buttons {
    flex-direction: row;
    justify-content: flex-start;
  }
}
```

Si mueves `.hero-wrapper` a un padre más pequeño, el layout se adaptará automáticamente.

---

## ¿Por qué usar consultas de contenedor?

Con las consultas de contenedor, el tamaño del contenedor padre determina cómo se estiliza el componente. Esto es un gran cambio respecto a las consultas de medios, que solo consideran el viewport. Por ejemplo, si colocas tu componente `hero` dentro de un `aside`, se renderizará diferente que si está en un contenedor de ancho completo. Esta flexibilidad permite crear componentes más modulares y reutilizables.

---

**En resumen:**  
Las consultas de contenedor permiten que los componentes sean realmente responsivos a su contexto, no solo al viewport. Definiendo contenedores y usando reglas `@container`, puedes crear layouts flexibles y adaptativos que funcionan en cualquier parte de tu diseño. La especificación soporta contenedores nombrados y sin nombre, múltiples tipos de contenedor, operadores lógicos y nuevas unidades, lo que la convierte en una herramienta poderosa para la arquitectura CSS moderna.

### P.D.
También puedes usar la sintaxis de rango en las consultas de contenedor, igual que con `@media`:

```css
@media (50em > width > 30em) {
  /* … */
}
```

Y en una consulta de contenedor, se ve así:

```css
@container (50em > width > 30em) {
  /* … */
}
```

Esto sigue las mismas reglas que las definiciones anteriores.