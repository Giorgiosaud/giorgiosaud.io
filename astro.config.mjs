import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import { shield } from '@kindspells/astro-shield'
import { resolve } from 'node:path'
import partytown from '@astrojs/partytown'

const rootDir = new URL('.', import.meta.url).pathname
const modulePath = resolve(rootDir, 'src', 'generated', 'sriHashes.mjs')
// https://astro.build/config
export default defineConfig({
  site: "https://giorgiosaud.io",
  integrations: [tailwind(), mdx(), sitemap(),icon({
    iconDir: "src/components/ui/icons",
    include:{
      uil:['*'],
      bx:['*'],
      'simple-icons':['*'],
    }
  }),
  shield({
    sri: {
      enableMiddleware: true,   // MUST be enabled!
      hashesModule: modulePath, // SHOULD be set!
    },

    // - If set, it controls how the security headers will be generated in the
    //   middleware.
    // - If not set, no security headers will be generated in the middleware.
    securityHeaders: {
      // - If set, it controls how the CSP (Content Security Policy) header will
      //   be generated in the middleware.
      // - If not set, no CSP header will be generated in the middleware.
      contentSecurityPolicy: {
        // - If set, it controls the "default" CSP directives (they can be
        //   overriden at runtime).
        // - If not set, the middleware will use a minimal set of default
        //   directives.
        cspDirectives: {
          'default-src': "'self' https://cdn.giorgiosaud.io",
        }
      }
    }
  }),
  partytown({
    config: {
      forward: ["dataLayer.push"],
    },
  }),],
});
