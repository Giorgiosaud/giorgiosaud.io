---
draft: false
selfHealing: "000005"
title: El patrón Repository en frontend
description: Cómo aplicar el patrón Repository en proyectos Next.js 15 App Router — repositorios de servidor, repositorios de cliente, hooks de React Query y route handlers delgados que mantienen honesta a cada capa.
publishDate: 2026-06-14T04:00:00.000Z
category: Architecture
author: 000001-jorge-saud
collections:
  - architecture
  - patterns
tags:
  - nextjs
  - development
  - frontend
  - backend
  - react-query
  - drizzle
cover: ../../../assets/images/repository_pattern.webp
coverAlt: Patrón Repository en frontend
slug: patron-repositorio
linkedinCopy: |
  Compañeros devs — el patrón Repository tiene dos lados en un proyecto Next.js 15 App Router: una capa de servidor (Drizzle ORM) y una capa de cliente (fetch). Agrega React Query encima y obtienes un stack de datos donde cada capa conoce su trabajo y nada más. Reescribí mi post original con ejemplos reales en TypeScript para cada capa y los mismos principios STAR-D. Inicia sesión y cuéntame si lo estás usando.
  Leer más: https://www.giorgiosaud.io/notebook/000005
  
  #FrontEnd #Architecture #NextJS #ReactQuery #Drizzle #DesignPatterns #PatternOfTheDay
twitterCopy: |
  El patrón Repository para Next.js 15 App Router: repos de servidor, repos de cliente, hooks React Query, route handlers delgados. Post actualizado con ejemplos TS reales: https://www.giorgiosaud.io/notebook/000005 #NextJS #ReactQuery #Drizzle
---

_Esta es una versión actualizada de mi post original [El patrón Repository en frontend](/notebook/000005) de mayo de 2024. Las ideas centrales son las mismas; esta edición incorpora la separación servidor/cliente y la capa de React Query que los proyectos con Next.js 15 App Router demandan._

---

Gestionar datos en un proyecto Next.js 15 App Router es engañosamente fácil de hacer mal. El framework te ofrece tantos lugares para hacer fetch — Server Components, Route Handlers, Client Components — que sin una estructura deliberada, la lógica de datos termina dispersa por todas partes.

El patrón Repository es la respuesta a la que sigo volviendo. Lo escribí por primera vez en 2024 desde un ángulo agnóstico al framework. Esta es la versión evolucionada: dos lados concretos de repositorio, una capa de enlace con React Query y route handlers delgados. Mismos principios, implementación más precisa.

## Por qué sigue importando — el framework STAR-D

### Separación de responsabilidades

Límites claros entre acceso a datos y lógica de negocio. Los repositorios de servidor son dueños de la base de datos; los repositorios de cliente son dueños de las llamadas HTTP; los hooks de React Query son dueños del caché y el estado; los componentes son dueños del renderizado. Ninguna de estas capas se filtra hacia las demás.

### Testabilidad

Cada capa es mockeable de forma independiente. Puedes hacer pruebas unitarias de un componente simulando el hook de React Query, probar el hook simulando el repositorio de cliente, y probar el route handler simulando el repositorio de servidor. No necesitas mockear los internos de Drizzle ni interceptar peticiones de red reales en los tests de componentes.

### Manejo de datos abstraído

Los componentes nunca saben si los datos vienen de una base de datos, una API de terceros o un caché. Cambia la fuente subyacente y nada de lo que está arriba cambia.

### Reutilización

Un único repositorio de cliente puede ser llamado por múltiples hooks. Un único repositorio de servidor puede ser llamado por múltiples route handlers. Los headers de autenticación, las URLs base y el parseo de respuestas viven en un solo lugar.

### Claridad de definición (TypeScript)

Cada capa expone entradas y salidas tipadas. TypeScript detecta desajustes en el límite entre capas en tiempo de compilación, no en runtime.

## La estructura de cuatro capas

```
lib/
  repositories/
    transaction.server.ts   ← queries de Drizzle, solo servidor
    transaction.client.ts   ← llamadas fetch, seguro para el cliente
  queries/
    use-transactions.ts     ← hooks de React Query
app/
  api/
    transactions/
      route.ts              ← route handler delgado
```

### Capa 1 — Repositorios de servidor (`*.server.ts`)

Los repositorios de servidor abstraen las queries de Drizzle ORM. Reciben un `userId` (o el identificador de alcance que corresponda), ejecutan la query y devuelven datos tipados. Nunca son importados por código cliente — el sufijo `.server.ts` lo impone Next.js.

```ts
// lib/repositories/transaction.server.ts
import { db } from '@/lib/db'
import { transactions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export type Transaction = {
  id: string
  date: Date
  description: string
  amount: number
  isCleared: boolean
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date))
}

export async function createTransaction(
  userId: string,
  payload: Omit<Transaction, 'id'>
): Promise<Transaction> {
  const [row] = await db
    .insert(transactions)
    .values({ ...payload, userId })
    .returning()
  return row
}
```

Sin HTTP aquí. Sin formateo de respuestas. Solo la query y el tipo.

### Capa 2 — Route handlers (capa delgada)

Los route handlers validan la sesión, llaman al repositorio de servidor y devuelven JSON. La lógica de negocio no vive aquí.

```ts
// app/api/transactions/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getTransactions,
  createTransaction,
  type Transaction,
} from '@/lib/repositories/transaction.server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const data = await getTransactions(session.user.id)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body: Omit<Transaction, 'id'> = await request.json()
  const created = await createTransaction(session.user.id, body)
  return NextResponse.json(created, { status: 201 })
}
```

Delgado a propósito. Cualquier lógica que agregues aquí es lógica que no puedes reutilizar ni probar sin levantar un route.

### Capa 3 — Repositorios de cliente (`*.client.ts`)

Los repositorios de cliente abstraen las llamadas `fetch` a tus propias rutas de API. Manejan la construcción de la petición, los headers y el parseo de respuestas. Nunca importan Drizzle ni ningún módulo exclusivo del servidor.

```ts
// lib/repositories/transaction.client.ts
import type { Transaction } from './transaction.server'

const BASE = '/api/transactions'

export async function fetchTransactions(): Promise<Transaction[]> {
  const res = await fetch(BASE)
  if (!res.ok) throw new Error(`Error al obtener transacciones: ${res.status}`)
  return res.json()
}

export async function postTransaction(
  payload: Omit<Transaction, 'id'>
): Promise<Transaction> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Error al crear transacción: ${res.status}`)
  return res.json()
}
```

Si alguna vez necesitas agregar un header de autenticación, un prefijo de URL base o lógica de reintentos, hay un solo lugar donde hacerlo.

### Capa 4 — Hooks de React Query (`lib/queries/use-*.ts`)

Los hooks envuelven los repositorios de cliente con `useQuery` y `useMutation`. Gestionan el caché, la invalidación y los estados de carga/error. No saben nada de HTTP — solo llaman a repositorios de cliente.

```ts
// lib/queries/use-transactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchTransactions,
  postTransaction,
} from '@/lib/repositories/transaction.client'
import type { Transaction } from '@/lib/repositories/transaction.server'

const QUERY_KEY = ['transactions']

export function useTransactions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchTransactions,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<Transaction, 'id'>) => postTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
```

### Los componentes solo importan desde `lib/queries/`

```tsx
// components/TransactionList.tsx
'use client'

import { useTransactions, useCreateTransaction } from '@/lib/queries/use-transactions'

export function TransactionList() {
  const { data, isPending, isError } = useTransactions()
  const { mutate: create, isPending: isCreating } = useCreateTransaction()

  if (isPending) return <p>Cargando…</p>
  if (isError) return <p>Algo salió mal.</p>

  return (
    <ul>
      {data.map((tx) => (
        <li key={tx.id}>
          {tx.description} — {tx.amount}
        </li>
      ))}
    </ul>
  )
}
```

El componente no tiene conocimiento alguno de fetch, Drizzle ni rutas de API. Si la API cambia, solo cambia el repositorio de cliente. Si el esquema de base de datos cambia, solo cambia el repositorio de servidor. El componente no se entera.

## Las reglas fundamentales

- **Los componentes** solo importan desde `lib/queries/`
- **Los route handlers** solo importan desde `lib/repositories/*.server.ts`
- **Los repositorios de cliente** solo llaman a `fetch` hacia rutas de API conocidas — sin Drizzle, sin imports de servidor
- **Los repositorios de servidor** solo llaman a Drizzle — sin HTTP, sin objetos Response

Puedes reforzar las dos primeras con la regla `no-restricted-imports` de ESLint si tu equipo necesita ese guardarrail automatizado.

## Cómo probar cada capa

```ts
// Probar un componente — mockear el hook
vi.mock('@/lib/queries/use-transactions', () => ({
  useTransactions: () => ({
    data: [{ id: '1', description: 'Café', amount: -4.5, isCleared: true, date: new Date() }],
    isPending: false,
    isError: false,
  }),
  useCreateTransaction: () => ({ mutate: vi.fn(), isPending: false }),
}))

// Probar el route handler — mockear el repositorio de servidor
vi.mock('@/lib/repositories/transaction.server', () => ({
  getTransactions: vi.fn().mockResolvedValue([]),
}))

// Probar el repositorio de cliente — mockear fetch
global.fetch = vi.fn().mockResolvedValue(
  new Response(JSON.stringify([]), { status: 200 })
)
```

Cada capa es una juntura limpia. Mockeas en la juntura, no dentro de los internos de Drizzle ni de axios.

## Qué cambió respecto a la versión de 2024

El post original usaba un `RepositoryFactory` único que despachaba a repositorios nombrados. Eso funciona en una aplicación puramente cliente. En Next.js 15, el límite entre servidor y cliente es de primera clase, por lo que separar el repositorio en `.server.ts` y `.client.ts` hace ese límite explícito en lugar de convencional. React Query reemplaza el fetching manual con `useEffect` y te da caché e invalidación de forma gratuita.

Los principios STAR-D son los mismos. La implementación es más precisa.
