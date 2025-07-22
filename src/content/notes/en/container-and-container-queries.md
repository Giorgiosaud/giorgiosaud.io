---
draft: false
selfHealing: "CQE001"
starred: true
title: "Container and @container Queries Explained how I used in this project"
resume: "Here I will explain how I used the @container query in my redesign of notebook"
image: { src: "container-query", alt: "Css scroll animations" }
publishDate: "2025-02-10 15:15"
category: "development"
author: 000001-jorge-saud
collections: [frontend]
tags: [design-patterns, development, css]
---
Container queries are a Baseline 2023 feature, now available in all major browsers including Chrome, Edge, Firefox, and Safari.

- [Here is the specification](https://developer.mozilla.org/en-US/docs/Web/CSS/@container)

> This feature is marked as [newly available].

## What Are Container Queries?

The `@container` rule allows us to create truly responsive components. Unlike traditional `@media` queries, which respond to the viewport size, container queries let components adapt based on the size of their parent container. This means a component can look great no matter where it is placed, as long as it is properly configured.

---

## Container Types

To use container queries, you must define a container. There are three main types:

- **Size containers**: Respond to the container’s width, height, or both.
- **Inline-size containers**: Respond to the container’s inline (usually horizontal) size. This is the most common and widely supported.
- **Style containers**: Respond to computed style values (less common, but useful for advanced scenarios).

You define a container using the `container-type` or shorthand `container` property:

```css
/* Shorthand: name/type */
.component-wrapper {
  container: hero/inline-size;
}

/* Or just type */
.component-wrapper {
  container-type: inline-size;
}
```

---

## Container Names

Naming your container allows you to target it specifically in your queries:

```css
.container {
  container-name: sidebar;
  container-type: inline-size;
}
```

Or with shorthand:

```css
.container {
  container: sidebar/inline-size;
}
```

---

## Container Query Syntax

Container queries are similar to media queries, but they target the container instead of the viewport.

```css
@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}
```

If you use a named container:

```css
@container sidebar (min-width: 400px) {
  .sidebar-content {
    display: flex;
  }
}
```

You can use logical operators like `and`, `or`, and `not`:

```css
@container (min-width: 400px) and (max-width: 800px) {
  /* styles */
}
```

---

## Supported Container Features

You can query the following container features:

- `width`, `min-width`, `max-width`
- `height`, `min-height`, `max-height`
- `inline-size`, `min-inline-size`, `max-inline-size`
- `block-size`, `min-block-size`, `max-block-size`
- `aspect-ratio`, `orientation`

Example:

```css
@container (min-inline-size: 600px) {
  .gallery {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Container Units

Container queries introduce new units relative to the container:

- `cqw`, `cqh`, `cqi`, `cqb`, `cqmin`, `cqmax`

For example:

```css
.card {
  width: 80cqw; /* 80% of the container's width */
  height: 50cqh; /* 50% of the container's height */
}
```

---

## Nesting and Agnostic Queries

You can nest container queries and use them without specifying a name, making them more generic. This is useful for reusable components.

```css
@container (min-width: 500px) {
  .profile {
    flex-direction: row;
  }
}
```

---

## Practical Example

Suppose you have a hero component that should change layout based on its container size:

```css
.hero-wrapper {
  container: hero/inline-size;
}

@container hero (min-width: 48ch) {
  .hero__buttons {
    flex-direction: row;
    justify-content: flex-start;
  }
}
```

If you move `.hero-wrapper` into a smaller parent, the layout will automatically adapt.

---

## Why Use Container Queries?

With container queries, the size of the parent container determines how the component is styled. This is a big shift from media queries, which only consider the viewport. For example, if you place your `hero` component inside an `aside`, it will render differently than if it is in a full-width parent. This flexibility allows for more modular and reusable components.

---

**In summary:**  
Container queries enable components to be truly responsive to their context, not just the viewport. By defining containers and using `@container` rules, you can create flexible, adaptive layouts that work anywhere in your design. The spec supports named and unnamed containers, multiple container types, logical operators, and new container units, making it a powerful tool for modern CSS architecture.

### P.D.
You can also use range syntax in container queries, just like with `@media`:

```css
@media (50em > width > 30em) {
  /* … */
}
```

And in a container query, it looks like this:

```css
@container (50em > width > 30em) {
  /* … */
}
```

This follows the same rules as previous definitions.