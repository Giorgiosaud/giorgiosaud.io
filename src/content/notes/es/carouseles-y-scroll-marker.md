---
draft: false
selfHealing: 0JSCRS
title: "Lo que se viene: Carruseles sin JS casi aqui ya en chrome"
description: Cómo construir carruseles interactivos usando solo HTML y CSS, gracias a las nuevas propiedades scroll-marker y scroll-marker-group.
image:
  src: css-carousels
  alt: Ejemplo de carrusel solo con CSS
publishDate: 2025-07-30T16:00:00.000Z
category: development
author: 000001-jorge-saud
collections:
  - frontend
  - css
tags:
  - css
  - carrusel
  - sinjs
  - desarrollo-web
fmContentType: Notas
cover: ../../../assets/images/css-carousels.webp
coverAlt: Ejemplo de carrusel solo con CSS
---

## Carrusel CSS puro con Snap y Dots nativos (¡Sin JS!)

¿Listo para hacer que tu web destaque—sin una sola línea de JavaScript? Vamos a crear un carrusel que no solo es funcional, sino divertido, rápido y preparado para el futuro. Así puedes impresionar a tus usuarios (¡y a ti mismo!) solo con HTML y CSS:

### 🎢 Paso 1: ¡Activa el Snap!

Imagina un carrusel que se desliza suavemente y siempre aterriza perfectamente en cada slide. ¡Eso es lo que hace CSS Scroll Snap! Solo agrega estos estilos:

Voy a usar elementos de lista para el carrusel por mejor accesibilidad.

```css
.carousel {
  /* Limpiar estilos de lista */
  list-style: none;
  padding: 0;

  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scroll-padding: 1rem;
  gap: 1rem;
}
.slide {
  list-style: none;

  flex: 0 0 100%;
  scroll-snap-align: start;
  width: 100%;
  height: 400px;
}

.slide--red {
  background: red;
}
.slide--green {
  background: green;
}
.slide--yellow {
  background: yellow;
}
```

```html
<ul class="carousel">
  <li class="slide slide--red">Slide 1</li>
  <li class="slide slide--green">Slide 2</li>
  <li class="slide slide--yellow">Slide 3</li>
</ul>
```

¡Pruébalo! Desliza o haz scroll y mira cómo cada slide encaja perfectamente. ¡Nada de slides cortados a la mitad!

> **bonus track**: si usas la propiedad ```scroll-snap-stop: always;``` ¡te va a sorprender! porque se detendrá en cada slide aunque deslices rápido

#### ¿Qué hace `scroll-snap-stop: always;`?

Por defecto, si deslizas rápido, el navegador puede saltarse algunos slides y solo encajar en el más cercano. Pero con `scroll-snap-stop: always;`, el navegador recibe la orden: “¡Detente en cada punto de snap, sin importar la velocidad!”

Esto significa que cada slide tiene su momento de protagonismo—¡no se salta ninguno! Es perfecto para carruseles donde quieres que el usuario vea cada elemento, uno por uno, aunque intente pasar rápido. Solo agrégalo a tu CSS de slide:

```css
.slide {
  scroll-snap-stop: always;
}
```

Ahora, cada swipe aterrizará en un slide, haciendo que tu carrusel se sienta aún más controlado y agradable.

> Hasta aquí, si ocultas la barra de scroll con ```scrollbar-width: none;``` ya tienes un carrusel sin JS muy cool, ¡pero queremos más!

### 👀 Paso 2: ¡Deja que el navegador lleve el show! (¡Solo CSS!)

¿Quieres saber qué slide está en el centro? ¡No necesitas atributos HTML especiales—solo CSS! La magia ocurre con las nuevas propiedades y pseudo-elementos `scroll-marker` y `scroll-marker-group`.

Así se hace:

```css
.carousel {
  scroll-marker-group: after;
}
.carousel::scroll-marker-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 1rem;
}
.slide::scroll-marker {
  content: "";
  width: 16px;
  height: 16px;
  background: #ccc;
  border-radius: 20px;
  transition: background 0.3s, width 0.3s;
}
.slide::scroll-marker:target-current {
  background: #0070f3;
  width: 32px;
}
```

¡Eso es todo! Sin HTML extra, sin atributos—solo CSS. Al hacer scroll, el navegador detecta automáticamente el slide activo y actualiza los dots debajo del carrusel.

---

**¿Por qué esto es tan genial?**

- 🚫 Sin JavaScript—solo HTML y CSS
- ⚡ Súper rápido y accesible para todos
- 🪄 Indicadores nativos, sin HTML extra
- 🤩 Moderno, mágico y facilísimo de mantener

¡Pruébalo y mira cómo tu carrusel cobra vida—todo con el poder del CSS moderno! Tus usuarios (¡y tu yo del futuro!) te lo agradecerán.

#### 🎯 ¡Coloca los dots donde quieras! Anchor Positioning al máximo

¿Por qué conformarte con la posición por defecto? Con CSS anchor positioning, tú mandas—pon los dots arriba, abajo, al costado o flotando donde quieras alrededor del carrusel. ¡Libertad creativa y control total!

Así puedes hacer que el grupo de dots aparezca justo donde lo imaginas:

```css
.carousel {
  anchor-name: --carousel;
}
.carousel::scroll-marker-group {
  /* Pon los dots en el centro abajo, ¡o donde quieras! */
  position-anchor: --carousel;
  position: fixed;
  position-visibility: anchors-visible;
  position-area: bottom center;
}
```

¿Quieres los dots al costado? ¿Flotando en una esquina? ¡Solo ajusta el CSS! Anchor positioning te deja adaptar el layout a tus ideas más locas. ([Ver más ejemplos y docs](https://developer.chrome.com/blog/anchor-positioning-api?hl=es-419))

Tip: Combínalo con `flex-direction` para hacer el grupo de dots vertical u horizontal—¡como más te guste!

Vamos a dejar espacio para las flechas:

```css
.carousel {
    margin-inline: 50px;
    padding-inline: 10px;
}
```

Ahora define CSS global para los botones de flecha:

```css
.carousel::scroll-button(*) {
    position: fixed;
    position-anchor: --carousel;
}
```

Y agrega el botón de flecha derecha e izquierda:

```css
.carousel::scroll-button(right) {
    position-area: inline-end center;
    content: "→" / "Siguiente";
}
.carousel::scroll-button(left) {
    position-area: inline-start center;
    content: "←" / "Anterior";
}
```

> Nota: El contenido define el emoji/flecha y el nombre accesible. Puedes usar iconos o fuentes de iconos si prefieres.

## 🚀 ¿Listo para verlo en acción?

¿Tienes curiosidad de cómo se ve todo junto? Mira este ejemplo interactivo y juega con el código:

[Carrusel CSS puro con scroll-marker (CodeSandbox)](https://codesandbox.io/p/sandbox/44lqpr)

¡Pruébalo, haz tus propias versiones y lleva el CSS moderno al límite—sin una sola línea de JavaScript!

¡Feliz código!
