---
draft: false
title: "Islands Architecture: Componentes Multi-Framework"
description: "Aprende cómo la Arquitectura de Islas de Astro te permite usar React, Vue y Svelte juntos en un proyecto con hidratación selectiva para rendimiento óptimo."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
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

## ¿Qué es Islands Architecture?

Las SPAs tradicionales envían JavaScript para toda la página, incluso si la mayoría es contenido estático. Islands Architecture invierte esto - tu página es HTML estático por defecto, con "islas" de interactividad que se hidratan independientemente.

Astro fue pionero en este enfoque, y es transformador para el rendimiento. Pero lo que es aún más poderoso es que cada isla puede usar un framework diferente.

## ¿Por Qué Múltiples Frameworks?

"¿Por qué alguien querría eso?" te preguntarás. Razones del mundo real:

1. **Experiencia del equipo** - Diferentes miembros conocen diferentes frameworks
2. **La mejor herramienta para el trabajo** - Algunos frameworks destacan en casos de uso específicos
3. **Rutas de migración** - Mover gradualmente de un framework a otro
4. **Componentes de terceros** - Usa esa librería Vue perfecta aunque seas un equipo de React

## Los Tres Frameworks Lado a Lado

Aquí está el mismo componente contador en React, Vue y Svelte:

### React: useState + useEffect

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

### Vue: Composition API

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

### Svelte: Variables Reactivas

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

Misma funcionalidad, tres filosofías diferentes:
- **React**: Hooks de estado explícitos, componentes funcionales
- **Vue**: Composition API con refs, sintaxis de template
- **Svelte**: Reactivo por defecto, boilerplate mínimo

## Usándolos en Astro

Impórtalos y úsalos en cualquier archivo `.astro`:

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

## Directivas de Hidratación Explicadas

La magia está en las directivas `client:*`:

| Directiva | Cuándo se Hidrata | Caso de Uso |
|-----------|-------------------|-------------|
| `client:load` | Inmediatamente al cargar | Elementos interactivos críticos |
| `client:idle` | Cuando el navegador está inactivo | No crítico pero necesario pronto |
| `client:visible` | Cuando el elemento entra al viewport | Contenido debajo del pliegue |
| `client:media` | Cuando la media query coincide | Interacciones solo móvil |
| `client:only` | Nunca SSR, solo cliente | Componentes que no pueden ser SSR |

### Sin Directiva = Cero JS

```astro
<!-- Esto NO envía JavaScript al cliente -->
<ReactCounter />
```

El componente se renderiza a HTML estático en tiempo de build. Perfecto para contenido que no necesita interactividad.

## Ejemplo Práctico: Dashboard

Aquí hay una página multi-framework realista:

```astro
---
// React para manejo de estado complejo
import DataGrid from '@components/react/DataGrid.tsx'

// Vue para su excelente manejo de formularios
import FilterForm from '@components/vue/FilterForm.vue'

// Svelte para animaciones ligeras
import AnimatedChart from '@components/svelte/AnimatedChart.svelte'

// Astro para contenido estático
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

El header y footer envían cero JS. El formulario de filtros y la grilla de datos se hidratan inmediatamente. El gráfico solo se hidrata cuando se hace scroll hasta él.

## Estilos Específicos del Framework

Cada framework puede usar su propio enfoque de estilos:

```vue
<!-- Vue con estilos con scope -->
<style scoped>
.vue-button {
  background: hsl(from green h s calc(l * 1.1));
}
</style>
```

```svelte
<!-- Svelte con estilos de componente (automáticamente con scope) -->
<style>
.svelte-button {
  background: hsl(from pink h s calc(l * 1.02));
}
</style>
```

```tsx
// React con CSS Modules o estilos inline
<button style={{ background: 'blue', color: 'white' }}>
  Haz clic
</button>
```

## Marco de Decisión

Cuándo usar qué framework:

| Caso de Uso | Framework Recomendado |
|-------------|----------------------|
| Estado complejo, gran ecosistema | React |
| Aplicaciones con muchos formularios | Vue |
| Mucha animación, bundle mínimo | Svelte |
| Renderizado en servidor, sin hidratación | Astro |

Pero honestamente, usa lo que tu equipo conoce mejor. Los beneficios de rendimiento de Islands Architecture funcionan independientemente del framework que elijas.

## Configuración

En `astro.config.mjs`:

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

Eso es todo. Astro maneja el resto.

## Puntos Clave

1. **Estático por defecto** - Componentes se renderizan a HTML a menos que agregues hidratación
2. **Hidratación selectiva** - Solo hidratar lo que necesita interactividad
3. **Mezcla frameworks libremente** - Usa la mejor herramienta para cada componente
4. **Ganancias de rendimiento** - Envía menos JavaScript automáticamente
5. **Mejora progresiva** - Empieza estático, agrega interactividad según necesites

Islands Architecture no es solo una optimización de rendimiento - es una forma diferente de pensar sobre aplicaciones web. Tu página es una composición de islas independientes, agnósticas de framework, que cada una hace una cosa bien.
