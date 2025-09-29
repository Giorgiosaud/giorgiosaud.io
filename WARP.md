# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

**Package Manager**: This project uses Bun as the primary package manager (bun.lockb is present), with pnpm as secondary (pnpm-lock.yaml).

```bash
# Install dependencies
bun install

# Development server
bun run dev

# Build for production
bun run build

# Preview built site locally
bun run preview

# Linting and formatting (using Biome)
bun run lint        # lint with auto-fix
bun run lint:fix    # check and format

# Testing (if vitest is installed)
vitest              # run tests
vitest --ui         # run with UI
```

## Architecture Overview

This is a **multilingual personal web development notebook** built with Astro 5, featuring:

### Core Architecture
- **Astro 5** with islands architecture supporting React, Vue, and Svelte components
- **Content Collections** for structured content management with bilingual support (en/es)
- **Vercel deployment** with ISR (Incremental Static Regeneration) enabled
- **MDX support** for rich content authoring with interactive components

### Content Architecture
The content system is built around Astro Content Collections with strict TypeScript schemas:

**Collection Structure**:
- `notes/notas` - Blog posts/articles (en/es)
- `portfolio/portafolio` - Project showcases (en/es)
- `team/equipo` - Author/team member profiles (en/es)
- `collections/colecciones` - Content categories (en/es)
- `badges/insignias` - Achievement/certification badges (en/es)
- `pages/paginas` - Static pages (en/es)
- `technologies` - Technology reference data (JSON)

**Key Content Features**:
- **Self-healing URLs**: Notes use a `selfHealing` field (6 characters, no vowels/dashes) for URL stability
- **Cross-references**: Collections use Astro's `reference()` system for type-safe relationships
- **Bilingual routing**: Automatic route generation with Spanish paths under `/es`

### I18n System
- Routes defined in `src/global/i18n/routes.ts`
- UI translations in `src/global/i18n/ui.ts`
- Default language: English (`en`)
- Spanish content lives under `/es` path prefix

### Component Architecture
- **Island components** in React, Vue, and Svelte coexist
- **Astro components** for static content and layouts
- **Form actions** using Astro's server actions with Resend integration
- **Icon system** with extensive SVG icon collection

### Development Environment
- **TypeScript** throughout with strict typing
- **Biome** for linting/formatting (replaces ESLint/Prettier)
- **Content validation** with Zod schemas in content collections
- **Testing setup** with Vitest and @testing-library for component testing

## Important File Patterns

**Content Creation**:
- New notes: `src/content/notes/en/slug.md` (and `es/slug.md` for Spanish)
- Portfolio items: `src/content/portfolio/en/slug.md`
- Content schemas defined in respective `config.ts` files

**Component Development**:
- Astro components: `.astro` extension
- React islands: `.tsx` files in components directory
- Vue islands: `.vue` files
- Svelte islands: `.svelte` files

**Configuration Files**:
- `astro.config.mjs` - Main Astro configuration with integrations
- `src/content.config.ts` - Content collections registry
- `biome.json` - Linting and formatting rules
- Environment variables managed through Astro's `envField` system

## Content Authoring Guidelines

**Note Frontmatter Requirements**:
```yaml
draft: false
title: "Your Title"
selfHealing: "smthng"  # 6 chars, no vowels/dashes
publishDate: "2025-01-01"
author: team/author-slug
category: "category-name"
collections: [collections/collection-slug]
tags: ["tag1", "tag2"]
```

**Environment Variables**:
```env
# Optional - for analytics and forms
PUBLIC_TAG_MANAGER_ID="GTM-XXXXXX"
PUBLIC_RECAPTCHA_KEY=""
RECAPTCHA_SECRET=""
RESEND_API_KEY=""
```

## Testing

Test files are located in the `tests/` directory. The project uses Vitest with Astro Container for component testing:

```bash
# Run a specific test file
vitest tests/components/contactform.test.tsx

# Run all tests
vitest

# Run tests in watch mode
vitest --watch
```

## Deployment

- **Platform**: Vercel with `@astrojs/vercel` adapter
- **ISR enabled**: Incremental Static Regeneration with skew protection
- **Build output**: Static site with server functions for actions
- Environment variables set in Vercel dashboard for production