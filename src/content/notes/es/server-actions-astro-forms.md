---
draft: false
slug: server-actions-formularios-astro
title: "Server Actions en Astro: Formularios Bien Hechos"
description: Aprende a construir formularios seguros y type-safe con server actions de Astro, incluyendo validación con Zod, manejo de errores y patrones de protección contra bots.
publishDate: 2026-01-02
cover: ../../../assets/images/freepik__pixel-art-quiero-una-imagen-para-este-notebook-pos__50452.jpeg
coverAlt: Ilustración de Server Actions en Astro
selfHealing: srvrct
lang: es
category: Development
author: giorgio-saud
collections:
  - astro
  - backend
tags:
  - astro
  - forms
  - validation
  - security
  - backend
---

## ¿Por Qué Server Actions?

Antes de los server actions de Astro, manejar formularios en sitios estáticos significaba:

- Configurar un endpoint API separado
- Usar servicios de formularios de terceros
- JavaScript del lado del cliente con llamadas fetch

Los server actions cambian todo. Te dan manejo de formularios type-safe, validado y del lado del servidor con una sola definición de función. Déjame mostrarte cómo implementé un formulario de contacto con manejo de errores y seguridad adecuados.

## Definiendo la Action

Los server actions viven en `src/actions/`. Aquí hay una action real para enviar emails:

```typescript
// src/actions/sendEmail.ts
import { ActionError, defineAction } from "astro:actions";
import {
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  RESEND_FROM_NAME,
  RESEND_TO_EMAIL,
} from "astro:env/server";
import { Resend } from "resend";
import { z } from "astro:schema";

const resend = new Resend(RESEND_API_KEY);

export const sendEmail = defineAction({
  accept: "form",

  input: z.object({
    name: z.string(),
    email: z.string().email(),
    message: z.string().min(10).max(500),
  }),

  handler: async (input) => {
    const { data, error } = await resend.emails.send({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: [RESEND_TO_EMAIL],
      subject: `Email de ${input.name}`,
      html: `
        <h1>Nuevo mensaje de ${input.name}</h1>
        <p><strong>Email:</strong> ${input.email}</p>
        <p><strong>Mensaje:</strong> ${input.message}</p>
      `,
    });

    if (error)
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al enviar email",
      });

    return data;
  },
});
```

Puntos clave:

- `accept: 'form'` - Maneja FormData directamente de formularios HTML
- `input` - El esquema Zod valida antes de ejecutar el handler
- `handler` - Lógica del servidor, puede usar secretos de forma segura

## Variables de Entorno Type-Safe

Astro 5 introdujo `astro:env/server` para variables de entorno type-safe:

```typescript
// astro.config.mjs
export default defineConfig({
  env: {
    schema: {
      RESEND_API_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      RESEND_TO_EMAIL: envField.string({
        context: "server",
        access: "public",
        default: "tu@ejemplo.com",
      }),
    },
  },
});
```

Ahora TypeScript sabe exactamente qué variables de entorno existen y sus tipos.

## Manejo de Errores con Sentido

Mapea errores de API a respuestas amigables para el usuario:

```typescript
handler: async (input) => {
  try {
    const { data, error } = await resend.emails.send({
      /* ... */
    });

    if (error) {
      // Mapear tipos de error específicos
      if (error.name === "validation_error") {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Formato de email o contenido inválido",
        });
      }
      if (error.name === "rate_limit_exceeded") {
        throw new ActionError({
          code: "TOO_MANY_REQUESTS",
          message: "Demasiadas solicitudes. Intenta más tarde.",
        });
      }
      // Fallback por defecto
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al enviar email. Intenta de nuevo.",
      });
    }

    return data;
  } catch (e) {
    // Re-lanzar ActionErrors, envolver otros
    if (e instanceof ActionError) throw e;
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Servicio de email no disponible.",
    });
  }
};
```

## Usando Actions en Páginas Astro

El formulario es HTML puro - no requiere JavaScript:

```astro
---
import { actions } from 'astro:actions'

export const prerender = false  // Requerido para manejo del servidor

const result = Astro.getActionResult(actions.sendEmail)
---

{result && !result.error && (
  <p class="success">¡Email enviado exitosamente!</p>
)}

{result?.error && (
  <p class="error">{result.error.message}</p>
)}

<form method="POST" action={actions.sendEmail}>
  <label for="name">Nombre</label>
  <input type="text" id="name" name="name" required />

  <label for="email">Email</label>
  <input type="email" id="email" name="email" required />

  <label for="message">Mensaje</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Enviar</button>
</form>
```

Nota:

- `export const prerender = false` - Desactiva generación estática para esta página
- `Astro.getActionResult()` - Obtiene el resultado después del envío
- `action={actions.sendEmail}` - Referencia a la action type-safe

## Campos Honeypot para Protección contra Bots

Agrega un campo oculto que los bots llenarán pero los humanos no:

```astro
<form method="POST" action={actions.sendEmail}>
  <!-- Honeypot - oculto para humanos, visible para bots -->
  <input
    type="text"
    name="botcheck"
    style="position: absolute; left: -9999px;"
    tabindex="-1"
    autocomplete="off"
  />

  <!-- Campos reales -->
  <input type="text" name="name" required />
  <!-- ... -->
</form>
```

Luego valida en tu action:

```typescript
input: z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string().min(10).max(500),
  botcheck: z.string().max(0).optional(), // Debe estar vacío
}),

handler: async (input) => {
  if (input.botcheck) {
    // Rechazo silencioso - no dejar que los bots sepan que fueron detectados
    return { success: true }
  }
  // Continuar con envío real
}
```

## Exportando Actions

Todas las actions deben exportarse desde `src/actions/index.ts`:

```typescript
// src/actions/index.ts
import { sendEmail } from "./sendEmail";

export const server = {
  sendEmail,
  // Agregar más actions aquí
};
```

## Mejora Progresiva

Para UX mejorada con JavaScript, puedes enviar vía fetch:

```javascript
const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  const response = await fetch(form.action, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  // Manejar resultado...
});
```

Pero el formulario funciona sin JavaScript también - esa es la belleza de los server actions.

## Puntos Clave

1. **Type-safe por defecto** - Zod valida entrada, TypeScript valida uso
2. **Secretos seguros** - Variables de entorno solo-servidor nunca se filtran al cliente
3. **Mejora progresiva** - Funciona sin JS, mejorable con JS
4. **Manejo de errores** - Mapear errores de API a mensajes amigables
5. **Protección contra bots** - Campos honeypot son simples y efectivos

Los server actions hacen de Astro un competidor serio para aplicaciones full-stack, no solo sitios estáticos. La experiencia de desarrollador es excelente - define una vez, usa en todas partes, con type safety completo.
