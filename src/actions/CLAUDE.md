# Server Actions Guide

This directory contains Astro server actions for form handling and server-side operations.

## Overview

Astro server actions provide type-safe server-side form handling with automatic validation. All actions are:
- Defined using `defineAction()` from `astro:actions`
- Exported from `index.ts` under the `server` object
- Validated with Zod schemas
- Accessible in `.astro` files via `actions.{actionName}`

## Current Actions

### `sendEmail`
Sends emails via Resend API from contact forms.

**Configuration:**
- Input: Zod schema with `name`, `email`, `message` fields
- Accept: `'form'` - handles FormData directly
- Handler: Sends email using Resend SDK with enhanced error handling

**Error Codes Returned:**
- `BAD_REQUEST` - Invalid email format or missing required fields
- `TOO_MANY_REQUESTS` - Rate limit exceeded
- `INTERNAL_SERVER_ERROR` - Network errors or service unavailable

**Environment Variables Required:**
- `RESEND_API_KEY` - Resend API key (secret, server-side)
- `RESEND_TO_EMAIL` - Recipient email (default: jorgelsaud@gmail.com)
- `RESEND_FROM_EMAIL` - Sender email (default: notebook@web.giorgiosaud.io)
- `RESEND_FROM_NAME` - Sender name (default: Notebook)

Access these via `astro:env/server`:
```typescript
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from 'astro:env/server'
```

## Creating New Actions

1. Create action file (e.g., `myAction.ts`):

```typescript
import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro:schema'

export const myAction = defineAction({
  accept: 'form', // or 'json'

  input: z.object({
    field1: z.string(),
    field2: z.number(),
  }),

  handler: async (input) => {
    // Your server-side logic here

    // Throw ActionError for validation/business logic errors
    if (somethingWrong) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: 'Error message',
      })
    }

    return { success: true, data: input }
  },
})
```

2. Export from `index.ts`:

```typescript
import { myAction } from './myAction'

export const server = {
  sendEmail,
  myAction, // Add your new action
}
```

3. Use in `.astro` files:

```astro
---
import { actions } from 'astro:actions'
---

<form method="POST" action={actions.myAction}>
  <input type="text" name="field1" required />
  <input type="number" name="field2" required />
  <button type="submit">Submit</button>
</form>
```

## Action Configuration

### Accept Types

- `'form'` - Accept FormData (HTML forms)
- `'json'` - Accept JSON payloads

### Error Handling

Use `ActionError` for expected errors:
```typescript
throw new ActionError({
  code: 'BAD_REQUEST', // or other HTTP-like codes
  message: 'User-friendly error message',
})
```

### Input Validation

Always validate inputs with Zod schemas:
```typescript
input: z.object({
  email: z.string().email(),
  message: z.string().min(10).max(500),
  age: z.number().min(18),
})
```

## Security Best Practices

1. **Never expose secrets**: Use `astro:env/server` for API keys
2. **Validate all inputs**: Use Zod schemas comprehensively
3. **Sanitize HTML**: When sending emails with user content
4. **Rate limiting**: Consider implementing for public forms
5. **Honeypot fields**: Use hidden fields to catch bots (see `ContactForm.astro`)

## Email Action Pattern

The `sendEmail` action demonstrates best practices:
- Input validation with Zod
- Environment variable usage
- Error handling with ActionError
- HTML email template generation

Reference this when creating similar actions.

## Testing Actions

Test actions using Vitest with Astro Container:
```typescript
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { actions } from 'astro:actions'

test('action works', async () => {
  const result = await actions.myAction({
    field1: 'test',
    field2: 42,
  })
  expect(result.success).toBe(true)
})
```
