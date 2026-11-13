import { fileURLToPath } from 'node:url'
import cloudflare from '@astrojs/cloudflare'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import svelte, { vitePreprocess } from '@astrojs/svelte'
import vue from '@astrojs/vue'
import { defineConfig, envField } from 'astro/config'

// Suppress LightningCSS warnings for bleeding-edge pseudo-elements not yet in its spec database
const suppressKnownWarnings = {
  name: 'suppress-known-warnings',
  configResolved(config) {
    const original = config.logger.warn.bind(config.logger)
    config.logger.warn = (msg, options) => {
      // scroll-marker* are progressive enhancement carousel features, not yet in lightningcss spec db
      if (
        msg.includes('lightningcss') &&
        (msg.includes('scroll-marker') ||
          msg.includes('scroll-marker-group') ||
          msg.includes('target-current'))
      )
        return
      if (
        msg.includes('"getTelemetryAuthConfig"') ||
        msg.includes('"optionsMiddleware"')
      )
        return
      original(msg, options)
    }
  },
}

// The Cloudflare Vite plugin sets cssTarget: 'es2024' on its worker environments, which
// lightningcss can't map to browser targets. Use Vite's default browser baseline instead.
const browserCssTarget = [
  'chrome107',
  'edge107',
  'firefox104',
  'safari16',
]
const workerCssTarget = {
  name: 'worker-css-target',
  configResolved(config) {
    if (config.build.cssTarget === 'es2024')
      config.build.cssTarget = browserCssTarget
    for (const environment of Object.values(config.environments)) {
      if (environment.build.cssTarget === 'es2024') {
        environment.build.cssTarget = browserCssTarget
      }
    }
  },
}

// https://astro.build/config
export default defineConfig({
  site: 'https://giorgiosaud.io',
  integrations: [
    mdx(),
    react(),
    vue(),
    svelte({
      preprocess: vitePreprocess({
        script: true,
      }),
      configFile: false,
    }),
    sitemap(),
  ],

  vite: {
    plugins: [
      suppressKnownWarnings,
      workerCssTarget,
    ],
    // picomatch is CJS; pre-bundle it so content loaders can run inside workerd
    optimizeDeps: {
      include: [
        'picomatch',
      ],
    },
    resolve: {
      alias: {
        '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
        '@db': fileURLToPath(new URL('./src/db', import.meta.url)),
      },
    },
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        drafts: {
          customMedia: true,
        },
        // Don't error on unknown at-rules or pseudo-elements (for bleeding-edge CSS like scroll-marker)
        errorRecovery: true,
      },
    },
    build: {
      cssMinify: 'lightningcss',
      inlineStylesheets: 'never',
    },
  },

  experimental: {
    contentIntellisense: true,
  },

  redirects: {
    '/about': '/about-this-notebook',
  },

  env: {
    schema: {
      // Database (Neon Postgres connection string)
      // Optional so the blog keeps serving if the DB is unreachable; src/db handles a missing URL
      POSTGRES_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),

      // Better Auth
      BETTER_AUTH_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),
      BETTER_AUTH_URL: envField.string({
        context: 'client',
        access: 'public',
        optional: false,
        default: 'http://localhost:4321',
      }),

      // OAuth - GitHub
      GITHUB_CLIENT_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      GITHUB_CLIENT_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),

      // OAuth - Google
      GOOGLE_CLIENT_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      GOOGLE_CLIENT_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),

      // OAuth - Facebook
      FACEBOOK_CLIENT_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      FACEBOOK_CLIENT_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),

      // Analytics
      GA4_MEASUREMENT_ID: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),

      // Cloudflare Turnstile (bot protection for comments - required)
      TURNSTILE_SITE_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: false,
      }),
      TURNSTILE_SECRET_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: false,
      }),

      // Email (Resend)
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
        default: 'notebook@notebook.giorgiosaud.io',
      }),
      RESEND_FROM_NAME: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
        default: 'Notebook',
      }),

      // Web Push (VAPID keys - generate with: npx web-push generate-vapid-keys)
      VAPID_PUBLIC_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      VAPID_PRIVATE_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      VAPID_SUBJECT: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
        default: 'mailto:jorgelsaud@gmail.com',
      }),
    },
  },

  output: 'server',

  // The Cloudflare Vite plugin rejects Vitest's SSR environment, so tests run without the adapter
  ...(process.env.VITEST
    ? {}
    : {
        adapter: cloudflare({
          // Optimize images at build time for prerendered pages; no Images binding needed
          imageService: 'compile',
        }),
      }),
})
