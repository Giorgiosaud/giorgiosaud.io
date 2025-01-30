import { defineConfig, envField } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import vercel from "@astrojs/vercel";
import node from "@astrojs/node";
import vue from "@astrojs/vue";
import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";

let adapter = vercel({
  isr: true,
});

if (process.argv[3] === "--node" || process.argv[4] === "--node") {
  adapter = node({ mode: "standalone" });
}

// https://astro.build/config
export default defineConfig({
  output: "static",
  experimental:{
    svg: true,
  },
  devToolbar:{
    enabled:false,
  },
  site: "https://giorgiosaud.io",
  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
    routing: "manual",
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
  integrations: [mdx(), sitemap({
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
  adapter,
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
  server:{
    headers:{
      "x-content-type-options":"nosniff",
      "x-frame-options":"DENY",
      "x-xss-protection":"1; mode=block",
      "referrer-policy":"strict-origin-when-cross-origin",
      "permissions-policy":"",//camera=(), microphone=(), geolocation=(), interest-cohort=()
      // "cross-origin-embedder-policy":"require-corp",
      "cross-origin-opener-policy":"same-origin-allow-popups",
      "content-security-policy-report":"default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live https://gist.github.com/Giorgiosaud https://static.cloudflareinsights.com https://www.googletagmanager.com/; script-src-elem 'self' 'unsafe-inline' https://g.dev/ https://cdn.credly.com https://vercel.live https://gist.github.com/Giorgiosaud https://static.cloudflareinsights.com https://www.googletagmanager.com/ ;style-src 'self' 'unsafe-inline';style-src-elem 'self' 'unsafe-inline' https://vercel.live/fonts; img-src 'self' data: https://res.cloudinary.com/ https://www.googletagmanager.com; font-src 'self' data:; connect-src 'self' https://fonts.googleapis.com https://res.cloudinary.com/ https://cloudflareinsights.com https://static.cloudflareinsights.com https://www.googletagmanager.com https://api.web3forms.com; frame-src 'self' https://www.credly.com/ https://www.youtube.com https://vercel.live/; object-src 'self'; media-src 'self'; worker-src 'self' blob:; base-uri 'self'; form-action 'self';manifest-src 'self'"
    }
  },
  
  env:{
    schema:{
      CLOUDINARY_API_KEY:envField.string({context:'server',access:'secret'}) ,
      CLOUDINARY_API_SECRET:envField.string({context:'server',access:'secret'}) ,
      // FIREBASE_PRIVATE_KEY_ID:envField.string({context:'server',access:'secret'}) ,
      // FIREBASE_PRIVATE_KEY:envField.string({context:'server',access:'secret'}) ,
      // FIREBASE_PROJECT_ID:envField.string({context:'server',access:'secret'}) ,
      // FIREBASE_CLIENT_EMAIL:envField.string({context:'server',access:'secret'}) ,
      // FIREBASE_CLIENT_ID:envField.string({context:'server',access:'secret'}) ,
      // FIREBASE_AUTH_URI:envField.string({context:'server',access:'secret'}) ,
      // FIREBASE_TOKEN_URI:envField.string({context:'server',access:'secret'}) ,
      // FIREBASE_AUTH_CERT_URL:envField.string({context:'server',access:'secret'}) ,
      // FIREBASE_CLIENT_CERT_URL:envField.string({context:'server',access:'secret'}) ,
      NOTEBOOK_PER_PAGE:envField.number({context:'server',access:'secret'}) ,
      WEB_FORMS3_API_KEY:envField.string({context:'server',access:'secret'}) ,
    }
  },
  vite:{
    plugins:[tailwindcss()]
  }

});