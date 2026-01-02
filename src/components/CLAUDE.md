# Components Guide

This directory contains Astro components used throughout the site. The project uses a multi-framework islands architecture.

## Component Types

### Astro Components (.astro)
- Default format for most components
- Server-rendered by default
- Can include any framework as islands within them
- Examples: `ContactForm.astro`, `Hero.astro`, `Note.astro`

### React Components (.tsx)
- Located in `src/example-components/react/`
- Must use `client:*` directive to hydrate
- Available directives: `client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`

### Vue Components (.vue)
- Located in `src/example-components/vue/`
- Same client directive rules as React

### Svelte Components (.svelte)
- Located in `src/example-components/svelte/`
- Same client directive rules as React

## Global Components

Global reusable components are in `src/global/components/`:
- Used across multiple pages
- Generally layout-focused or structural

## Component Patterns

### Using TypeScript Path Aliases
Import components using configured aliases:
```astro
import Hero from '@components/Hero.astro'
import Layout from '@global-components/Layout.astro'
import MyIcon from '@icons/MyIcon.astro'
```

### Multi-language Components
Components should receive language as a prop when displaying text:
```astro
---
interface Props {
  lang?: 'en' | 'es'
}

const { lang = 'en' } = Astro.props
---
```

Use i18n utilities from `@i18n/utils` for translations.

### Client Hydration
Only add `client:*` directives when client-side interactivity is needed:
```astro
<!-- Static - no directive needed -->
<StaticComponent />

<!-- Needs client interaction -->
<InteractiveComponent client:load />
```

## Icon System

Icons are in `src/icons/` directory:
- Use the `<Icon />` component wrapper
- Icons are SVG-based Astro components
- Extensive collection available (130+ icons)

## Contact Form Pattern

`ContactForm.astro` demonstrates:
- Server-side form actions via `actions.sendEmail`
- Resend API integration
- Form validation with Zod schemas
- Honeypot field for bot protection (`name="botcheck"`)

Reference this component when building other forms.
