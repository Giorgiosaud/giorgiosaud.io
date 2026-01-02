---
draft: true
slug: compartiendo-estado-nanostores
title: "Compartiendo Estado Entre Frameworks con Nanostores"
description: "Aprende a compartir estado reactivo entre componentes React, Vue y Svelte en la Arquitectura de Islas de Astro usando Nanostores - un gestor de estado diminuto y agnóstico de framework."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
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

## El Problema del Estado Multi-Framework

En Islands Architecture, podrías tener un componente de carrito en React, un listado de productos en Vue, y un sistema de notificaciones en Svelte - todo en la misma página. ¿Cómo se comunican?

Las soluciones tradicionales no funcionan:
- **Redux/Vuex/Svelte stores** son específicos de framework
- **Context/Provide-Inject** no puede cruzar límites de framework
- **Props drilling** no funciona entre islas independientes

Entra Nanostores - un gestor de estado diminuto (~300 bytes) que funciona en todas partes.

## ¿Por Qué Nanostores?

1. **Agnóstico de framework** - Mismo store, todos los frameworks
2. **Diminuto** - 300 bytes, sin dependencias
3. **Reactivo** - Suscripciones integradas
4. **TypeScript primero** - Type safety completo
5. **Compatible con SSR** - Funciona con el renderizado del servidor de Astro

## Instalación

```bash
# Librería core
npm install nanostores

# Integraciones de framework
npm install @nanostores/react   # Para React
npm install @nanostores/vue     # Para Vue
npm install nanostores          # Svelte funciona directamente
```

## Creando un Store Compartido

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

## Usando en React

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

## Usando en Vue

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
    <button @click="handleAdd">Agregar al Carrito</button>
  </div>
</template>
```

## Usando en Svelte

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

## Juntándolo Todo en Astro

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

¡Los tres componentes - botón React, tarjetas Vue, total Svelte - comparten el mismo estado del carrito!

## Maps para Colecciones con Clave

Para datos normalizados, usa `map`:

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

## Estado Persistente

Sincronizar con localStorage:

```typescript
// stores/preferences.ts
import { persistentAtom } from '@nanostores/persistent'

export const theme = persistentAtom<'light' | 'dark'>(
  'theme',      // clave localStorage
  'light',      // valor por defecto
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

// Ahora theme persiste entre recargas de página
```

## Estado Async con Tasks

Manejar estados de carga:

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

// En componentes:
// fetchUser.loading - boolean
// fetchUser.error - Error | null
```

## Mejores Prácticas

### 1. Mantener Stores Pequeños

```typescript
// ❌ Un store gigante
export const appState = atom({
  user: null,
  cart: [],
  products: [],
  theme: 'light',
  // ... todo lo demás
})

// ✅ Stores enfocados
export const user = atom<User | null>(null)
export const cartItems = atom<CartItem[]>([])
export const theme = atom<'light' | 'dark'>('light')
```

### 2. Actions Sobre Mutaciones Directas

```typescript
// ❌ Mutación directa desde componentes
cartItems.set([...cartItems.get(), newItem])

// ✅ Actions centralizadas
export function addToCart(item: CartItem) {
  cartItems.set([...cartItems.get(), item])
}
```

### 3. Computed para Estado Derivado

```typescript
// ❌ Calculando en cada componente
const total = items.reduce((sum, i) => sum + i.price, 0)

// ✅ Store computed
export const cartTotal = computed(cartItems, items =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)
)
```

## Integración con TypeScript

Inferencia de tipos completa:

```typescript
import { atom, computed } from 'nanostores'

// Los tipos se infieren
const count = atom(0)        // Store<number>
const name = atom('Guest')   // Store<string>

// Tipos explícitos para datos complejos
interface User {
  id: string
  name: string
  email: string
}

const user = atom<User | null>(null)

// Computed hereda tipos
const greeting = computed(user, u =>
  u ? `¡Hola, ${u.name}!` : '¡Hola, Invitado!'
) // Computed<string>
```

## Puntos Clave

1. **Agnóstico de framework** - Mismo store funciona en React, Vue, Svelte
2. **Huella diminuta** - ~300 bytes, perfecto para Islands Architecture
3. **API simple** - `atom`, `map`, `computed` cubren la mayoría de casos
4. **TypeScript nativo** - Type safety completo incluido
5. **Reactivo por defecto** - Componentes se actualizan automáticamente con cambios de estado

Nanostores resuelve el problema de estado multi-framework elegantemente. Cuando tu página tiene islas de React, Vue y Svelte que necesitan comunicarse, Nanostores es el pegamento que lo hace funcionar.
