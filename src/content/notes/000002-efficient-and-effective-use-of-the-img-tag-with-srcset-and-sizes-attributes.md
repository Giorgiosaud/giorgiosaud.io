---
draft: false
selfHealing: "000002"
title: "Efficient and Effective Use of the <img> Tag with srcset and sizes Attributes"
resume: "explains the efficient and effective use of the <img> tag in HTML, focusing on the srcset and sizes attributes. These attributes optimize resource usage based on the device displaying the content, enhancing performance and responsiveness."
image: { src: "link_siloo8", alt: "full stack web development" }
publishDate: "2023-05-08 11:39"
category: "Tutorials"
author: "000001-jorge-saud"
tags: [webdev, frontend, img, srcset]
---

In this blog post, Jorge Saud explains the efficient and effective use of the

```html
<img />
```

tag in HTML, focusing on the srcset and sizes attributes. These attributes optimize resource usage based on the device displaying the content, enhancing performance and responsiveness.

First than all, appreciate to Kevin Powell for his video at the end of the post that nspired me to make this.

## Here is my resume

I will talk about `srcset` and `sizes`attributes and how to use them based on MDN Mozzilla Webdocs:

### [srcset Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#srcset)

---

When using the srcset attribute, it accepts as many arguments as you have images with different densities separated by commas. But how do you tell the browser which one to load? Easy, you can use two approaches: one is using the popular pixel ratio value which can be 2x, 3x like this:

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

Remember to set the original src attribute to allow older browsers to render an image at least. For a recommendation, this image should be the smallest in quality because if it's an older browser, it might be an older screen ;). Let's dig deeper:

We see three sources based on image quality and of course the image weight. After these sources, we define the screen pixel density, which will render the image and the browser will calculate to render the best image in each situation.

But there's another method that in my opinion is better than the pixel ratio method, which is defining the src image width. The only difference is that instead of using 2x and 3x, we use the pixel width followed by the w character like this:

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

With this information, the browser will detect the image based on its width, dividing the actual screen width by the pixel ratio and approximating this calculation to the device image size.

But that's not all, because the browser width is not always the image size. You can have better performance if you tell the browser exactly how much of the browser's width this image should cover. To do that, you need to assign an additional attribute to the sizes attribute:

### [attr-sizes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#sizes)

---

It contains a set of comma-separated source sizes, which can tell how much of the viewport width will be occupied by the image at each CSS media query breakpoint. This width should be defined with two parameters: the media query used in the image example `(min-width: 600px)` (this is an example of what happens if the image has this min-width) and the image width which can be `50%` of the viewport represented by `50vw`. You can separate each media query `+` width with commas, leaving the last (the minimum in this case without a media query to use as default). Here's a complete example:

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

Here is the video that inspired this post thanks to Kevin Powell:

[https://www.youtube.com/watch?v=2QYpkrX2N48](https://www.youtube.com/watch?v=2QYpkrX2N48)

And the working example:

[https://codepen.io/kevinpowell/pen/MzRgJK](https://codepen.io/kevinpowell/pen/MzRgJK)
