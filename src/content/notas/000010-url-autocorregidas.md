---
draft: false
selfHealing: "000010"
title: "URLs de post autocorregidas en Astro" 
resume: "En este post, hablaré de como desarrollar una funcionalidad de self-healing URL en el proyecto Astro con una simple aproximación "
image: { src: "selfhealing_url_lygv2g", alt: "Imagen autocorregidas" }
publishDate: "2024-07-19 11:39"
category: "astro"
author: 000001-jorge-saud
tags: [astro, functional-features]
---

Primero comenzemos por definir que es una url auto sanada, o self-healing URL, esta tecnica la vi por primera vez en [medium. com](https://giorgiosaud.medium.com), cuando hacia post estos generaban una url que contenia un hash este hash es unico por cada publicacion y permite hacer que si alguien escribe mal la URL, esta se corrija automaticamente y pinte la url real, una url en medium puede ser esta `https://giorgiosaud.medium.com/arquitectura-de-micro-frontend-trabaja-inteligentemente-no-m%C3%A1s-duro-8995417d821a` esta sería la estructura de cada post de medium ${baseUrl}/${post-name}-${id} este id es el que nos permitiria detectar una url mal formada, si este existe la url se autocorregira y generara una redireccion a la url real por ejemplo `https://giorgiosaud.medium.com/anything-8995417d821a` con ello logramos hacer que la url real se autocorrija.

En otros frameworks es facil consiguir informacion de como realizar esto pero en astro no he conseguido mucha, para ello he creado mi implementacion donde utilizo un id de autocorreccion en el post, generado manualmente y lo añado a todas las enlaces compartibles, y he hecho la implementacion en una nueva [redirect] page dentro de la ruta /notebook o /cuaderno dependiendo de la traduccion en la carpeta pages:


```astro
---
import Container from "@components/container.astro";
import Layout from "@layouts/Layout.astro";
import { getCollection } from "astro:content";
export const prerender = false;
let path = Astro.url.pathname;
const hashToHeal = path.match(/\/.*\/.*?(\d{6})/)?.[1]; 
if(hashToHeal){
    const col=await getCollection("notas", (entry) =>{
        return entry.data.selfHealing===hashToHeal
    });
    if(col.length){
        let newPath = path.split("/");
        newPath.pop();
        const newPathString = newPath.join("/")+ "/" + col[0].slug;
        return Astro.redirect(newPathString);
    }
}
---
<Layout title="404 Not Found">
  <Container>
    <div class="min-h-[calc(100vh-16rem)] flex items-center justify-center">
      <div class="mt-16 text-center">
        <h1 class="text-4xl lg:text-5xl font-bold lg:tracking-tight">404</h1>
        <p class="text-lg mt-4 text-slate-600">Page not found.</p>
      </div>
    </div>
  </Container>
</Layout>

```

Antes de rendefizar la pagina 404 real, tengo que detectar el id de autocorreccion y redireccionar a la coleccion disponible con este id, luego en mi URL normal no necesito aplicar esto pero en el enlace compartible, incluiré esto porque en otras paginas es comun que el link sea mal referenciado.

Por temas de priridades de renderizado esto funciona correctamente ya que este path es un path server side con lo que el analisis queda despues de las url en duro que generamos en el build.

> Gracias a [Tim Neubauer](https://timneubauer.dev/blog/copy-code-button-in-astro/) por el copy code button que uso para copiar el codigo, y por [Jorge Saud](https://giorgiosaud.medium.com) por la traduccion al español.
