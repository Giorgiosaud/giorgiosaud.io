---
fmContentType: Notas
draft: false
selfHealing: "000016"
title: Guía Rápida de Animaciones de Scroll en CSS
description: Descubre cómo simplificar las animaciones de scroll en CSS con técnicas efectivas y sin complicaciones. ¡Optimiza tu diseño web hoy!
publishDate: 2025-02-10T18:15:00.000Z
category: development
starred: true
author: 000001-jorge-saud
collections:
  - frontend
tags:
  - design-patterns
  - development
  - css
cover: ../../../assets/images/css-animations.webp
coverAlt: mouse and css logo
slug: css-animaciones-con-scroll-simplificado
---

## Introducción

Aquí hablaremos sobre la versión simplificada de las Animaciones de Scroll CSS, nos concentraremos en 2 maneras principales de implementar esta animación de scroll solo con css, ambas usando la notación `animation-timeline` y ``animation-range```

- [link a la especificacion](https://drafts.csswg.org/scroll-animations/#view-notation)

> Este es un borrador WIP, y está sujeto a cambios pero en chrome ya está funcionando, tan pronto como esté finalizado actualizaremos este post

## El problema

El problema es que tenemos que usar mucho javascript para hacer esto funcionar, y no estamos usando las animaciones de scroll nativas, por lo que necesitamos implementar nuestras propias animaciones de scroll.

## La solución

Usaremos `animation-timeline: view()` y `animation-timeline: scroll()` para crear las animaciones basadas en el desplazamiento (scroll). Además, utilizaremos animation-range para definir la duración no en tiempo, sino en porcentaje de entrada y salida de la animación, o en porcentaje del total del desplazamiento del elemento padre.

### Basado en `animation-timeline: scroll()`

Este tipo de animación se usa basada en la posición del desplazamiento del contenedor de overflow del padre.

<div class="animate-view-scroll">
animate-view-scroll
</div>

<style>
  body{
    scroll-timeline-name: --main-scroll;
  }
  .animate-view-scroll{
    display: grid;
    align-items: center;
    text-align: center;
    height: 300px;
    width: 300px;
    background-color: red;
    animation-timeline: scroll();
    scroll-timeline: --main-scroll inline;
    animation-name: scale;
      transform: scale(0);

  }
  @keyframes scale{
    to{
      transform: scale(1);
    }
  }
</style>

```html
<div class="animate-view-scroll">animate-view-scroll</div>

<style>
  body {
    scroll-timeline-name: --main-scroll;
  }
  .animate-view-scroll {
    height: 300px;
    width: 300px;
    background-color: red;
    animation-timeline: scroll();
    scroll-timeline: --main-scroll inline;
    animation-name: scale;
    transform: scale(0);
  }
  @keyframes scale {
    to {
      transform: scale(1);
    }
  }
</style>
```

### Basado en `animation-timeline: view()`

Este tipo de animación se basa en la introducción y la observabilidad del nodo en la pantalla, este texto la implementación es sencilla, solo necesitamos agregar <code>animation-timeline: view()</code> al css del div y establecer una <code>animation-range</code> para definir la duración de la entrada y salida de la animación en este caso establecemos la entrada en 10% de la pantalla y el final cuando cubra el 40% de la pantalla después de eso podemos agregar el nombre de la animación @keyframe para usar esto como el punto de inicio y final de la animación, obteniendo el siguiente código:

<div class="animate-view h-[300px] w-[300px] bg-amber-950 z-10 text-yellow-300 grid place-items-center my-10">Ejemplo de animacion con  view timeline</div>
</div>

<style>
  
  .animate-view{
    animation-timeline: view();
    animation-range: entry 30% cover 60%;
    animation-name: reveal;
    animation-fill-mode: forwards;
    translate: 100px 100px;
    opacity:0;

  }
  @keyframes reveal{
    to{
      opacity:1;
      translate: 0 0;
    }
  }
</style>

```html
<div
  class="animate-view h-[300px] w-[300px] bg-amber-950 z-10 text-yellow-300 grid place-items-center my-10"
>
  Ejemplo de prueba
</div>
<style>
  .animate-view {
    animation-timeline: view();
    animation-range: entry 30% cover 60%;
    animation-name: reveal;
    animation-fill-mode: forwards;
    translate: 100px 100px;
    opacity: 0;
  }
  @keyframes reveal {
    to {
      opacity: 1;
      translate: 0 0;
    }
  }
</style>
```

Inclusive en algunas situaciones podemos usar `animation-timeline: view(pxToTheTop,pxToTheBottom)` con un parámetro como `pxToTheTop` y `pxToTheBottom` para definir la posición final y inicial de la animación incluso cuando parece no intuitivo, es porque prefiero usar `animation-range: entry 10% cover 60%;` que se refiere a la entrada del elemento en la vista o `animation-range-start: 100px;` `animation-range-end: 500px;` que es para un control más granular de la animación.

Y para mantener la animación final en el desplazamiento podemos usar el `animation-fill-mode: forwards;`.
