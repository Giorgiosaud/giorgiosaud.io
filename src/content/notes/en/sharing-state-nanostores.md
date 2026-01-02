---
draft: true
title: "Sharing State Between Frameworks with Nanostores"
description: "Learn how to share reactive state between React, Vue, and Svelte components in Astro's Islands Architecture using Nanostores - a tiny, framework-agnostic state manager."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
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
---

## The Multi-Framework State Problem

In Islands Architecture, you might have a React cart component, a Vue product listing, and a Svelte notification system - all on the same page. How do they communicate?

Traditional solutions don't work:
- **Redux/Vuex/Svelte stores** are framework-specific
- **Context/Provide-Inject** can't cross framework boundaries
- **Props drilling** doesn't work between independent islands

Enter Nanostores - a tiny (~300 bytes) state manager that works everywhere.

## Why Nanostores?

1. **Framework agnostic** - Same store, every framework
2. **Tiny** - 300 bytes, no dependencies
3. **Reactive** - Built-in subscriptions
4. **TypeScript first** - Full type safety
5. **SSR compatible** - Works with Astro's server rendering

## Installation

```bash
# Core library
npm install nanostores

# Framework integrations
npm install @nanostores/react   # For React
npm install @nanostores/vue     # For Vue
npm install nanostores          # Svelte works directly
```

## Creating a Shared Store

```typescript
// src/stores/cart.ts
import { atom, computed } from 'nanostores'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

// Atom: simple reactive value
export const cartItems = atom<CartItem[]>([])

// Computed: derived state
export const cartTotal = computed(cartItems, items =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

export const cartCount = computed(cartItems, items =>
  items.reduce((sum, item) => sum + item.quantity, 0)
)

// Actions: state mutations
export function addToCart(item: Omit<CartItem, 'quantity'>) {
  const items = cartItems.get()
  const existing = items.find(i => i.id === item.id)

  if (existing) {
    cartItems.set(
      items.map(i =>
        i.id === item.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    )
  } else {
    cartItems.set([...items, { ...item, quantity: 1 }])
  }
}

export function removeFromCart(id: string) {
  cartItems.set(cartItems.get().filter(item => item.id !== id))
}
```

## Using in React

```tsx
// components/react/CartButton.tsx
import { useStore } from '@nanostores/react'
import { cartCount, cartItems } from '@/stores/cart'

export function CartButton() {
  const count = useStore(cartCount)
  const items = useStore(cartItems)

  return (
    <button className="cart-button">
      Cart ({count})
      {items.length > 0 && (
        <span className="badge">{items.length} items</span>
      )}
    </button>
  )
}
```

## Using in Vue

```vue
<!-- components/vue/ProductCard.vue -->
<script setup lang="ts">
import { useStore } from '@nanostores/vue'
import { addToCart } from '@/stores/cart'

const props = defineProps<{
  id: string
  name: string
  price: number
}>()

function handleAdd() {
  addToCart({
    id: props.id,
    name: props.name,
    price: props.price,
  })
}
</script>

<template>
  <div class="product-card">
    <h3>{{ name }}</h3>
    <p>${{ price }}</p>
    <button @click="handleAdd">Add to Cart</button>
  </div>
</template>
```

## Using in Svelte

```svelte
<!-- components/svelte/CartTotal.svelte -->
<script>
import { cartTotal, cartItems } from '@/stores/cart'

// Nanostores work directly with Svelte's $ syntax
$: total = $cartTotal
$: itemCount = $cartItems.length
</script>

<div class="cart-total">
  <p>{itemCount} items in cart</p>
  <p class="total">Total: ${total.toFixed(2)}</p>
</div>
```

## Putting It Together in Astro

```astro
---
// pages/shop.astro
import CartButton from '@/components/react/CartButton'
import ProductCard from '@/components/vue/ProductCard.vue'
import CartTotal from '@/components/svelte/CartTotal.svelte'

const products = [
  { id: '1', name: 'Widget', price: 29.99 },
  { id: '2', name: 'Gadget', price: 49.99 },
]
---

<header>
  <CartButton client:load />
</header>

<main>
  <div class="products">
    {products.map(product => (
      <ProductCard
        client:visible
        id={product.id}
        name={product.name}
        price={product.price}
      />
    ))}
  </div>

  <aside>
    <CartTotal client:idle />
  </aside>
</main>
```

All three components - React button, Vue cards, Svelte total - share the same cart state!

## Maps for Keyed Collections

For normalized data, use `map`:

```typescript
// stores/products.ts
import { map } from 'nanostores'

export interface Product {
  id: string
  name: string
  price: number
  inStock: boolean
}

export const products = map<Record<string, Product>>({})

export function setProduct(product: Product) {
  products.setKey(product.id, product)
}

export function updateStock(id: string, inStock: boolean) {
  const product = products.get()[id]
  if (product) {
    products.setKey(id, { ...product, inStock })
  }
}
```

## Persistent State

Sync with localStorage:

```typescript
// stores/preferences.ts
import { persistentAtom } from '@nanostores/persistent'

export const theme = persistentAtom<'light' | 'dark'>(
  'theme',      // localStorage key
  'light',      // default value
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

// Now theme persists across page reloads
```

## Async State with Tasks

Handle loading states:

```typescript
// stores/user.ts
import { atom } from 'nanostores'
import { task } from '@nanostores/task'

export const user = atom<User | null>(null)

export const fetchUser = task(async () => {
  const response = await fetch('/api/user')
  const data = await response.json()
  user.set(data)
  return data
})

// In components:
// fetchUser.loading - boolean
// fetchUser.error - Error | null
```

## Best Practices

### 1. Keep Stores Small

```typescript
// ❌ One giant store
export const appState = atom({
  user: null,
  cart: [],
  products: [],
  theme: 'light',
  // ... everything else
})

// ✅ Focused stores
export const user = atom<User | null>(null)
export const cartItems = atom<CartItem[]>([])
export const theme = atom<'light' | 'dark'>('light')
```

### 2. Actions Over Direct Mutations

```typescript
// ❌ Direct mutation from components
cartItems.set([...cartItems.get(), newItem])

// ✅ Centralized actions
export function addToCart(item: CartItem) {
  cartItems.set([...cartItems.get(), item])
}
```

### 3. Computed for Derived State

```typescript
// ❌ Computing in every component
const total = items.reduce((sum, i) => sum + i.price, 0)

// ✅ Computed store
export const cartTotal = computed(cartItems, items =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)
)
```

## TypeScript Integration

Full type inference:

```typescript
import { atom, computed } from 'nanostores'

// Types are inferred
const count = atom(0)        // Store<number>
const name = atom('Guest')   // Store<string>

// Explicit types for complex data
interface User {
  id: string
  name: string
  email: string
}

const user = atom<User | null>(null)

// Computed inherits types
const greeting = computed(user, u =>
  u ? `Hello, ${u.name}!` : 'Hello, Guest!'
) // Computed<string>
```

## Key Takeaways

1. **Framework agnostic** - Same store works in React, Vue, Svelte
2. **Tiny footprint** - ~300 bytes, perfect for Islands Architecture
3. **Simple API** - `atom`, `map`, `computed` cover most cases
4. **TypeScript native** - Full type safety out of the box
5. **Reactive by default** - Components auto-update on state changes

Nanostores solves the multi-framework state problem elegantly. When your page has React, Vue, and Svelte islands that need to communicate, Nanostores is the glue that makes it work.
