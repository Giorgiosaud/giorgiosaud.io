import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
import vercel from '@astrojs/vercel'
import vue from '@astrojs/vue'
import { defineConfig, envField } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://giorgiosaud.io',
  integrations: [mdx(), react(), vue(), svelte(), sitemap()],

  experimental: {
    contentIntellisense: true,
  },

  redirects: {
    about: 'about-this-notebook',
  },

  env: {
    schema: {
      TAG_MANAGER_ID: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      PUBLIC_CLOUDINARY_CLOUD_NAME: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
      }),
      CLOUDINARY_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      CLOUDINARY_API_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      RECAPTCHA_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      RECAPTCHA_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      RESEND_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      RESEND_TO_EMAIL: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
        default: 'jorgelsaud@gmail.com',
      }),
      RESEND_FROM_EMAIL: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
        default: 'notebook@web.giorgiosaud.io',
      }),
      RESEND_FROM_NAME: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
        default: 'Notebook',
      }),
    },
  },

  adapter: vercel({
    skewProtection: true,
    isr: true,
  }),
})
