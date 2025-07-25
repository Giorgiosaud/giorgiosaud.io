import { ActionError, defineAction } from 'astro:actions'
import { RESEND_API_KEY } from 'astro:env/server'

import { Resend } from 'resend'

const resend = new Resend(RESEND_API_KEY)

import { z } from 'astro:schema'

export const sendEmail = defineAction({
  accept: 'form',

  input: z.object({
    name: z.string(),
    email: z.string().email(),
    message: z.string().min(10).max(500),
  }),
  handler: async (input) => {
    const { data, error } = await resend.emails.send({
      from: 'Website <notebook@web.giorgiosaud.io>',
      to: ['jorgelsaud@gmail.com'],
      subject: `Email from ${input.name} in Website Form`,
      html: `
            <h1>New message from ${input.name}</h1>
            <p><strong>Email:</strong> ${input.email}</p>
            <p><strong>Message:</strong> ${input.message}</p>
            `,
    })

    if (error) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: error.message,
      })
    }

    return data
  },
})
