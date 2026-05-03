---
draft: false
title: "Islands Architecture: Multi-Framework Components"
description: "Learn how Astro's Islands Architecture lets you use React, Vue, and Svelte together in one project with selective hydration for optimal performance."
publishDate: 2026-01-02
cover: ../../../assets/images/islands-architecture.png
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

This site uses React, Vue, and Svelte — all on the same page in some places. That's not an accident or a sign of chaos. It's Astro's islands architecture doing exactly what it's designed for.

The core idea: your page is static HTML by default. JavaScript only ships for the specific components that need it, and each component ("island") hydrates independently. The header? Zero JS. The interactive counter demo? Hydrated when it enters the viewport. The contact form? Hydrated immediately on load. You control each one.

## The same component in three frameworks

Here's a counter in React, Vue, and Svelte — the same behavior, three different styles:

**React:**
```tsx
// buttonReact.tsx
import { useEffect, useState } from "react"

export default function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setTimeout(() => setCount((c) => c + 1), 1000)
  }, [])

  return (
    <div>
      <h3>Clicked {count} {count === 1 ? "time" : "times"}</h3>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  )
}
```

**Vue:**
```vue
<!-- buttonVue.vue -->
<script setup>
import { onMounted, ref } from "vue"

const count = ref(0)
onMounted(() => { setTimeout(() => count.value++, 1000) })
</script>

<template>
  <div>
    <h3>Clicked {{ count }} {{ count === 1 ? "time" : "times" }}</h3>
    <button @click="count++">Increment</button>
  </div>
</template>
```

**Svelte:**
```svelte
<!-- buttonSvelte.svelte -->
<script>
import { onMount } from 'svelte'
let count = 0
onMount(() => { setTimeout(() => count++, 1000) })
</script>

<div>
  <h3>Clicked {count} {count === 1 ? 'time' : 'times'}</h3>
  <button on:click={() => count++}>Increment</button>
</div>
```

React is explicit about state with hooks. Vue uses reactive refs with a template. Svelte is the most minimal — `let count = 0` is already reactive. All three compile to working interactive components.

## Hydration directives

This is where islands architecture gets practical. Without a `client:*` directive, any component renders to static HTML at build time and ships zero JavaScript:

```astro
---
import ReactCounter from '@components/react/buttonReact.tsx'
import VueCounter from '@components/vue/buttonVue.vue'
import SvelteCounter from '@components/svelte/buttonSvelte.svelte'
---

<!-- Static HTML, no JS -->
<ReactCounter />

<!-- Hydrates immediately — for things above the fold that need interactivity right away -->
<ReactCounter client:load />

<!-- Hydrates when scrolled into view — good for below-the-fold content -->
<VueCounter client:visible />

<!-- Hydrates when the browser is idle — for non-critical UI -->
<SvelteCounter client:idle />
```

There's also `client:media` (hydrates when a media query matches) and `client:only` (skips SSR entirely, client-side only). I use `client:only` for components that read `localStorage` or `window` directly and would break during server rendering.

## Configuration

Three lines in `astro.config.mjs`:

```javascript
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import vue from "@astrojs/vue"
import svelte from "@astrojs/svelte"

export default defineConfig({
  integrations: [react(), vue(), svelte()],
})
```

Astro handles bundling each framework separately so they don't interfere with each other. You get the right runtime for each island, nothing extra.

The thing I keep coming back to: before islands architecture, adding a single interactive component to a mostly-static page still meant shipping a full React runtime to every visitor. Now it means shipping exactly what that one component needs, and only when it's actually needed.
