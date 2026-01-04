# giorgiosaud.io – Personal Web Dev Notebook (Astro)

Multilingual (EN/ES) personal web dev notebook built with Astro 5. It mixes Markdown/MDX content with interactive islands using React, Vue, and Svelte. Content is organized with Astro Content Collections and deployed to Vercel.

Live: https://giorgiosaud.io

---

## Features

- Astro 5 with islands (React, Vue, Svelte) and MDX
- Content Collections for: pages, notes, portfolio, team, collections, badges, technologies
- Bilingual content (en, es)
- Sitemap + (optional) RSS
- Form actions via Resend (email) and Cloudflare Turnstile (comments)
- Biome for lint/format, TypeScript, Vercel adapter

## Tech Stack

- Astro 5, TypeScript
- Integrations: @astrojs/mdx, @astrojs/react, @astrojs/vue, @astrojs/svelte, @astrojs/sitemap
- Adapter: @astrojs/vercel
- Tooling: Biome

---

## Quickstart

Prerequisites
- Node.js 20+ (or Bun 1.0+)

Install dependencies

```sh
# With bun (recommended, bun.lockb present)
bun install

# or with npm
npm install
```

Run locally

```sh
# Dev server
bun run dev

# Build
bun run build

# Preview built site
bun run preview
```

Scripts (from package.json)
- dev – astro dev
- build – astro build
- preview – astro preview
- lint – biome lint --write .
- lint:fix – biome check --write .

---

## Environment Variables

Defined in `astro.config.mjs` via `envField`. Create a `.env` file at the project root.

```env
# Public (client) – optional
TAG_MANAGER_ID="GTM-XXXXXX"
TURNSTILE_SITE_KEY=""

# Server – optional
TURNSTILE_SECRET_KEY=""
RESEND_API_KEY=""

# Email defaults (server)
PUBLIC_RESEND_TO_EMAIL="jorgelsaud@gmail.com"
PUBLIC_RESEND_FROM_EMAIL="notebook@web.giorgiosaud.io"
PUBLIC_RESEND_FROM_NAME="Notebook"
```

Notes
- In code, access via `astro:env/client` or `astro:env/server`. Astro handles exposure based on `access` (public/secret) and `context` (client/server).

---

## Content Authoring

Content lives under `src/content` and uses Astro Content Collections. English content is under `/en`, Spanish under `/es`.

Collections and fields

- pages (en/es)
  - title: string
  - description: string
  - pathToTranslate: string

- notes (en: `notes`, es: `notas`)
  - draft: boolean
  - title: string
  - resume: string
  - starred: boolean (optional)
  - selfHealing: string (6 chars, regex `/^[^aeiouAEIOU-]{6}$/`)
  - image: { src: string; alt: string }
  - publishDate: string (ISO, transformed to Date)
  - author: reference("team" | "equipo")
  - category: string
  - collections: reference[] ("collections" | "colecciones")
  - tags: string[]

- portfolio (en: `portfolio`, es: `portafolio`)
  - draft: boolean
  - client: string
  - country: string
  - category: string
  - selfHealing: string (6) optional
  - workingOn: string
  - project: string
  - resume: string
  - classes: string (optional)
  - classesClient: string (optional)
  - image: { src: string; alt: string }
  - publishDate: string (ISO -> Date)
  - technologies: string[]

- team (en: `team`, es: `equipo`)
  - draft: boolean
  - alias: string
  - name: string
  - title: string
  - resume: string
  - pathToTranslate: string
  - avatar: { src: string; alt: string }
  - publishDate: string (ISO -> Date)

- collections (en: `collections`, es: `colecciones`)
  - title: string
  - icon: string
  - description: string

- badges (en: `badges`, es: `insignias`)
  - slug: string
  - title: string
  - imgSrc: string
  - description: string
  - cardColor: string
  - category: string
  - date: date
  - poweredBy: string

- technologies (JSON file)
  - id: string
  - techs: string[]

Example: a note (`src/content/notes/en/my-note.mdx`)

```mdx
---
draft: false
title: "Optional Chaining Everywhere"
resume: "Practical patterns I use weekly."
starred: true
selfHealing: "rhythm" # 6 chars, no vowels or dashes
image:
  src: "/images/notes/optional-chaining.png"
  alt: "Optional chaining diagram"
publishDate: "2025-08-24"
author: team/giorgio-saud
category: "patterns"
collections:
  - collections/patterns
tags:
  - typescript
  - patterns
---

Your MDX content here.
```

Example: a portfolio entry (`src/content/portfolio/en/acme.mdx`)

```md
---
draft: false
client: "ACME Corp"
country: "US"
category: "E‑commerce"
workingOn: "Checkout optimization"
project: "Storefront Rebuild"
resume: "Migrated legacy app to Astro islands with React widgets."
image:
  src: "/images/portfolio/acme.png"
  alt: "ACME storefront"
publishDate: "2025-08-01"
technologies:
  - astro
  - react
  - cloudflare
---

Case study content…
```

---

## Folder Structure (high level)

```
src/
  actions/           # server actions (e.g., sendEmail)
  components/        # Astro/React/Svelte/Vue components
  content/           # Content collections (en/es)
  generated/
  global/            # i18n, scripts, styles, templates
  helpers/
  icons/
  pages/             # Astro pages
  utils/
public/              # static assets
```

---

## Deployment (Vercel)

- Adapter: `@astrojs/vercel` is configured in `astro.config.mjs`.
- Connect the repo to Vercel and deploy; defaults in `vercel.json`.
- Environment variables can be set in Vercel Project Settings.

Caching & ISR
- The adapter is configured with `isr: true` and `skewProtection: true`.

---

## Linting / Formatting

Biome is configured via `biome.json`.

```sh
bun run lint       # lint & write fixes
bun run lint:fix   # check & write
```

---

## Testing (optional)

`vitest.config.ts` is present. To enable tests:

```sh
bun add -D vitest @types/node
```

Then add scripts or run Vitest directly.

```sh
vitest
```

---

## Security

See `SECURITY.md` for vulnerability disclosure.

---

## License

Copyleft © 2025 Giorgiosaud.io — None rights reserved.

Author: [Giorgio Saud](https://github.com/giorgiosaud)