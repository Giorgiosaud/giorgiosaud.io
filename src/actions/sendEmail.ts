import { ActionError, defineAction } from 'astro:actions'
import {
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  RESEND_FROM_NAME,
  RESEND_TO_EMAIL,
} from 'astro:env/server'
import { Resend } from 'resend'
import { MESSAGE_MAX_LENGTH, MESSAGE_MIN_LENGTH } from '../config/constants'

const resend = new Resend(RESEND_API_KEY)

import { z } from 'astro:schema'

/**
 * Server action for sending contact form emails via Resend API.
 *
 * Accepts form data with name, email, and message fields.
 * Validates input using Zod schema before sending.
 *
 * @throws {ActionError} With specific codes:
 *   - 'BAD_REQUEST' - Invalid email format or missing required fields
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
    name: z.string(),
    email: z.string().email(),
    message: z.string().min(MESSAGE_MIN_LENGTH).max(MESSAGE_MAX_LENGTH),
  }),
  handler: async input => {
    try {
      const { data, error } = await resend.emails.send({
        from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
        to: [
          RESEND_TO_EMAIL,
        ],
        subject: `Email from ${input.name} in Website Form`,
        html: `
          <h1>New message from ${input.name}</h1>
          <p><strong>Email:</strong> ${input.email}</p>
          <p><strong>Message:</strong> ${input.message}</p>
        `,
      })

      if (error) {
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
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Email service unavailable. Please try again later.',
      })
    }
  },
})
