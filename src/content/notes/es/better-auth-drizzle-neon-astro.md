---
draft: true
title: "Better Auth con Drizzle y Neon en Astro"
description: "Configura Better Auth con Drizzle y Neon en Astro — email/contraseña, OAuth social, passkeys y el patrón de dos archivos de configuración."
publishDate: 2026-05-24
selfHealing: bttrth
cover: ../../../assets/images/better-auth-drizzle-neon-astro.png
coverAlt: Flujo de autenticación con Drizzle y base de datos Neon sobre fondo oscuro
lang: es
category: development
author: giorgio-saud
collections:
  - backend
  - security
tags:
  - astro
  - better-auth
  - drizzle
  - neon
  - postgres
  - autenticacion
  - oauth
  - passkeys
---

La autenticación es de esas cosas que parecen simples hasta que llevas una hora metido y te das cuenta de que has reimplementado a mano un almacén de sesiones. Better Auth es una librería de autenticación pensada para TypeScript que se encarga de todo eso — sesiones, proveedores OAuth, passkeys, roles de administrador — y se integra limpiamente con Drizzle ORM.

Este post recorre la configuración completa en un proyecto Astro: aprovisionar la base de datos, conectar el schema y dejar funcionando los cuatro métodos de autenticación.

## Qué vamos a construir

- Autenticación con email + contraseña
- OAuth social (GitHub, Google, Facebook)
- Passkeys (WebAuthn)
- Plugin de username
- Schema de Drizzle ORM gestionado por la CLI de Better Auth
- Neon Postgres como base de datos (driver serverless)

## Agregar a un proyecto existente

Si ya tienes Astro + Drizzle configurados, solo necesitas algunos paquetes:

```bash
bun add better-auth @better-auth/passkey drizzle-orm @neondatabase/serverless
bun add -d @better-auth/cli
```

Para un **proyecto nuevo**, primero crea el proyecto Astro (`bun create astro`) y luego agrega `drizzle-orm`, `drizzle-kit` y `@neondatabase/serverless` antes de continuar.

## Aprovisionar una base de datos Neon

Crea un proyecto en [neon.tech](https://neon.tech) y copia el string de conexión. Agrégalo a `.env`:

```ini
POSTGRES_URL=postgresql://usuario:contraseña@host/basededatos?sslmode=require
```

> El `?sslmode=require` es importante — Neon exige TLS y la conexión será rechazada sin él.

## Variables de entorno

```ini
# Base de datos
POSTGRES_URL=postgresql://usuario:contraseña@host/basededatos?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=cadena-aleatoria-de-32-caracteres-o-mas
BETTER_AUTH_URL=http://localhost:4321   # producción: https://tudominio.com

# OAuth social — omite el proveedor que no necesites
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

Genera `BETTER_AUTH_SECRET` con:

```bash
openssl rand -base64 32
```

## Los dos archivos de configuración

Esta es la parte más complicada del setup, y la razón por la que las cosas se rompen si solo tienes un archivo.

La CLI de Better Auth (`auth:generate`, que regenera el schema de Drizzle) necesita importar tu configuración en **tiempo de build** a través de Node.js — pero el módulo `astro:env` de Astro solo funciona dentro del runtime de Astro. Si apuntas la CLI a tu config de runtime, falla.

La solución: dos archivos con los mismos plugins pero distintas fuentes de variables de entorno.

### `auth.config.ts` — solo para la CLI

Vive en la raíz del proyecto. Lo usa **únicamente** `bunx @better-auth/cli`. Lee las variables desde `process.env` vía `dotenv`.

```ts
// auth.config.ts
import "dotenv/config";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./src/db/schema";

const client = postgres(process.env.POSTGRES_URL!, { prepare: false });
const db = drizzle(client, { schema });

export default betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      passkey: schema.passkeys,
    },
  }),
  emailAndPassword: { enabled: true },
  plugins: [
    admin({ defaultRole: "user", adminRoles: ["admin"] }),
    passkey({
      rpID: "localhost",
      rpName: "Mi App",
      origin: "http://localhost:4321",
    }),
    username({ minLength: 3, maxLength: 30 }),
  ],
});
```

### `src/lib/auth.ts` — runtime

Lo usa el servidor de Astro. Lee las variables desde `astro:env`, incluye los proveedores sociales y adapta la configuración de passkeys según el entorno.

```ts
// src/lib/auth.ts
import { BETTER_AUTH_URL } from "astro:env/client";
import {
  BETTER_AUTH_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
} from "astro:env/server";
import { passkey } from "@better-auth/passkey";
import { db } from "@db";
import * as schema from "@db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";

const isProd = import.meta.env.PROD;

const socialProviders: Record<
  string,
  { clientId: string; clientSecret: string }
> = {};
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET)
  socialProviders.github = {
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
  };
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
  socialProviders.google = {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  };
if (FACEBOOK_CLIENT_ID && FACEBOOK_CLIENT_SECRET)
  socialProviders.facebook = {
    clientId: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
  };

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      passkey: schema.passkeys,
    },
  }),
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  socialProviders,
  session: {
    cookieCache: { enabled: true, maxAge: 60 * 5 },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  plugins: [
    admin({ defaultRole: "user", adminRoles: ["admin"] }),
    passkey({
      rpID: isProd ? "tudominio.com" : "localhost",
      rpName: "Mi App",
      origin: BETTER_AUTH_URL,
    }),
    username({ minLength: 3, maxLength: 30 }),
  ],
  advanced: {
    cookiePrefix: "myapp",
    useSecureCookies: isProd,
  },
  trustedOrigins: [BETTER_AUTH_URL],
});

export type Auth = typeof auth;
```

La regla es simple: **si agregas un plugin a un archivo, agrégalo al otro**.

## Gestión del schema

### El patrón con symlink

Al ejecutar `bun run auth:generate` se escribe el schema de Drizzle en `auth-schema.ts` en la raíz del proyecto. En lugar de copiar ese archivo manualmente a `src/db/` después de cada regeneración, crea un symlink una sola vez:

```bash
ln -s ../../auth-schema.ts src/db/auth-schema.generated.ts
```

Luego crea una re-exportación estable que renombra las tablas a la convención plural que prefiere Drizzle:

```ts
// src/db/schema/auth/index.ts
export {
  account as accounts,
  passkey as passkeys,
  session as sessions,
  user as users,
  verification as verifications,
} from "../../auth-schema.generated";
```

Así, `bun run auth:generate` regenera el archivo raíz y todos los imports dentro de `src/db/` recogen los cambios automáticamente.

### Ejecutar las migraciones

```bash
bun run auth:generate   # regenera auth-schema.ts vía la CLI
bun run db:generate     # crea un nuevo archivo SQL en drizzle/
bun run db:migrate      # lo aplica a la base de datos
```

## Exponer el endpoint de la API de autenticación

Better Auth necesita una ruta catch-all. En Astro:

```ts
// src/pages/api/auth/[...all].ts
import type { APIRoute } from "astro";
import { auth } from "@lib/auth";

export const ALL: APIRoute = ({ request }) => auth.handler(request);
```

## Configuración de OAuth social

Para cada proveedor que quieras usar, crea una aplicación OAuth en la consola de desarrolladores del proveedor y configura la URL de callback:

```
https://tudominio.com/api/auth/callback/<proveedor>
```

Para desarrollo local:

```
http://localhost:4321/api/auth/callback/github
http://localhost:4321/api/auth/callback/google
http://localhost:4321/api/auth/callback/facebook
```

Los proveedores sociales son opt-in: si las variables de entorno de un proveedor no están configuradas, ese proveedor simplemente no se registra.

## Passkeys

Las passkeys usan WebAuthn. Los dos valores críticos son `rpID` (el dominio, sin protocolo ni puerto) y `origin` (la URL completa).

```
dev:  rpID = 'localhost',        origin = 'http://localhost:4321'
prod: rpID = 'tudominio.com',    origin = 'https://tudominio.com'
```

Equivocarse en estos valores es el error más común con passkeys — el navegador rechazará el registro silenciosamente si `rpID` no coincide con el dominio actual.

## Agregar un plugin más adelante

1. Instalar: `bun add @better-auth/plugin-nombre`
2. Agregar a **ambos** archivos `auth.config.ts` y `src/lib/auth.ts`
3. `bun run auth:generate` — actualiza `auth-schema.ts`
4. Si se agregaron nuevas tablas, re-exportarlas en `src/db/schema/auth/index.ts`
5. `bun run db:generate` → `bun run db:migrate`

## ¿Qué pasa con los datos específicos de la app?

Nunca agregues columnas personalizadas a las tablas de autenticación — Better Auth las gestiona. En su lugar, crea una tabla `user_profiles` separada con una clave foránea a `users.id`:

```ts
// src/db/schema/user-profiles.ts
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  website: text("website"),
});
```

Esto mantiene el schema limpio: las tablas de autenticación se regeneran libremente, los datos de la app permanecen estables.

## Lista de verificación rápida

- [ ] `POSTGRES_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` configurados en `.env` y en Vercel
- [ ] `auth.config.ts` y `src/lib/auth.ts` tienen plugins idénticos
- [ ] El symlink `src/db/auth-schema.generated.ts → ../../auth-schema.ts` existe
- [ ] `src/db/schema/auth/index.ts` re-exporta todas las tablas de autenticación
- [ ] Existe la ruta catch-all `src/pages/api/auth/[...all].ts`
- [ ] URLs de callback OAuth registradas en la consola de cada proveedor
- [ ] El `rpID` de passkeys es el dominio desnudo (sin `https://`, sin puerto)
- [ ] Migraciones aplicadas: `db:generate` → `db:migrate`
