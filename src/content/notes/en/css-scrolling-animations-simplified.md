---
draft: false
selfHealing: "000016"
starred: true
title: Mastering CSS Scrolling Animations Easily
description: Master CSS scrolling animations with our simplified guide, focusing on native solutions using animation-timeline and animation-range.
publishDate: 2025-02-10T18:15:00.000Z
category: development
author: 000001-jorge-saud
collections:
  - frontend
tags:
  - design-patterns
  - development
  - css
cover: ../../../assets/images/css-animations.webp
coverAlt: CSS Scrolling Animations Simplified
---

## Introduction

Here we will talk about simplified version of the CSS Scrolling Animations, we will focus in 2 main ways of implementing this scroll animation only with css all both using the `animation-timeline` and ``animation-range```

- [here is the specification](https://drafts.csswg.org/scroll-animations/#view-notation)

> This is a WIP draft, and is subject to change but in chrome is already working, as soon as it is finalized we will update this post

## The problem

The problem is that we have to use a lot of javascript to make this work, and we are not using the native scroll animations, so we need to implement our own scroll animations.

## The solution

We will use the `animation-timeline:view()` and `animation-timeline:scroll()` to make the scroll animations, and we will use the `animation-range` to define the duration not in time but in % of entrace and exit of the animation, or in % of the total scroll animation of parent element.

### Based on `animation-timeline:scroll()`

this kind of animation is used based on the scroll position of the parent overflow container

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

### Based on `animation-timeline:view()`

This kind of animation is based on the intro and observability of the node in the screen this text the implementation is simple we only need to add the <code>animation-timeline:view()</code> to the css of the div and set an <code>animation-range</code> to define the duration of the entrance and exit of the animation in this case we set the entrance to 10% of the screen and the end when cover the 40% of the screen after that we can add the @keyframe animation name to use this as the starting and end point of the animation getting the code here is an example:

<div class="animate-view h-[300px] w-[300px] bg-amber-950 z-10 text-yellow-300 grid place-items-center my-10">Example of view timeline animation</div>
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
  EXample Test
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

Even in some situations we can use `animation-timeline: view(pxToTheTop,pxToTheBottom)` with a parameter like `pxToTheTop` and `pxToTheBottom` to define the end and initial position of the animation even when it sounds not intuitive that is because I prefer use `animation-range: entry 10% cover 60%;` that refers to the element entry on the viewport or `animation-range-start: 100px;` `animation-range-end: 500px;` that is for a more granular control of the animation.

And to mantain the end animation on scroll we can use the `animation-fill-mode: forwards;`.
