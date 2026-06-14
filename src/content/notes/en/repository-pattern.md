---
draft: false
selfHealing: "000005"
title: Repository pattern in frontend
description: How the Repository Pattern applies to Next.js 15 App Router projects — server repos, client repos, React Query hooks, and thin route handlers that keep every layer honest.
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
coverAlt: Repository pattern in frontend
cover: ../../../assets/images/repository_pattern.webp
linkedinCopy: |
  Fellow devs — the Repository pattern has two sides in a Next.js 15 App Router project: a server layer (Drizzle ORM) and a client layer (fetch). Add React Query on top and you get a data stack where every layer knows its job and nothing else. I rewrote my original post with real TypeScript examples for each layer and the same STAR-D principles that made the pattern click the first time. Sign in and tell me if you are using it.
  Read more: https://www.giorgiosaud.io/notebook/000005
  
  #FrontEnd #Architecture #NextJS #ReactQuery #Drizzle #DesignPatterns #PatternOfTheDay
twitterCopy: |
  The Repository pattern for Next.js 15 App Router: server repos, client repos, React Query hooks, thin route handlers. Updated post with real TS examples: https://www.giorgiosaud.io/notebook/000005 #NextJS #ReactQuery #Drizzle
---

_This is an updated version of my original [Repository pattern in frontend](/notebook/000005) post from May 2024. The core ideas are the same; this edition adds the server/client split and React Query layer that Next.js 15 App Router projects call for._

---

Managing data in a Next.js 15 App Router project is deceptively easy to get wrong. The framework gives you so many places to fetch — Server Components, Route Handlers, Client Components — that without a deliberate structure, data logic ends up scattered everywhere.

The Repository Pattern is the answer I keep coming back to. I first wrote about it in 2024 from a framework-agnostic angle. This is the evolved version: two concrete repository sides, a React Query binding layer, and thin route handlers. Same principles, sharper implementation.

## Why it still matters — the STAR-D framework

### Separation of concerns

Clear boundaries between data access and business logic. Server repositories own the database; client repositories own the HTTP calls; React Query hooks own caching and state; components own rendering. None of these layers bleeds into another.

### Testability

Every layer is independently mockable. You can unit-test a component by faking the React Query hook, test the hook by faking the client repository, and test the route handler by faking the server repository. No need to mock Drizzle internals or intercept real network requests in component tests.

### Abstracted data handling

Components never know whether data comes from a database, a third-party API, or a cache. Swap the underlying source and nothing upstream changes.

### Reusability

A single client repository can be called by multiple hooks. A single server repository can be called by multiple route handlers. Auth headers, base URLs, and response parsing live in one place.

### Definition clarity (Type Safety with TypeScript)

Every layer exposes typed inputs and outputs. TypeScript catches mismatches at the boundary between layers at compile time, not at runtime.

## The four-layer structure

```
lib/
  repositories/
    transaction.server.ts   ← Drizzle queries, server-only
    transaction.client.ts   ← fetch calls, client-safe
  queries/
    use-transactions.ts     ← React Query hooks
app/
  api/
    transactions/
      route.ts              ← thin route handler
```

### Layer 1 — Server repositories (`*.server.ts`)

Server repositories abstract Drizzle ORM queries. They receive a `userId` (or whatever scoping identifier makes sense), perform the query, and return typed data. They are never imported by client code — the `.server.ts` suffix enforces this in Next.js.

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

No HTTP here. No response formatting. Just the query and the type.

### Layer 2 — Route handlers (thin layer)

Route handlers validate the session, call the server repository, and return JSON. Business logic does not live here.

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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await getTransactions(session.user.id)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: Omit<Transaction, 'id'> = await request.json()
  const created = await createTransaction(session.user.id, body)
  return NextResponse.json(created, { status: 201 })
}
```

Thin on purpose. Any logic you add here is logic you cannot reuse and cannot test without spinning up a route.

### Layer 3 — Client repositories (`*.client.ts`)

Client repositories abstract `fetch` calls to your own API routes. They handle request construction, headers, and response parsing. They never import Drizzle or any server-only module.

```ts
// lib/repositories/transaction.client.ts
import type { Transaction } from './transaction.server'

const BASE = '/api/transactions'

export async function fetchTransactions(): Promise<Transaction[]> {
  const res = await fetch(BASE)
  if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`)
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
  if (!res.ok) throw new Error(`Failed to create transaction: ${res.status}`)
  return res.json()
}
```

If you ever need to add an auth header, a base URL prefix, or retry logic, there is one place to do it.

### Layer 4 — React Query hooks (`lib/queries/use-*.ts`)

Hooks wrap client repositories with `useQuery` and `useMutation`. They handle caching, invalidation, and loading/error states. They know nothing about HTTP — they only call client repositories.

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

### Components only import from `lib/queries/`

```tsx
// components/TransactionList.tsx
'use client'

import { useTransactions, useCreateTransaction } from '@/lib/queries/use-transactions'

export function TransactionList() {
  const { data, isPending, isError } = useTransactions()
  const { mutate: create, isPending: isCreating } = useCreateTransaction()

  if (isPending) return <p>Loading…</p>
  if (isError) return <p>Something went wrong.</p>

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

The component has zero knowledge of fetch, Drizzle, or route paths. If the API changes, only the client repository changes. If the database schema changes, only the server repository changes. The component does not notice.

## The hard rules

- **Components** only import from `lib/queries/`
- **Route handlers** only import from `lib/repositories/*.server.ts`
- **Client repositories** only call `fetch` to known API routes — no Drizzle, no server imports
- **Server repositories** only call Drizzle — no HTTP, no Response objects

Enforce the first two with ESLint's `no-restricted-imports` rule if your team needs the guardrail automated.

## Testing each layer

```ts
// Testing a component — mock the hook
vi.mock('@/lib/queries/use-transactions', () => ({
  useTransactions: () => ({
    data: [{ id: '1', description: 'Coffee', amount: -4.5, isCleared: true, date: new Date() }],
    isPending: false,
    isError: false,
  }),
  useCreateTransaction: () => ({ mutate: vi.fn(), isPending: false }),
}))

// Testing the route handler — mock the server repository
vi.mock('@/lib/repositories/transaction.server', () => ({
  getTransactions: vi.fn().mockResolvedValue([]),
}))

// Testing the client repository — mock fetch
global.fetch = vi.fn().mockResolvedValue(
  new Response(JSON.stringify([]), { status: 200 })
)
```

Each layer is a clean seam. You mock at the seam, not inside Drizzle internals or axios.

## What changed from the 2024 version

The original post used a single `RepositoryFactory` that dispatched to named repositories. That works in a pure client app. In Next.js 15, the boundary between server and client is first-class, so splitting the repository into `.server.ts` and `.client.ts` makes that boundary explicit rather than conventional. React Query replaces manual `useEffect` fetching and gives you caching and invalidation for free.

The STAR-D principles are the same. The implementation is sharper.
