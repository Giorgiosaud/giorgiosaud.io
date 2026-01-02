---
draft: false
title: "Server Actions in Astro: Forms Done Right"
description: Learn how to build secure, type-safe forms with Astro's server actions, including Zod validation, error handling, and bot protection patterns.
publishDate: 2026-01-02
cover: ../../../assets/images/freepik__pixel-art-quiero-una-imagen-para-este-notebook-pos__50452.jpeg
coverAlt: Server Actions in Astro illustration
selfHealing: srvrct
lang: en
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

## Why Server Actions?

Before Astro's server actions, handling forms in static sites meant either:

- Setting up a separate API endpoint
- Using third-party form services
- Client-side JavaScript with fetch calls

Server actions change everything. They give you type-safe, validated, server-side form handling with a single function definition. Let me show you how I implemented a contact form with proper error handling and security.

## Defining the Action

Server actions live in `src/actions/`. Here's a real email-sending action:

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
      subject: `Email from ${input.name}`,
      html: `
        <h1>New message from ${input.name}</h1>
        <p><strong>Email:</strong> ${input.email}</p>
        <p><strong>Message:</strong> ${input.message}</p>
      `,
    });

    if (error)
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send email",
      });

    return data;
  },
});
```

Key points:

- `accept: 'form'` - Handles FormData directly from HTML forms
- `input` - Zod schema validates before handler runs
- `handler` - Server-side logic, can use secrets safely

## Type-Safe Environment Variables

Astro 5 introduced `astro:env/server` for type-safe environment variables:

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
        default: "you@example.com",
      }),
    },
  },
});
```

Now TypeScript knows exactly what environment variables exist and their types.

## Error Handling That Makes Sense

Map API errors to user-friendly responses:

```typescript
handler: async (input) => {
  try {
    const { data, error } = await resend.emails.send({
      /* ... */
    });

    if (error) {
      // Map specific error types
      if (error.name === "validation_error") {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Invalid email format or content",
        });
      }
      if (error.name === "rate_limit_exceeded") {
        throw new ActionError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
        });
      }
      // Default fallback
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send email. Please try again.",
      });
    }

    return data;
  } catch (e) {
    // Re-throw ActionErrors, wrap others
    if (e instanceof ActionError) throw e;
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Email service unavailable.",
    });
  }
};
```

## Using Actions in Astro Pages

The form itself is pure HTML - no JavaScript required:

```astro
---
import { actions } from 'astro:actions'

export const prerender = false  // Required for server-side handling

const result = Astro.getActionResult(actions.sendEmail)
---

{result && !result.error && (
  <p class="success">Email sent successfully!</p>
)}

{result?.error && (
  <p class="error">{result.error.message}</p>
)}

<form method="POST" action={actions.sendEmail}>
  <label for="name">Name</label>
  <input type="text" id="name" name="name" required />

  <label for="email">Email</label>
  <input type="email" id="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send</button>
</form>
```

Notice:

- `export const prerender = false` - Disables static generation for this page
- `Astro.getActionResult()` - Gets the result after form submission
- `action={actions.sendEmail}` - Type-safe action reference

## Honeypot Fields for Bot Protection

Add a hidden field that bots will fill but humans won't:

```astro
<form method="POST" action={actions.sendEmail}>
  <!-- Honeypot - hidden from humans, visible to bots -->
  <input
    type="text"
    name="botcheck"
    style="position: absolute; left: -9999px;"
    tabindex="-1"
    autocomplete="off"
  />

  <!-- Real fields -->
  <input type="text" name="name" required />
  <!-- ... -->
</form>
```

Then validate in your action:

```typescript
input: z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string().min(10).max(500),
  botcheck: z.string().max(0).optional(), // Must be empty
}),

handler: async (input) => {
  if (input.botcheck) {
    // Silent rejection - don't let bots know they were caught
    return { success: true }
  }
  // Continue with real submission
}
```

## Exporting Actions

All actions must be exported from `src/actions/index.ts`:

```typescript
// src/actions/index.ts
import { sendEmail } from "./sendEmail";

export const server = {
  sendEmail,
  // Add more actions here
};
```

## Progressive Enhancement

For JavaScript-enhanced UX, you can submit via fetch:

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
  // Handle result...
});
```

But the form works without JavaScript too - that's the beauty of server actions.

## Key Takeaways

1. **Type-safe by default** - Zod validates input, TypeScript validates usage
2. **Secure secrets** - Server-only environment variables never leak to client
3. **Progressive enhancement** - Works without JS, enhanceable with JS
4. **Error handling** - Map API errors to user-friendly messages
5. **Bot protection** - Honeypot fields are simple and effective

Server actions make Astro a serious contender for full-stack applications, not just static sites. The developer experience is excellent - define once, use everywhere, with full type safety.
