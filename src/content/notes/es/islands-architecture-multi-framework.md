---
draft: true
slug: arquitectura-islas-multi-framework
title: "Islands Architecture: Componentes Multi-Framework"
description: "Aprende cómo la Arquitectura de Islas de Astro te permite usar React, Vue y Svelte juntos en un proyecto con hidratación selectiva para rendimiento óptimo."
publishDate: 2026-01-02
cover: ../../../assets/images/islands-architecture.png
coverAlt: Ilustración de Islands Architecture
selfHealing: slndsr
lang: es
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

Este sitio usa React, Vue y Svelte al mismo tiempo. No es un experimento — es la forma en que Astro funciona, y tiene mucho sentido cuando lo entendés.

La idea de Islands Architecture es que tu página es HTML estático por defecto. Solo las partes que necesitan interactividad se hidratan, y cada una puede usar el framework que quieras.

## Los tres frameworks lado a lado

El mismo contador en React, Vue y Svelte:

### React

```tsx
// buttonReact.tsx
import { useEffect, useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setTimeout(() => setCount(c => c + 1), 1000)
  }, [])

  return (
    <div className="react-component">
      <h3>Clicado {count} {count === 1 ? 'vez' : 'veces'}</h3>
      <button onClick={() => setCount(c => c + 1)}>
        Incrementar Contador
      </button>
    </div>
  )
}
```

### Vue

```vue
<!-- buttonVue.vue -->
<script setup>
import { onMounted, ref } from "vue"

const count = ref(0)

onMounted(() => {
  setTimeout(() => count.value++, 1000)
})
</script>

<template>
  <div class="vue-component">
    <h3>Clicado {{ count }} {{ count === 1 ? "vez" : "veces" }}</h3>
    <button @click="count++">Incrementar Contador</button>
  </div>
</template>
```

### Svelte

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
  <h3>Clicado {count} {count === 1 ? 'vez' : 'veces'}</h3>
  <button on:click={() => count++}>Incrementar Contador</button>
</div>
```

## Cómo usarlos en Astro

```astro
---
import ReactCounter from '@components/react/buttonReact.tsx'
import VueCounter from '@components/vue/buttonVue.vue'
import SvelteCounter from '@components/svelte/buttonSvelte.svelte'
---

<h1>Comparación de Frameworks</h1>

<!-- Estático por defecto - no se envía JS -->
<ReactCounter />

<!-- Agrega directiva de hidratación para interactividad -->
<ReactCounter client:load />
<VueCounter client:visible />
<SvelteCounter client:idle />
```

Las directivas `client:*` controlan cuándo se hidrata cada isla. `client:load` hidrata inmediatamente al cargar — para elementos críticos que el usuario ve primero. `client:visible` espera hasta que el elemento entra al viewport — ideal para contenido debajo del fold. `client:idle` espera a que el navegador esté desocupado — para cosas que necesitás pronto pero que no son urgentes. Sin directiva, el componente se renderiza a HTML estático y no envía nada de JavaScript al cliente.

## La configuración

```javascript
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import vue from '@astrojs/vue'
import svelte from '@astrojs/svelte'

export default defineConfig({
  integrations: [
    react(),
    vue(),
    svelte(),
  ],
})
```

Eso es todo. Astro maneja el bundling de cada framework por separado — solo se envía el JavaScript del framework que efectivamente necesita cada isla.

El resultado es que podés usar la mejor herramienta para cada componente sin pagar el costo de enviar todo al cliente. Eso es todo por ahora.
