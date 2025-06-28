---
draft: false
title: "Tag link recommendations"
selfHealing: "000004"
resume: "explains the efficient and effective use of the <img> tag in HTML, focusing on the srcset and sizes attributes. These attributes optimize resource usage based on the device displaying the content, enhancing performance and responsiveness."
image: { src: "link_siloo8", alt: "link tag" }
publishDate: "2023-05-08 11:39"
category: "Tutorials"
author: 000001-jorge-saud
collections: [frontend]
tags: [webdev, frontend, img, srcset]
---

Here is a short story about a small trick that can help us separate constraints, optimize performance, and have a cool way to insert styles into our pages.

Anyone who has created a website knows there are many ways to include CSS, so let's talk about the main ones.

## Inline Style

This type of CSS insertion is very popular due to new trends in JS frameworks that use "CSS in JS". This can be done within the style attribute:

```html
<div style="””"></div>
```

This is great if you have preprocessors to optimize the used CSS or something that can help reduce the large content of the main file. Because the request made through the server will be increasingly larger and must be downloaded in a single file, it will have a significant negative impact on LCP (Largest Contentful Paint) but also a good impact on CLS (Cumulative Layout Shift), because rendering will show things as they will appear, based on the CSS cascade system and the CSSOM.

## [**CSS Object Model**](https://developer.mozilla.org/es/docs/Web/API/CSS_Object_Model#:~:text=El%20Modelo%20de%20objetos%20CSS,de%20CSS%20de%20forma%20din%C3%A1mica)

> **With Vanilla CSS** it is impossible to apply inline media queries.

## Internal Styles

Another way to include CSS within the same HTML is with a `<style>` tag to style the web. This allows us to better organize the style within a specific tag and use the cascade system to implement the required style, having the same benefits and drawbacks as using inline style, with the improvement that we can use `@media` queries.

## External Styles

Now let's talk about what brought us here—external styles. This is usually done by extracting all the CSS into an external .css file that can be linked to the HTML with the link tag, but there is a hidden feature here that not many know about, which is how to separate these files by media query:

```html
<link
  rel="stylesheet"
  media="screen and (max-width: 767px)"
  href="css/mobile.css"
/>
```

The benefits of these implementations are that if the web is served through a protocol ≥ HTTP/2, we can handle the download of those resources in parallel with the HTML and improve performance, allowing the browser to choose which CSS to download based on its size or way of displaying content, because this media attribute can be set as any of the normal media queries.

That's all for now. Please let me know if you have any posting proposals for the next time.
