---
draft: false
selfHealing: "000002"
title: Uso Efectivo de la Etiqueta <img> en HTML
description: Aprende a usar la etiqueta <img> con srcset y sizes para optimizar imágenes y mejorar el rendimiento en dispositivos variados.
publishDate: 2023-05-08T15:39:00.000Z
category: Tutoriales
author: 000001-jorge-saud
starred: true
collections:
  - frontend
tags:
  - desarrollo web
  - frontend
  - img
  - srcset
cover: ../../../assets/images/link_siloo8.webp
coverAlt: Link of zelda Watching pics
slug: uso-eficiente-efectivo-img-srcset-sizes
---

En este post, Jorge Saud explica el uso eficiente y efectivo de la etiqueta HTML `<img />`, enfocándose en los atributos srcset y sizes. Estos atributos optimizan el uso de recursos según el dispositivo que muestra el contenido, mejorando el rendimiento y la capacidad de respuesta.

Primero que todo, quiero agradecer a Kevin Powell por su video al final del post, que me inspiró a escribir esto.

## Aquí está mi resumen

Hablaré sobre los atributos `srcset` y `sizes` y cómo usarlos, basado en la documentación de MDN Mozilla Webdocs:

### [Atributo srcset](https://developer.mozilla.org/es-ES/docs/Web/HTML/Element/img#srcset)

---

Cuando usamos el atributo srcset, acepta tantos argumentos como imágenes tengas con diferentes densidades, separadas por comas. Pero, ¿cómo le indicas al navegador cuál cargar? Es fácil, puedes usar dos enfoques: uno es utilizando el popular valor de la relación de píxeles, que puede ser 2x o 3x, así:

```html
<img
  src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/308367/cat-500.jpg"
  srcset="
    https://s3-us-west-2.amazonaws.com/s.cdpn.io/308367/cat-500.jpg,
    https://s3-us-west-2.amazonaws.com/s.cdpn.io/308367/cat-1000.jpg 2x,
    https://s3-us-west-2.amazonaws.com/s.cdpn.io/308367/cat-1500.jpg 3x
  "
/>
```

Recuerda establecer el atributo src original para permitir que los navegadores más antiguos puedan renderizar al menos una imagen. Como recomendación, esta imagen debería ser la de menor calidad, porque si es un navegador más antiguo, es probable que también sea una pantalla más antigua ;). Vamos a profundizar:

Vemos tres fuentes basadas en la calidad de la imagen y, por supuesto, en el peso de la imagen. Después de estas fuentes, definimos la densidad de píxeles de la pantalla, la cual renderizará la imagen, y el navegador calculará cuál es la mejor imagen para cada situación.

Pero hay otro método que, en mi opinión, es mejor que el de la relación de píxeles, que es definir el ancho de la imagen. La única diferencia es que en lugar de usar 2x y 3x, usamos el ancho en píxeles seguido del carácter w, como este:

```html
<img
  src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/308367/cat-500.jpg"
  srcset="
    https://s3-us-west-2.amazonaws.com/s.cdpn.io/308367/cat-500.jpg   500w,
    https://s3-us-west-2.amazonaws.com/s.cdpn.io/308367/cat-1000.jpg 1000w,
    https://s3-us-west-2.amazonaws.com/s.cdpn.io/308367/cat-1500.jpg 1500w
  "
/>
```

Con esta información, el navegador detectará la imagen basada en su ancho, dividiendo el ancho real de la pantalla por la relación de píxeles y aproximando este cálculo al tamaño de la imagen en el dispositivo.

Pero eso no es todo, porque el ancho del navegador no siempre es el tamaño de la imagen. Puedes mejorar el rendimiento si le indicas al navegador exactamente cuánto del ancho del navegador debería ocupar esta imagen. Para ello, necesitas asignar un atributo adicional al atributo `sizes`:

### [Atributo sizes](https://developer.mozilla.org/es-ES/docs/Web/HTML/Element/img#sizes)

---

Contiene un conjunto de tamaños de fuente separados por comas, los cuales pueden indicar cuánto del ancho del viewport será ocupado por la imagen en cada punto de ruptura de las consultas de medios CSS. Este ancho debe definirse con dos parámetros: la consulta de medios utilizada en el ejemplo de la imagen (`min-width: 600px`) (esto es un ejemplo de lo que ocurre si la imagen tiene este ancho mínimo) y el ancho de la imagen, que puede ser `50%` del viewport representado por `50vw`. Puedes separar cada consulta de medios + ancho con comas, dejando el último (el mínimo en este caso sin consulta de medios para usar como predeterminado). Aquí tienes un ejemplo completo:

```html
<img
  src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/308367/cat-500.jpg"
  srcset="
    https://s3-us-west-2.amazonaws.com/s.cdpn.io/308367/cat-500.jpg   500w,
    https://s3-us-west-2.amazonaws.com/s.cdpn.io/308367/cat-1000.jpg 1000w,
    https://s3-us-west-2.amazonaws.com/s.cdpn.io/308367/cat-1500.jpg 1500w
  "
  sizes="(min-width: 600px) 50vw, 
    100vw"
  alt="alternative text"
/>
```

Aquí está el video que inspiró este post, gracias a Kevin Powell:

[https://www.youtube.com/watch?v=2QYpkrX2N48](https://www.youtube.com/watch?v=2QYpkrX2N48)

Y el ejemplo funcional:

[https://codepen.io/kevinpowell/pen/MzRgJK](https://codepen.io/kevinpowell/pen/MzRgJK)
