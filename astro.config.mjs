import { defineConfig, envField } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import serviceWorker from "astrojs-service-worker";
import vercel from "@astrojs/vercel/serverless";
import vue from "@astrojs/vue";
import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
const rootDir = new URL(".", import.meta.url).pathname;
//const modulePath = resolve(rootDir, "src", "generated", "sriHashes.mjs");

// https://astro.build/config
export default defineConfig({
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
  integrations: [
    serviceWorker(),
    tailwind(),
    mdx(),
    sitemap({
      entryLimit: 10000,
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),
    icon({
      iconDir: "src/components/ui/icons",
      include: {
        uil: ["*"],
        bx: ["*"],
        "simple-icons": ["*"],
      },
    }),
    vue(),
    react(),
    svelte(),
  ],
  image: {
    domains: ["https://res.cloudinary.com"],
  },
  output: "static",
  adapter: vercel({
    // webAnalytics: { enabled: true },
    isr: true,

  }),
  markdown: {
    shikiConfig: {
      theme: "vitesse-dark",
      defaultColor: false,
      langs: [],
      wrap: true,
      transformers: [],
    },
  },
  env:{
    schema:{
      NOTEBOOK_PER_PAGE: envField.number({context:"server",access:"public",optional:false}),
      WEB_FORMS3_API_KEY: envField.string({context:"server",access:"public",optional:false}),

    }
  }
});
