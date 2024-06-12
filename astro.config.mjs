import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import { resolve } from 'node:path';
import cloudflare from "@astrojs/cloudflare";
import serviceWorker from "astrojs-service-worker";
const rootDir = new URL('.', import.meta.url).pathname;
const modulePath = resolve(rootDir, 'src', 'generated', 'sriHashes.mjs');

// https://astro.build/config
export default defineConfig({
  site: "https://giorgiosaud.io",
  output: "hybrid",
  redirects:{
    '/atributos-srcset-y-sizes-en-un-tag-de-imagen-img': {
      status:302,
      destination:'/notebook/tag-link',
    },
    '/tag/*': {
      status:302,
      destination:'/notebook',
    },
    '/problemas-comunes-de-integracion-front-end': {
      status:302,
      destination:'/notebook/really-common-issues-integrating-from-front-end',
    },
    'arquitectura-de-micro-frontend':{
      status:302,
      destination:'/notebook/microfrontend',
    },
  },
  security: {
    checkOrigin: true
  },
  integrations: [serviceWorker(),tailwind(), mdx(), sitemap({
    entryLimit: 10000,
    changefreq: 'weekly',
    priority: 0.7,
    lastmod: new Date('2022-02-24')
  }), icon({
    iconDir: "src/components/ui/icons",
    include: {
      uil: ['*'],
      bx: ['*'],
      'simple-icons': ['*']
    }
  })],
  adapter: cloudflare({
    imageService: 'cloudflare'
  }),
  image:{
    domains:['https://res.cloudinary.com']
  }
});