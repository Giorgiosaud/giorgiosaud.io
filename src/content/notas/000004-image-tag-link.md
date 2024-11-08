---
draft: false
title: "Tag link"
selfHealing: "000004"
resume: "Explica el uso eficiente y eficaz de la etiqueta <img> en HTML, centrándose en los atributos srcset y sizes. Estos atributos optimizan el uso de recursos en función del dispositivo que muestra el contenido, mejorando el rendimiento y la capacidad de respuesta."
image: { src: "link_siloo8", alt: "link tag" }
publishDate: "2023-05-08 11:39"
category: "Tutorials"
author: 000001-jorge-saud
tags: [webdev, frontend, img, srcset]
---

Aquí hay una pequeña historia sobre un pequeño truco que nos puede ayudar a separar restricciones, optimizar el rendimiento y tener una forma genial de insertar estilos en nuestras páginas.

Cualquiera que haya creado un sitio web sabe que hay muchas formas de incluir CSS, así que hablemos de las principales.

## Estilo en línea

Este tipo de inserción de CSS es muy popular debido a las nuevas tendencias en los frameworks JS que utilizan "CSS en JS". Esto se puede hacer dentro del atributo de estilo:

```html
<div style="””"></div>
```

Esto es genial si tienes preprocesadores para optimizar el CSS utilizado o algo que pueda ayudar a reducir el gran contenido del archivo principal. Debido a que la solicitud realizada a través del servidor será cada vez más grande y debe descargarse en un solo archivo, tendrá un impacto negativo significativo en LCP (Largest Contentful Paint) pero también un impacto positivo en CLS (Cumulative Layout Shift), porque la representación mostrará las cosas como aparecerán, según el sistema de cascada CSS y el CSSOM.

## [**CSS Object Model**](https://developer.mozilla.org/es/docs/Web/API/CSS_Object_Model#:~:text=El%20Modelo%20de%20objetos%20CSS,de%20CSS%20de%20forma%20din%C3%A1mica)

> **Con Vanilla CSS** es imposible aplicar media queries inline.

## Estilos Internos

Otra forma de incluir CSS dentro del mismo HTML es con una etiqueta `<style>` para darle estilo a la web. Esto nos permite organizar mejor el estilo dentro de una etiqueta específica y usar el sistema en cascada para implementar el estilo requerido, teniendo los mismos beneficios y desventajas que usar estilo inline, con la mejora de que podemos usar consultas `@media`.

## Estilos Externos

Ahora hablemos de lo que nos trajo hasta aquí: los estilos externos. Esto se hace generalmente extrayendo todo el CSS en un archivo .css externo que se puede vincular al HTML con la etiqueta link, pero hay una característica oculta aquí que no muchos conocen, que es cómo separar estos archivos por consulta de medios:

```html
<link
rel="stylesheet"
media="screen and (max-width: 767px)"
href="css/mobile.css"
/>
```

Los beneficios de estas implementaciones son que si la web se sirve a través de un protocolo ≥ HTTP/2, podemos manejar la descarga de esos recursos en paralelo con el HTML y mejorar el rendimiento, permitiendo que el navegador elija qué CSS descargar en función de su tamaño o forma de mostrar el contenido, porque este atributo de medios se puede configurar como cualquiera de las consultas de medios normales.

Eso es todo por ahora. Por favor, avíseme si tiene alguna propuesta de publicación para la próxima vez.