---
draft: false
title: "Sharing State Between Frameworks with Nanostores"
description: "Learn how to share reactive state between React, Vue, and Svelte components in Astro's Islands Architecture using Nanostores - a tiny, framework-agnostic state manager."
publishDate: 2026-01-02
cover: ../../../assets/images/sharing-state-nanostores.png
coverAlt: Nanostores State Sharing illustration
selfHealing: shrngs
lang: en
category: Architecture
author: giorgio-saud
collections:
  - architecture
  - frontend
tags:
  - nanostores
  - state-management
  - react
  - vue
  - svelte
  - astro
linkedinCopy: |
  Fellow devs — sharing state between React, Vue, and Svelte components in the same Astro project should not require a global state management library. Nanostores is tiny, framework-agnostic, and gets out of your way. I show the exact pattern for reactive shared state across the island boundaries in Astro. Sign in and tell me how you are handling cross-framework state.
  Read more: https://www.giorgiosaud.io/notebook/shrngs
  
  #Astro #React #Vue #Svelte #StateManagement #WebDev #NanoButMighty #IslandsNeedFriends
twitterCopy: |
  Fellow devs — sharing state between React, Vue, and Svelte in Astro with Nanostores. Tiny library, big clarity. Sign in and comment: https://www.giorgiosaud.io/notebook/shrngs #Astro #NanoButMighty
---

Here's a problem that's specific to Astro's islands model: you have a React component, a Vue component, and a Svelte component on the same page. They need to share state. How?

Redux is React-only. Vuex is Vue-only. Svelte's built-in stores don't cross framework boundaries. Props drilling doesn't work between independent islands — there's no shared parent.

The answer is [Nanostores](https://github.com/nanostores/nanostores). It's about 300 bytes, has no dependencies, and works identically in every framework.

## The store

```typescript
// src/stores/cart.ts
import { atom, computed } from 'nanostores'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export const cartItems = atom<CartItem[]>([])

export const cartTotal = computed(cartItems, items =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

export function addToCart(item: Omit<CartItem, 'quantity'>) {
  const items = cartItems.get()
  const existing = items.find(i => i.id === item.id)
  if (existing) {
    cartItems.set(items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
  } else {
    cartItems.set([...items, { ...item, quantity: 1 }])
  }
}
```

## Reading it from React, Vue, and Svelte

Each framework has a tiny adapter package. React:

```tsx
import { useStore } from '@nanostores/react'
import { cartTotal } from '@/stores/cart'

export function CartButton() {
  const total = useStore(cartTotal)
  return <button>Cart (${total.toFixed(2)})</button>
}
```

Vue:

```vue
<script setup lang="ts">
import { useStore } from '@nanostores/vue'
import { addToCart } from '@/stores/cart'

const props = defineProps<{ id: string; name: string; price: number }>()
</script>

<template>
  <button @click="addToCart({ id, name, price })">Add to Cart</button>
</template>
```

Svelte works with its native `$` reactive syntax directly — no adapter needed:

```svelte
<script>
import { cartTotal, cartItems } from '@/stores/cart'
</script>

<p>{$cartItems.length} items — ${$cartTotal.toFixed(2)}</p>
```

## Putting it together in Astro

```astro
---
import CartButton from '@/components/react/CartButton'
import ProductCard from '@/components/vue/ProductCard.vue'
import CartTotal from '@/components/svelte/CartTotal.svelte'
---

<header>
  <CartButton client:load />
</header>

<main>
  <ProductCard client:visible id="1" name="Widget" price={29.99} />
  <aside>
    <CartTotal client:idle />
  </aside>
</main>
```

The React button, Vue card, and Svelte total all read and write the same `cartItems` atom. Click "Add to Cart" in the Vue component and the React button count updates immediately.

That's the whole idea. 300 bytes, one store file, three frameworks talking to each other. Works on this site for the theme toggle and a few other bits of cross-component state.
