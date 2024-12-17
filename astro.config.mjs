import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import serviceWorker from "astrojs-service-worker";
import vercel from "@astrojs/vercel";
import vue from "@astrojs/vue";
import react from "@astrojs/react";
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "https://giorgiosaud.io",
  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  redirects: {
    "/atributos-srcset-y-sizes-en-un-tag-de-imagen-img": {
      status: 302,
      destination: "/notebook/tag-link",
    },
    "/tag/*": {
      status: 302,
      destination: "/notebook",
    },
    "/problemas-comunes-de-integracion-front-end": {
      status: 302,
      destination: "/notebook/really-common-issues-integrating-from-front-end",
    },
    "arquitectura-de-micro-frontend": {
      status: 302,
      destination: "/notebook/microfrontend",
    },
  },
  security: {
    checkOrigin: true,
  },
  integrations: [serviceWorker(), tailwind(), mdx(), sitemap({
    entryLimit: 10000,
    changefreq: "weekly",
    priority: 0.7,
    lastmod: new Date(),
  }), icon({
    iconDir: "src/components/ui/icons",
    include: {
      uil: ["*"],
      bx: ["*"],
      "simple-icons": ["*"],
    },
  }), vue(), 
  react(), 
  svelte()],
  image: {
    domains: ["https://res.cloudinary.com"],
  },
  adapter: vercel({
    // webAnalytics: { enabled: true },
    isr: true,

  }),
  markdown: {
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://shiki.style/themes
      theme: "vitesse-dark",
      // Alternatively, provide multiple themes
      // See note below for using dual light/dark themes
      // Disable the default colors
      // https://shiki.style/guide/dual-themes#without-default-color
      // (Added in v4.12.0)
      defaultColor: false,
      // Add custom languages
      // Note: Shiki has countless langs built-in, including .astro!
      // https://shiki.style/languages
      langs: [],
      // Enable word wrap to prevent horizontal scrolling
      wrap: true,
      // Add custom transformers: https://shiki.style/guide/transformers
      // Find common transformers: https://shiki.style/packages/transformers
      transformers: [],
    },
  },
});