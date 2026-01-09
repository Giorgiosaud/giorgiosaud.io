---
draft: true
title: "Islands Architecture: Multi-Framework Components"
description: "Learn how Astro's Islands Architecture lets you use React, Vue, and Svelte together in one project with selective hydration for optimal performance."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
coverAlt: Islands Architecture illustration
selfHealing: slndsr
lang: en
category: Architecture
author: giorgio-saud
collections:
  - architecture
  - frontend
tags:
  - astro
  - react
  - vue
  - svelte
  - architecture
---

## What is Islands Architecture?

Traditional SPAs ship JavaScript for the entire page, even if most of it is static content. Islands Architecture flips this - your page is static HTML by default, with "islands" of interactivity that hydrate independently.

Astro pioneered this approach, and it's transformative for performance. But what's even more powerful is that each island can use a different framework.

## Why Multiple Frameworks?

"Why would anyone want that?" I hear you ask. Real-world reasons:

1. **Team expertise** - Different team members know different frameworks
2. **Best tool for the job** - Some frameworks excel at specific use cases
3. **Migration paths** - Gradually move from one framework to another
4. **Third-party components** - Use that perfect Vue library even though you're a React shop

## The Three Frameworks Side-by-Side

Here's the same counter component in React, Vue, and Svelte:

### React: useState + useEffect

```tsx
// buttonReact.tsx
import { useEffect, useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => setCount((c) => c + 1), 1000);
  }, []);

  return (
    <div className="react-component">
      <h3>
        Clicked {count} {count === 1 ? "time" : "times"}
      </h3>
      <button onClick={() => setCount((c) => c + 1)}>Increment Count</button>
    </div>
  );
}
```

### Vue: Composition API

```vue
<!-- buttonVue.vue -->
<script setup>
import { onMounted, ref } from "vue";

const count = ref(0);

onMounted(() => {
  setTimeout(() => count.value++, 1000);
});
</script>

<template>
  <div class="vue-component">
    <h3>Clicked {{ count }} {{ count === 1 ? "time" : "times" }}</h3>
    <button @click="count++">Increment Count</button>
  </div>
</template>
```

### Svelte: Reactive Variables

```svelte
<!-- buttonSvelte.svelte -->
<script>
import { onMount } from 'svelte'

let count = 0

onMount(() => {
  setTimeout(() => count++, 1000)
})
</script>

<div class="svelte-component">
  <h3>Clicked {count} {count === 1 ? 'time' : 'times'}</h3>
  <button on:click={() => count++}>Increment Count</button>
</div>
```

Same functionality, three different philosophies:

- **React**: Explicit state hooks, functional components
- **Vue**: Composition API with refs, template syntax
- **Svelte**: Reactive by default, minimal boilerplate

## Using Them in Astro

Import and use them in any `.astro` file:

```astro
---
import ReactCounter from '@components/react/buttonReact.tsx'
import VueCounter from '@components/vue/buttonVue.vue'
import SvelteCounter from '@components/svelte/buttonSvelte.svelte'
---

<h1>Framework Comparison</h1>

<!-- Static by default - no JS sent -->
<ReactCounter />

<!-- Add hydration directive for interactivity -->
<ReactCounter client:load />
<VueCounter client:visible />
<SvelteCounter client:idle />
```

## Hydration Directives Explained

The magic is in the `client:*` directives:

| Directive        | When it Hydrates             | Use Case                       |
| ---------------- | ---------------------------- | ------------------------------ |
| `client:load`    | Immediately on page load     | Critical interactive elements  |
| `client:idle`    | When browser is idle         | Non-critical but needed soon   |
| `client:visible` | When element enters viewport | Below-the-fold content         |
| `client:media`   | When media query matches     | Mobile-only interactions       |
| `client:only`    | Never SSR, client-side only  | Components that can't be SSR'd |

### No Directive = Zero JS

```astro
<!-- This sends NO JavaScript to the client -->
<ReactCounter />
```

The component renders to static HTML at build time. Perfect for content that doesn't need interactivity.

## Practical Example: Dashboard

Here's a realistic multi-framework page:

```astro
---
// React for complex state management
import DataGrid from '@components/react/DataGrid.tsx'

// Vue for its excellent form handling
import FilterForm from '@components/vue/FilterForm.vue'

// Svelte for lightweight animations
import AnimatedChart from '@components/svelte/AnimatedChart.svelte'

// Astro for static content
import Header from '@components/Header.astro'
import Footer from '@components/Footer.astro'
---

<Header />

<main>
  <FilterForm client:load />
  <DataGrid client:load />
  <AnimatedChart client:visible />
</main>

<Footer />
```

The header and footer ship zero JS. The filter form and data grid hydrate immediately. The chart only hydrates when scrolled into view.

## Framework-Specific Styles

Each framework can use its own styling approach:

```vue
<!-- Vue with scoped styles -->
<style scoped>
.vue-button {
  background: hsl(from green h s calc(l * 1.1));
}
</style>
```

```svelte
<!-- Svelte with component styles (automatically scoped) -->
<style>
.svelte-button {
  background: hsl(from pink h s calc(l * 1.02));
}
</style>
```

```tsx
// React with CSS Modules or inline styles
<button style={{ background: "blue", color: "white" }}>Click me</button>
```

## Decision Framework

When to use which framework:

| Use Case                        | Recommended Framework |
| ------------------------------- | --------------------- |
| Complex state, large ecosystem  | React                 |
| Form-heavy applications         | Vue                   |
| Animation-heavy, minimal bundle | Svelte                |
| Server-rendered, no hydration   | Astro                 |

But honestly? Use what your team knows best. The performance benefits of Islands Architecture work regardless of which framework you choose.

## Configuration

In `astro.config.mjs`:

```javascript
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import svelte from "@astrojs/svelte";

export default defineConfig({
  integrations: [react(), vue(), svelte()],
});
```

That's it. Astro handles the rest.

## Key Takeaways

1. **Static by default** - Components render to HTML unless you add hydration
2. **Selective hydration** - Only hydrate what needs interactivity
3. **Mix frameworks freely** - Use the best tool for each component
4. **Performance wins** - Ship less JavaScript automatically
5. **Progressive enhancement** - Start static, add interactivity as needed

Islands Architecture isn't just a performance optimization - it's a different way of thinking about web applications. Your page is a composition of independent, framework-agnostic islands that each do one thing well.
