import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';

import react from "@astrojs/react";

import vue from "@astrojs/vue";

import svelte from "@astrojs/svelte";

import vercel from "@astrojs/vercel";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), react(), vue(), svelte(), sitemap()],

  experimental: {
    // csp:{
    //     algorithm:"SHA-512",
    //     directives:[
    //         "default-src 'self' https://*.cloudinary.com https://*.cloudinary.com https://*.google-analytics.com https://*.googletagmanager.com",
    //         "img-src 'self' https://*.cloudinary.com https://developers.google.com https://images.credly.com",
    //         "font-src 'self' https://fonts.gstatic.com",
    //     ],
    //     styleDirective:{
    //         hashes: [
    //             "sha384-styleHash",
    //             "sha512-styleHash",
    //             "sha256-styleHash"
    //         ],
    //         resources: [
    //             "self",
    //             "https://styles.cdn.example.com"
    //         ]
    //     }

    // },
    contentIntellisense: true,
  },

  redirects: {
    about: 'about-this-notebook'
  },

  env: {
    schema: {
      TAG_MANAGER_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_CLOUDINARY_CLOUD_NAME: envField.string({ context: "server", access: "public", optional: true }),
      CLOUDINARY_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      CLOUDINARY_API_SECRET: envField.string({ context: "server", access: "secret", optional: true }),
    }
  },

  adapter: vercel({

    skewProtection: true,
    isr: true,
  })
});