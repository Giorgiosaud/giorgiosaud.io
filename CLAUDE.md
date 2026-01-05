# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Package Manager**: Use Bun (primary - `bun.lockb` present) or pnpm (`pnpm-lock.yaml`) for this project.

```bash
# Install dependencies
bun install

# Development server
bun run dev

# Build for production
bun run build

# Preview production build locally
bun run preview

# Linting and formatting (Biome)
bun run lint        # lint with auto-fix
bun run lint:fix    # check and format

# Testing (if vitest is installed)
vitest                              # run all tests
vitest tests/components/contactform.test.tsx  # run specific test
```

## Architecture Overview

This is a **multilingual (English/Spanish) personal web development notebook** built with Astro 5. The site uses an islands architecture combining Astro, React, Vue, and Svelte components, with content managed through Astro Content Collections.

### Content Collections System

The content is organized using Astro Content Collections with strict TypeScript schemas. Each collection is defined in `src/content/{collection}/config.ts` and uses Astro's `glob` loader to load content from language-specific directories.

**Collection Mappings**:
- `notes` (en) / `notas` (es) - Blog posts and articles
- `portfolio` (en) / `portafolio` (es) - Project showcases
- `team` (en) / `equipo` (es) - Author profiles
- `collections` (en) / `colecciones` (es) - Content categories
- `badges` (en) / `insignias` (es) - Achievements and certifications
- `pages` (en) / `paginas` (es) - Static pages
- `technologies` - Technology reference data (JSON)

**Important Patterns**:

1. **Loader Pattern**: All collections use `glob` loader with `pattern: '**/[^_]*.(md|mdx)'` (or `*.md`) and `base: './src/content/{collection}/en'` or `/es`. Files starting with `_` are ignored.

2. **Shared Schemas**: Bilingual collections share schemas defined in `src/content/schemas/`. Notes use `noteSchema.ts` for DRY schema definition imported by both `notes` and `notas` collections.

3. **Collection Query Layer**: Use helpers in `src/helpers/collections.ts` for consistent collection queries:
   - `getPublishedNotes(lang)` - Returns published notes sorted by date, shows drafts in dev mode
   - `isDraftInDevMode(data)` - Checks if a post should show DRAFT badge

4. **Self-healing URLs**: Notes use a required `selfHealing` field (6 characters, no vowels/dashes, regex defined in `@config/constants`). Generate codes with CLI: `bun run generate:selfheal "Post Title"`.

5. **Type-safe references**: Content collections use Astro's `reference()` for relationships:
   - Notes reference `author: reference('team')`
   - Notes reference `collections: z.array(reference('collections'))`

6. **Date handling**: `publishDate` fields are defined as `z.date()` in schemas. Astro automatically transforms ISO date strings from frontmatter to Date objects.

7. **Draft Preview**: Drafts are automatically visible in dev mode (`bun run dev`) with a visual "DRAFT" badge. Production builds exclude drafts.

### Multi-Framework Islands

Components can be written in multiple frameworks that coexist in the same project:
- **Astro components** (`.astro`) - For static layouts and server-rendered content
- **React islands** (`.tsx`) - Interactive components with React
- **Vue islands** (`.vue`) - Interactive components with Vue
- **Svelte islands** (`.svelte`) - Interactive components with Svelte

Only use `client:*` directives when components need client-side interactivity.

### I18n Implementation

**Routing**:
- English is the default language (no prefix)
- Spanish routes use `/es` prefix
- Route translations defined in `src/global/i18n/routes.ts`
- UI translations in `src/global/i18n/ui.ts`
- Utilities in `src/global/i18n/utils.ts` handle language detection and translation helpers

**Content Structure**:
- English content: `src/content/{collection}/en/`
- Spanish content: `src/content/{collection}/es/`

### TypeScript Path Aliases

Configured in `tsconfig.json` for cleaner imports:

```typescript
@templates/*        → src/global/templates/*
@icons/*           → src/icons/*
@global-components/* → src/global/components/*
@components/*      → src/components/*
@global-styles/*   → src/global/styles/*
@global-scripts/*  → src/global/scripts/*
@i18n/*           → src/global/i18n/*
@helpers/*        → src/helpers/*
@pages/*          → src/pages/*
@images/*         → src/assets/images/*
@config/*         → src/config/*
```

### Server Actions

Server actions live in `src/actions/` and are exported from `src/actions/index.ts`:
- `sendEmail` - Email sending via Resend API with enhanced error handling
  - Returns specific error codes: `BAD_REQUEST`, `TOO_MANY_REQUESTS`, `INTERNAL_SERVER_ERROR`
- Actions use Astro's form actions feature (available in `.astro` files)

### Environment Configuration

Environment variables are defined in `astro.config.mjs` using Astro's `envField` system:

**Client-side (public)**:
- `TAG_MANAGER_ID` - Google Tag Manager ID (optional)
- `TURNSTILE_SITE_KEY` - Cloudflare Turnstile site key for comments (optional)

**Server-side (secret)**:
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret key (optional)
- `RESEND_API_KEY` - Resend email API key (optional)

**Server-side (public)**:
- `RESEND_TO_EMAIL` - Default recipient (default: `jorgelsaud@gmail.com`)
- `RESEND_FROM_EMAIL` - Default sender (default: `notebook@web.giorgiosaud.io`)
- `RESEND_FROM_NAME` - Default sender name (default: `Notebook`)

In code, access these via `import.meta.env.TAG_MANAGER_ID`, etc. Astro handles the public/secret distinction automatically.

### Page Routing

**Dynamic Routes**:
- `/notebook/[note]` - Individual note pages with self-healing redirects via `/notebook/[selfheal].astro`
- `/notebook/[page]` - Paginated note listings
- `/[slug]` - Static pages from content collections
- `/team/[member]` - Team member profiles

**Spanish Routes**:
- All routes mirror under `/es/` prefix
- Route translations handled in `src/global/i18n/routes.ts`

**Special Routes**:
- `/rss.xml.ts` - RSS feed generation
- `/robots.txt.ts` - Dynamic robots.txt

### Testing

Tests use Vitest with Astro's experimental container API for component testing:
- Test files in `tests/` directory
- Use `experimental_AstroContainer` to render Astro components
- Example: `tests/components/contactform.test.tsx`

No `vitest.config.ts` is present; Vitest uses defaults.

## Deployment (Vercel)

Configured with `@astrojs/vercel` adapter in `astro.config.mjs`:
- **ISR enabled**: Incremental Static Regeneration
- **Skew protection**: Enabled for gradual rollouts
- Set environment variables in Vercel dashboard

## Code Quality

**Biome** is used for both linting and formatting (replaces ESLint + Prettier):
- Configuration: `biome.json`
- Runs on all file types (JS, TS, JSX, TSX, Astro, etc.)
- Integrated into `bun run lint` and `bun run lint:fix`

**TypeScript**:
- Extends `astro/tsconfigs/strict`
- Strict null checks enabled
- All imports should use path aliases where appropriate

### Performance Optimizations

**Self-hosted Fonts**: Uses fontsource packages instead of Google Fonts for better performance and privacy:
- `@fontsource/poppins` (400, 500, 600, 700 weights)
- `@fontsource/roboto-mono` (400, 500 weights)
- Imported in `src/global/components/Head/index.astro`

**Lazy Loading**: The AI summarizer (Chrome's Summarizer API) lazy-loads the `marked` markdown library only when the user clicks the summarize button, reducing initial page load.

### Developer Tools

**Self-healing Code Generator**:
```bash
bun run generate:selfheal "My Post Title"     # Generate code from title
bun run generate:selfheal --validate "rhythm" # Validate existing code
bun run generate:selfheal --alts "Title"      # Generate alternatives
```
Located in `scripts/generateSelfHealingCode.ts`.
