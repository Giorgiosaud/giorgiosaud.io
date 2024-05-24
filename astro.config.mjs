import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import { resolve } from 'node:path'

const rootDir = new URL('.', import.meta.url).pathname
const modulePath = resolve(rootDir, 'src', 'generated', 'sriHashes.mjs')
// https://astro.build/config
export default defineConfig({
  site: "https://giorgiosaud.io",
  security: {
    checkOrigin: true
  },
  integrations: [tailwind(), mdx(), sitemap(),icon({
    iconDir: "src/components/ui/icons",
    include:{
      uil:['*'],
      bx:['*'],
      'simple-icons':['*'],
    }
  }),

 ],
});
