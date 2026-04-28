# Skill Registry — giorgiosaud.io

Generated: 2026-04-28

## User Skills (global)

| Skill | Trigger |
|-------|---------|
| `branch-pr` | Creating a pull request, opening a PR, preparing changes for review |
| `go-testing` | Writing Go tests, using teatest, adding test coverage |
| `issue-creation` | Creating a GitHub issue, reporting a bug, requesting a feature |
| `judgment-day` | Adversarial review of a decision, architecture, or implementation |
| `sdd-apply` | Implementing tasks from a change (launched by orchestrator) |
| `sdd-archive` | Archiving a completed change (launched by orchestrator) |
| `sdd-design` | Writing technical design for a change (launched by orchestrator) |
| `sdd-explore` | Investigating a feature or idea before committing (launched by orchestrator) |
| `sdd-init` | Initializing SDD in a project (`/sdd-init`) |
| `sdd-onboard` | Guided SDD walkthrough (`/sdd-onboard`) |
| `sdd-propose` | Creating a proposal for a change (launched by orchestrator) |
| `sdd-spec` | Writing specs for a change (launched by orchestrator) |
| `sdd-tasks` | Breaking a change into tasks (launched by orchestrator) |
| `sdd-verify` | Verifying implementation against specs (launched by orchestrator) |
| `skill-creator` | Creating a new skill or documenting patterns for AI |
| `skill-registry` | Updating this registry (`/skill-registry`) |

## Project Conventions

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Codebase and workflow guidance for Claude Code |

## Compact Rules

### TypeScript / Astro
- Use path aliases (`@helpers/*`, `@components/*`, etc.) — never relative imports across top-level dirs
- Content collections use `glob` loader; files starting with `_` are ignored
- Bilingual content: `src/content/{collection}/en/` and `/es/` — always create both files
- Self-healing codes required on notes: generate with `bun run generate:selfheal "Title"`
- Date fields (`publishDate`) must be ISO strings in frontmatter — Astro converts to Date objects
- Zod schemas shared via `src/content/schemas/` — import from there, do not duplicate

### Testing
- Unit tests: `tests/unit/` with Vitest + happy-dom
- E2E tests: `tests/e2e/` with Playwright (Chromium, baseURL `http://localhost:4321`)
- Run unit: `vitest run` | Watch: `vitest` | Coverage: `vitest run --coverage`
- Run E2E: `playwright test` (dev server must be running or Playwright starts it)

### Code Quality
- Linter + formatter: Biome (`bun run lint` / `bun run lint:fix`) — do NOT add ESLint or Prettier
- Commits: conventional commits enforced by commitlint + husky
- Package manager: Bun (preferred) or pnpm — never npm or yarn

### i18n
- All UI strings go in `src/global/i18n/ui.ts`
- Route translations in `src/global/i18n/routes.ts`
- EN is default (no prefix), ES uses `/es/` prefix
