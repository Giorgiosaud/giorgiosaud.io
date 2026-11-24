import { ActionError, defineAction } from 'astro:actions'
import {
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  RESEND_FROM_NAME,
  RESEND_TO_EMAIL,
} from 'astro:env/server'
import { verifyTurnstile } from '@lib/turnstile'
import { Resend } from 'resend'
import { MESSAGE_MAX_LENGTH, MESSAGE_MIN_LENGTH } from '../config/constants'

const resend = new Resend(RESEND_API_KEY)

// User input is interpolated into the email HTML, so it must be escaped
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    char =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char] as string,
  )

import { z } from 'astro:schema'

/**
 * Server action for sending contact form emails via Resend API.
 *
 * Accepts form data with name, email, and message fields.
 * Validates input using Zod schema before sending.
 *
 * @throws {ActionError} With specific codes:
 *   - 'BAD_REQUEST' - Invalid email format or missing required fields
 *   - 'FORBIDDEN' - Turnstile verification failed
 *   - 'TOO_MANY_REQUESTS' - Rate limit exceeded
 *   - 'INTERNAL_SERVER_ERROR' - Network errors or service unavailable
 *
 * Environment variables required:
 * - RESEND_API_KEY: Resend API key (secret)
 * - RESEND_TO_EMAIL: Recipient email address
 * - RESEND_FROM_EMAIL: Sender email address
 * - RESEND_FROM_NAME: Sender display name
 */
export const sendEmail = defineAction({
  accept: 'form',

  input: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email(),
    message: z.string().trim().min(MESSAGE_MIN_LENGTH).max(MESSAGE_MAX_LENGTH),
    // Honeypot: hidden from people, bots tend to fill it
    website: z.string().optional(),
    // Injected by the Turnstile widget
    'cf-turnstile-response': z.string().optional(),
  }),
  handler: async input => {
    // Pretend success so bots get no signal
    if (input.website)
      return {
        id: null,
      }

    const token = input['cf-turnstile-response'] ?? ''
    if (!(await verifyTurnstile(token))) {
      throw new ActionError({
        code: 'FORBIDDEN',
        message: 'Verification failed. Please try again.',
      })
    }

    const name = escapeHtml(input.name)
    const email = escapeHtml(input.email)
    const message = escapeHtml(input.message).replace(/\n/g, '<br>')
    try {
      const { data, error } = await resend.emails.send({
        from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
        to: [
          RESEND_TO_EMAIL,
        ],
        replyTo: input.email,
        subject: `Email from ${input.name} in Website Form`,
        html: `
          <h1>New message from ${name}</h1>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message}</p>
        `,
      })

      if (error) {
        // Surface the failure in `wrangler tail`; never log the API key or message body
        console.error('[sendEmail] Resend error', error.name, error.message)
        // Map Resend error types to appropriate ActionError codes
        if (error.name === 'validation_error') {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'Invalid email format or content',
          })
        }
        if (error.name === 'rate_limit_exceeded') {
          throw new ActionError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests. Please try again later.',
          })
        }
        if (error.name === 'missing_required_field') {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'Missing required field in email',
          })
        }
        // Default error for other Resend errors
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send email. Please try again.',
        })
      }

      return data
    } catch (e) {
      // Re-throw ActionErrors as-is
      if (e instanceof ActionError) {
        throw e
      }
      // Network or unexpected errors
      console.error('[sendEmail] unexpected error', e)
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Email service unavailable. Please try again later.',
      })
    }
  },
})
