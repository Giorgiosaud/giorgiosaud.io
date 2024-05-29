---
draft: false
title: "Paginator in astro"
snippet: "Paginate a website in Astro or any other framework like next.js or nuxt is a challenge but not because is difficult to implement but because is difficult to understand, in this post i will try to illustrate how the paginator of this website was made."
image: {
    src: "https://cdn.giorgiosaud.io/paginator.webp?&fit=crop&w=430&h=240",
    alt: "Full pages with an indiator"
}
publishDate: "2024-05-21 09:45"
category: "Development"
author: "Giorgio Saud"
tags: [astro,next, nuxt, frontent, backend]
---

# Basis of Pagination

Astro as many others frameworks has a pagination system based on repeteable content, this content should belong to a single repository, in astro we have collections, the collections are files written in md and stored in the filesystem that can be processed internally by astro, this allows to use in the build process some techniques to generate in 3 ways the website, we can configure the output as **static** where the build will generate all the static paths **server** where the build process will generate a server which processes all request supporting SSR (server-side rendering) or **hybrid** where some elements are statics and other are SSR ones.

With this introduction lets start talk about code, to can archive a collection we will need a folder containintg this collection and define the elementos of the collection in a file called config.ts, until here all fine, because if the collection is small we can show all the post processed with [frontmatter](https://jekyllrb.com/docs/front-matter/), in a page only creating a path in the pages folder and we can see the folder structure like this:

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

In this structure the blog can show the 2 blognotes of the content but when the blog grows not only the build process will take more time but the /blog path also will be rendering more content than a normal page increasing the loading time of the final rendered site, then we think about pagination, we can add a paginator in the blog, but pagination in this page is almost impossible because this page is rendered with the ```getCollection``` function but for pagination purposes we need to use the ```getStaticPaths``` method, this is because this method is the one that generates dynamic routes to match the bracklets syntax in the routing, then we need to separate this index page in 2 pages one that should be shown in the /blog and another that takes care of pages, and move the blog.astro to the blog file structure to allow us to manage all related blog issues insde of this folder, when we move it we need to rename to index.astro because the folder name is the route that we want.

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

with this file structure now we have all related blog pages in one place, and i choose to use one index and another page that take care of the paginated ones all but the page 1, that`s because if i use the same page for pagination or show the main show to avoid duplication will be /1 now i can handle this and make /1 canonical of /blog and in my index.astro inside blog folder only show one arrow to see the previous post that will move to /2 page of / blog like this ```blog/2```

to handle this canonical between ```blog/1```and ```blog``` i addd a cannonical property to my ```Layout.astro``` page  and in the head i add to the head this:

```astro 
  {canonical&&<link rel="canonical" href={canonical} />}
```
then in the frontmatter part i delcared canonical as a Astr.prop and make it optional, then in the [page].astro i used it as.

```astro
<Layout title="Blog" canonical={canonical}>
.
.
.
</Layout>
```
and there i added my page component lets talk about it in the getStaticPaths constant that we need to export we receive as param the paginate method we can destroy the params to obtain it like this:
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

With this technique now expose the page data from astro props like this
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
and then we can make our paginator component that will receive this pages and to render the specific page post we use page.data the Page will result with a component with this interface.

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

then from data we get the data collection to show, start is the number of index of the first post on page end the last one, total is the total numbers in the collection, currenPage is the actual page, size is the items Per page or pagesize that we pass to the first method, lastPage is the number of the last page important for the paginator element and url are actual previous and next.

then we can use a paginator component like this 
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

This component is stylized with tailwind.css but you can create your one.

Thanks thats all as always if you think that can help to make this post better or detect a bad practice please notify in the contact form and i will be in touch with you to fix it.
