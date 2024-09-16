---
draft: false
selfHealing: "000006"
title: "Paginator in astro"
resume: "Paginate a website in Astro or any other framework like next.js or nuxt is a challenge but not because is difficult to implement but because is difficult to understand, in this post i will try to illustrate how the paginator of this website was made."
image: {
    src: "paginator",
    alt: "Full pages with an indiator"
}
publishDate: "2024-05-21 09:45"
category: "Development"
author: "jorge-saud"
tags: [astro,next, nuxt, frontent, backend]
---

# Basis of Pagination

Astro como muchos otros frameworks tiene un sistema de paginación basado en contenido repetible, este contenido debe pertenecer a un único repositorio, Astro tiene colecciones, las colecciones son archivos escritos en .md y almacenados en el sistema de archivos que pueden ser procesados ​​internamente por Astro, esto permite utilizar en el proceso de construcción algunas técnicas para generar de 3 maneras el sitio web, podemos configurar la salida como **estática** donde la construcción generará todas las rutas estáticas **servidor** donde el proceso de construcción generará un servidor que procesa todas las solicitudes soportando SSR (server-side renderizado) o **híbrido** donde algunos elementos son estáticos y otros son SSR.

```bash
src/
  ├── content/
  │   ├── blog/
  │   │   └── blognote-1.md
  │   │   └── blognote-2.md
  │   └── config.ts
  .
  .
  .
  ├── layouts/
  │   └── Layout.astro
  ├── pages/
  │   └── blog/
  │       └── [slug].astro
  │   └── index.astro
  │   └── blog.astro
  .
  .
  .
```

En esta estructura, el blog puede mostrar las 2 notas del blog del contenido, pero cuando el blog crece, no solo el proceso de construcción tomará más tiempo, sino que la ruta /blog también muestra más contenido que una página normal, lo que aumenta el tiempo de carga del sitio final renderizado, luego pensamos en la paginación, podemos agregar un paginador en el blog, pero la paginación en esta página es casi imposible porque esta página se renderiza con la función ```getCollection``` pero para fines de paginación necesitamos usar el método ```getStaticPaths```, esto se debe a que este método es el que genera rutas dinámicas para que coincidan con la sintaxis de corchetes en el enrutamiento, luego necesitamos separar esta página de índice en 2 páginas, una que debe mostrarse en el /blog y otra que se encarga de las páginas, y mover el blog.astro a la estructura de archivos del blog para permitirnos administrar todos los problemas relacionados con el blog dentro de esta carpeta, cuando lo movemos necesitamos cambiarle el nombre a index.astro porque el nombre de la carpeta es la ruta que queremos.

```bash
src/
  ├── content/
  │   ├── blog/
  │   │   └── blognote-1.md
  │   │   └── blognote-2.md
  │   │   .
  │   │   .
  │   │   .
  │   │   └── blognote-31.md
  │   │   └── blognote-32.md
  │   └── config.ts
  .
  .
  .
  ├── layouts/
  │   └── Layout.astro
  ├── pages/
  │   └── blog/
  │       └── [slug].astro
  │       └── [page].astro
  │       └── index.astro
  │   └── index.astro
  .
  .
  .
```


Con esta estructura de archivos ahora tengo todas las páginas del blog relacionadas en un solo lugar, y elijo usar un índice y otra página que se encargue de las paginadas todas menos la página 1, eso es porque si uso la misma página para paginación o muestro la principal para evitar duplicación será /1 ahora puedo manejar esto y hacer /1 canónico de /blog y en mi index.astro dentro de la carpeta blog solo muestra una flecha para ver el post anterior que se moverá a la página /2 de /blog como este ```blog/2```

Para manejar esta canonical entre ```blog/1```y ```blog``` agrego una propiedad canonical a mi pagina ```Layout.astro``` y en el head agrego esto:

```astro 
  {canonical&&<link rel="canonical" href={canonical} />}
```

Luego, en la parte preliminar, declaré canónico como Astr.prop y lo hice opcional, luego en [page].astro lo usé como.

```astro
<Layout title="Blog" canonical={canonical}>
.
.
.
</Layout>
```

Y ahí agregué mi componente de página, hablemos de ello en la constante getStaticPaths que necesitamos exportar recibimos como parámetro el método paginate podemos destruir los parámetros para obtenerlo así:

```astro
---
export const getStaticPaths:GetStaticPaths=async({paginate}) =>{
    const publishedNotesEntries = await getCollection("blog", ({ data }) => {
      //filter draft props true and published in the future
        return !data.draft && data.publishDate < new Date();
    });
    //sort entries
    publishedNotesEntries.sort(function (a, b) {
        return b.data.publishDate.valueOf() - a.data.publishDate.valueOf();
    });

    return paginate(publishedNotesEntries, {pageSize:4});
}
.
.
.
---
```

Esta técnica ahora expone los datos de la página de astro props de esta manera

```astro
---
.
.
.
type Props = {
  page: Page<CollectionEntry<'notes'>>;
};
const { page } = Astro.props;
let canonical
if (page.currentPage===1){
    canonical=`/notebook/`;
}
---
```

Y luego podemos crear nuestro componente paginador que recibirá estas páginas y renderizará la página específica que usemos. La página dará como resultado un componente con esta interfaz.

```ts
interface Page{
 data: T[];
    /** metadata */
    /** the count of the first item on the page, starting from 0 */
    start: number;
    /** the count of the last item on the page, starting from 0 */
    end: number;
    /** total number of results */
    total: number;
    /** the current page number, starting from 1 */
    currentPage: number;
    /** number of items per page (default: 25) */
    size: number;
    /** number of last page */
    lastPage: number;
    url: {
        /** url of the current page */
        current: string;
        /** url of the previous page (if there is one) */
        prev: string | undefined;
        /** url of the next page (if there is one) */
        next: string | undefined;
    };
}
``` 

Luego, a partir de los datos, obtenemos la recopilación de datos que se va a mostrar: start es el número de índices de la primera publicación en la página, end de la última, total es el número total de la recopilación, currentPage es la página actual, size son los elementos por página o pageSize que pasamos al primer método, lastPage es el número de la última página importante para el elemento paginador y URL son los valores reales anterior y siguiente.

Luego, podemos usar un componente paginador como este:

```astro
---
import Link from "@components/ui/link.astro";
import type { Page } from "astro";
import { Icon } from "astro-icon/components";

interface Props{
    page:Page
}

const {page}=Astro.props;
const totalPages=Math.ceil(page.total/page.size);
const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
---
<hr class="mt-4">
<section class="grid grid-cols-3 py-3">
    <div class="flex justify-start">
        {
            page.url.prev &&
            <Link
            size="md"
            href={page.url.prev}
            style="inverted"
            class="flex gap place-items-center hover:bg-slate-600 py-3 px-4 group">
            <-
        </Link>
    }
</div>
<div class="flex justify-center">
    {pagesArray.map(pageX=>{
        return(
            <Link
            size="md"
            href={`/notebook/${pageX}`}
            style="pages"
            class:list={[{'bg-slate-600 text-white':pageX===page.currentPage}]}
            class="flex gap place-items-center">
            {pageX}
            
        </Link>
    )
    })}
</div>
<div class="flex justify-end">
    {
        page.url.next &&
        <Link
        size="md"
        href={page.url.next}
        style="inverted"
        
        class="flex gap place-items-center hover:bg-slate-600 py-3 px-4 group">
        ->
    </Link>
}
</div>

</section>
```

Este componente está estilizado con tailwind.css pero puedes crear el tuyo propio.

Gracias, eso es todo como siempre, si crees que puede ayudar a mejorar este post o detectas alguna mala práctica por favor notifícamelo en el formulario de contacto y me pondré en contacto contigo para solucionarlo.