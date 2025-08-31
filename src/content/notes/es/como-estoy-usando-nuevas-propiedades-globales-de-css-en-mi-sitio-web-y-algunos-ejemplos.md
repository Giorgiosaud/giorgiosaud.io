---
draft: false
selfHealing: NCSSPG
starred: true
title: Uso de Propiedades Globales de CSS en Mi Sitio Web
description: Descubre cómo usar propiedades globales de CSS para mejorar tu sitio web con soporte de temas y transiciones suaves entre páginas.
image:
    src: css-global-props
    alt: Propiedades Globales de CSS
publishDate: 2025-07-17 11:42
category: migración
author: 000001-jorge-saud
collections:
    - frontend
    - migración
tags:
    - patrones-de-diseño
    - desarrollo
    - css
fmContentType: Notas
cover: ../../../assets/images/css-global-props.webp
coverAlt: Css Global Props
---

En mi último proyecto, exploré algunas características emocionantes de CSS que simplifican el desarrollo web y mejoran la experiencia del usuario. Estas herramientas son perfectas para crear sitios web modernos y dinámicos con sorprendentemente poco código.

En este post, compartiré mi experiencia con nuevas propiedades globales de CSS que son particularmente útiles para implementar soporte de temas claro-oscuro directamente en CSS y crear transiciones suaves entre páginas. ¡Vamos a ello!


## Soporte de Tema Claro-Oscuro con ```color-scheme```

¡Di adiós a la lógica compleja de JavaScript para cambiar temas! Con la propiedad [color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme), puedes habilitar modos claro y oscuro sin esfuerzo. Respetar la preferencia del sistema operativo del usuario para un tema claro u oscuro es una gran ventaja para la accesibilidad y la experiencia del usuario.

Para habilitar esta función, comienza utilizando la propiedad color-scheme en el nivel raíz de tu CSS. Esta propiedad le dice al navegador que tu sitio soporta modo claro, modo oscuro o ambos.

Aquí está la implementación principal:

```css
:root {
    color-scheme: light dark;
}
``` 
Si solo deseas soportar un modo inicialmente, también puedes especificarlo:

```css
:root{
    color-scheme: only light; /* o only dark */
}
``` 


Una vez que se establece color-scheme, puedes usar la función light-dark() para estilizar dinámicamente los elementos según el tema activo. Esto te permite definir estilos para ambos temas a la vez.

La sintaxis es sencilla: ```light-dark(<valor_modo_claro>, <valor_modo_oscuro>);```

```css
.element {
    background-color: light-dark(white, #333);
    color: light-dark(black, lime);
}
```

En este ejemplo, cuando el modo claro está activo, el ```.element``` tendrá un fondo blanco y texto negro. En modo oscuro, cambiará automáticamente a un fondo gris oscuro con texto lima.



## Navegación Suave entre Páginas con Transiciones de Vista

Otra característica poderosa para crear una experiencia de usuario pulida es la API de Transiciones de Vista. Permite crear transiciones animadas entre diferentes estados de página, haciendo que tu sitio web se sienta tan suave y receptivo como una aplicación nativa.

En las nuevas especificaciones de CSS podemos aprovechar esto solo con CSS [@view transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition)

Para habilitar una animación de desvanecimiento simple entre páginas, agrega lo siguiente a tu CSS global:

```css
    @view-transition {
        navigation: auto;
    }
```

Con esta única regla, navegar entre páginas ya no será un salto brusco, sino un desvanecimiento suave.

Para efectos más avanzados, puedes personalizar la animación usando pseudo-clases como ```css ::view-transition-old(root)``` (la página que estás dejando) y ```css ::view-transition-new(root)``` (la página que estás entrando).

Lo que realmente impresiona es cómo maneja elementos individuales. Si un elemento, como una imagen o un encabezado, existe tanto en la página antigua como en la nueva, puedes hacer que parezca moverse sin problemas de una posición a otra. Simplemente asigna el mismo nombre único view-transition-name al elemento en ambas páginas.

Por ejemplo, imagina que un usuario hace clic en una miniatura de producto en una galería. Para que esa miniatura se expanda suavemente en la imagen principal del producto en la página de detalles del producto, harías esto:

HTML de la Página de Galería:

```html
<img src="product.jpg" style="view-transition-name: product-image;" />
```

HTML de la Página de Detalles del Producto:

```html
<img src="product.jpg" style="view-transition-name: product-image;" />
```
El navegador verá el nombre coincidente ```view-transition-name``` y automáticamente creará una animación fluida de "morfing" entre los dos estados. Puedes aprender más sobre los pseudo-elementos subyacentes como [::view-transition-group en MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/::view-transition-group) .


CSS moderno ofrece herramientas poderosas para construir sitios web sofisticados y amigables con el usuario con menos complejidad que nunca. Al aprovechar la propiedad color-scheme y la API de Transiciones de Vista, puedes implementar cambios automáticos de tema y animaciones fluidas entre páginas que encantarán a tus usuarios.

Te animo a experimentar con estas propiedades en tus propios proyectos. Son simples de implementar y ofrecen un gran retorno en la experiencia del usuario. ¡Feliz codificación!