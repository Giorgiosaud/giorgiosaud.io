# Notes Collection - Writing Guide

## Voice & Tone

**Voice**: Friendly, knowledgeable developer sharing practical insights
**Tone**: Conversational yet professional, like explaining to a peer over coffee
**Style**: Clear explanations, real-world examples, honest about challenges

### Writing Principles
- Start with why it matters, then explain how
- Use real code examples, not abstract theory
- Be honest about complexity - "simplified explanation" is okay
- Write in first person when sharing experiences
- Keep it practical and immediately useful

## Content Structure

Notes should follow this pattern:
1. **Hook** - Why this matters / what problem it solves
2. **Explanation** - Clear, simplified concept breakdown
3. **Code Examples** - Practical, working code
4. **Use Cases** - Real scenarios where you'd use this
5. **Gotchas** - Common mistakes or things to watch out for (optional)

## Creating a New Note — Step by Step

### 1. Generate the selfHealing code

```bash
bun run generate:selfheal "Your Post Title"
```

This outputs a 6-character consonant-only code to use in frontmatter. Both language versions **must share the same code** — it's used to link EN ↔ ES translations.

### 2. Choose a filename

Files go in `src/content/notes/en/` and `src/content/notes/es/`. Use a descriptive kebab-case slug **without a date prefix**:

```
good: better-auth-drizzle-neon-astro.md
bad:  2026-05-24-better-auth-drizzle-neon-astro.md
```

### 3. Generate a cover image prompt for Gemini

Before writing the post, generate a cover image using [Google Gemini](https://gemini.google.com) or any image generation tool. Use this prompt template (replace the bracketed parts):

```
Create a clean, modern tech blog cover image for a post titled "[POST TITLE]".
Style: flat illustration, dark background (#0f172a or similar), vibrant accent colors.
Include visual metaphors for [MAIN TOPICS, e.g. "authentication, database, lock icon"].
No text in the image. 16:9 aspect ratio. Minimalist and professional.
```

Save the generated image to `src/assets/images/{slug}.webp` and reference it in the frontmatter as:
```yaml
cover: ../../../assets/images/{slug}.webp
coverAlt: Brief description of the image
```

### 4. Write the English version

```markdown
---
draft: true
title: "Your Post Title"
description: "One or two sentence summary for SEO and previews."
publishDate: YYYY-MM-DD
selfHealing: xxxxxx   # from step 1
lang: en
category: development
author: giorgio-saud
collections:
  - relevant-collection
tags:
  - tag1
  - tag2
cover: ../../../assets/images/{slug}.webp
coverAlt: Image description
---

Content here...
```

### 5. Write the Spanish version

Same frontmatter with `lang: es`, title and description translated. Keep technical terms in English when natural (e.g., "passkeys", "OAuth"). The `selfHealing` code must be identical.

### 6. Publishing checklist

Before setting `draft: false`:
- [ ] `selfHealing` is the same in both EN and ES files
- [ ] Code examples are tested and working
- [ ] Cover image exists at the referenced path
- [ ] Author reference exists in the team collection
- [ ] Collection references exist
- [ ] Both EN and ES versions are complete

## Self-Healing Field Reference

The `selfHealing` code enables two features:
1. Redirects old slugs to the current URL if the filename ever changes
2. Links the EN and ES versions of the same post for the "read in [language]" button

Rules:
- Exactly 6 characters
- No vowels (`aeiouAEIOU`) and no dashes
- Regex: `/^[^aeiouAEIOU-]{6}$/`

## Category Guidelines

- `development` - General coding practices
- `patterns` - Design patterns, architectural patterns
- `architecture` - System design, project structure
- `performance` - Optimization, profiling
- `testing` - Testing strategies, tools
- `devops` - Deployment, CI/CD
- `frontend` - UI/UX, frameworks
- `backend` - APIs, databases
- `security` - Security topics

## Examples of Good Note Titles

✅ "Understanding the Observer Pattern in JavaScript"
✅ "Simplified Explanation of React Hooks"
✅ "Why Your API is Slow (and How to Fix It)"
✅ "Better Auth with Drizzle and Neon in Astro"

❌ "Design Patterns" (too broad)
❌ "My Thoughts on Code" (not specific)
❌ "Tutorial #5" (not descriptive)
