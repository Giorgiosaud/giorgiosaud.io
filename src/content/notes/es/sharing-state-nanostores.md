---
draft: true
slug: compartiendo-estado-nanostores
title: "Compartiendo Estado Entre Frameworks con Nanostores"
description: "Aprende a compartir estado reactivo entre componentes React, Vue y Svelte en la Arquitectura de Islas de Astro usando Nanostores - un gestor de estado diminuto y agnóstico de framework."
publishDate: 2026-01-02
cover: ../../../assets/images/sharing-state-nanostores.png
coverAlt: Ilustración de Nanostores State Sharing
selfHealing: shrngs
lang: es
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

En Islands Architecture podés tener un componente en React, otro en Vue y otro en Svelte en la misma página. El problema es que cada framework tiene su propio sistema de estado — Redux no le habla a Svelte stores, y el Context de React no cruza límites de framework.

La solución que uso en este sitio es Nanostores. Son ~300 bytes, sin dependencias, y funcionan igual en React, Vue y Svelte.

## El store compartido

```typescript
// src/stores/cart.ts
import { atom, computed } from 'nanostores'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

// Atom: valor reactivo simple
export const cartItems = atom<CartItem[]>([])

// Computed: estado derivado
export const cartTotal = computed(cartItems, items =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

export const cartCount = computed(cartItems, items =>
  items.reduce((sum, item) => sum + item.quantity, 0)
)

// Actions: mutaciones de estado
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

## En React

```tsx
// components/react/CartButton.tsx
import { useStore } from '@nanostores/react'
import { cartCount, cartItems } from '@/stores/cart'

export function CartButton() {
  const count = useStore(cartCount)
  const items = useStore(cartItems)

  return (
    <button className="cart-button">
      Carrito ({count})
      {items.length > 0 && (
        <span className="badge">{items.length} artículos</span>
      )}
    </button>
  )
}
```

## En Svelte

```svelte
<!-- components/svelte/CartTotal.svelte -->
<script>
import { cartTotal, cartItems } from '@/stores/cart'

// Nanostores funcionan directamente con la sintaxis $ de Svelte
$: total = $cartTotal
$: itemCount = $cartItems.length
</script>

<div class="cart-total">
  <p>{itemCount} artículos en el carrito</p>
  <p class="total">Total: ${total.toFixed(2)}</p>
</div>
```

Fijate que en Svelte no hace falta ningún helper extra — la sintaxis `$store` funciona directo con Nanostores.

## Juntándolo en Astro

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

El botón React, las tarjetas Vue y el total Svelte comparten el mismo estado. Cuando alguien hace click en "Agregar al carrito" en una tarjeta Vue, el botón React y el total Svelte se actualizan solos.

Ojo con instalar los helpers por framework:

```bash
npm install nanostores
npm install @nanostores/react   # Para React
npm install @nanostores/vue     # Para Vue
# Svelte funciona directo, sin paquete extra
```

Para Islands Architecture, Nanostores es la solución más simple que encontré. Eso es todo por ahora.
