import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import { resolve } from 'node:path';
const rootDir = new URL('.', import.meta.url).pathname;
const modulePath = resolve(rootDir, 'src', 'generated', 'sriHashes.mjs');

// https://astro.build/config
export default defineConfig({
  site: "https://giorgiosaud.io",
  redirects: {
    '/notebook': {
      status: 302,
      destination: '/notebook/1'
    }
  },
  security: {
    checkOrigin: true
  },
  integrations: [tailwind(), mdx(), sitemap({
    entryLimit: 10000,
    changefreq: 'weekly',
    priority: 0.7,
    lastmod: new Date('2022-02-24'),
  }), icon({
    iconDir: "src/components/ui/icons",
    include: {
      uil: ['*'],
      bx: ['*'],
      'simple-icons': ['*']
    }
  })]
});