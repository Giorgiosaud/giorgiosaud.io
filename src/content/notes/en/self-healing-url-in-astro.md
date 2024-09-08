---
draft: false
selfHealing: "000014"
title: "Self-healing URL in Astro"
resume: "In this post, I will talk about how to develop a functionality of self-healing URL in Astro project with a simple approach "
image: {
    src: "selfhealing_url_lygv2g",
    alt: "Self Healing paint"
}
publishDate: "2024-07-19 11:39"
category: "architecture"
author: "es/jorge-saud"
tags: [architecture,functionalfeatures]
---

First start to define what a self-healing URL is, a self-healing URL is like [medium. com](https://giorgiosaud.medium.com) posts a URL that has a unique identifier to allow redirect to a beauty URL path the structure of the URL normally is ``` https://giorgiosaud.medium.com/arquitectura-de-micro-frontend-trabaja-inteligentemente-no-m%C3%A1s-duro-8995417d821a ``` this structure is the ${baseUrl}/${post-name}-${id} this is the one which allows us to detect a malformed URL, if this is in the name will be replaced with the original one for example ```https://giorgiosaud.medium.com/anything-8995417d821a``` will redirect you to the self-healed original URL,

In other frameworks, it is easy to find information about it but in Astro, I can't find any doc related to it I made my implementation in which I use a self-healing ID in the content post, manually generated and I will add this ID to all my shareable links, and I made the implementation o a new [redirect] page inside /notebook path in pages folder:

```astro
---
import Container from "@components/container.astro";
import Layout from "@layouts/Layout.astro";
import { getCollection } from "astro:content";
export const prerender = false;
let path = Astro.url.pathname;
if(path.includes("/notebook/")){
  console.log("inside if path::");
  
  const hashToHeal = path.match(/\/notebook\/.*?(\d{6})/)?.[1];
  if(hashToHeal){
    console.log("inside if hash:::",hashToHeal);
    
    const col=await getCollection("notes", (entry) =>{
      return entry.data.selfHealing===hashToHeal
    });
    console.log("col searched::",col);
    
    if(col.length){
      const redirect="/notebook/"+col[0].slug;
      console.log("redirect::",redirect);
      
      return Astro.redirect(redirect);
    }
    
  }
  console.log("outside if hash:::",hashToHeal);
  
  return Astro.redirect("/404");
}
---
```

Before rendering my 404 page I will try to detect the self-healing ID and redirect to the collection available with this ID then in my normal URL I don't need to apply this but in the shareable link, I will include it because in other pages is common that the link is bad referenced.

For use this functionality we must me in hybrid mode.

> Thanks to [Tim Neubauer](https://timneubauer.dev/blog/copy-code-button-in-astro/) for the copy code button i use it only touching the css, and a little copilot refactor but it was great.
