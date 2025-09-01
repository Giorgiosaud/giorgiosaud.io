# Pull Request Template

<!-- Keep PRs focused and scoped. Aim for < ~300 lines changed when possible. -->

## Summary

<!-- What does this PR do and why? Provide a high-level, skimmable summary. -->

- 

## Related Issues

<!-- Link issues with keywords like Closes/Fixes/Relates. Example: Closes #123 -->
- Closes #
- Relates to #

## Type of Change

- [ ] Bug fix
- [ ] Feature
- [ ] Documentation
- [ ] Refactor / Code quality
- [ ] Performance
- [ ] Build / CI
- [ ] Style (formatting, no logic change)
- [ ] Chore
- [ ] Other:

## Screenshots / Demos

<!-- Required for UI changes. Add before/after screenshots, screen recordings, or a preview link. -->
- Preview URL: 
- Before:
- After:

## How to Test

<!-- Step-by-step instructions for reviewers to validate the change locally. Include any env vars/data needed. -->
1. 
2. 
3. 

## Checklist

Project hygiene
- [ ] PR title is clear and descriptive (consider Conventional Commits style)
- [ ] Linked issues are referenced (Closes #...)
- [ ] Small, focused changes; non-essential diffs avoided

Code quality
- [ ] Code compiles locally (build succeeds)
- [ ] Lint & format pass (Biome)
- [ ] Unit/Component tests added/updated where relevant
- [ ] All tests pass locally
- [ ] No new console errors/warnings in the browser or build output

Astro/Content specifics
- [ ] Content/frontmatter validated (no broken imports/links)
- [ ] i18n strings updated where applicable
- [ ] Accessibility reviewed for new/changed UI (labels, contrast, keyboard)
- [ ] SEO/meta updated as needed (titles, descriptions, OG images)

Risk & rollout
- [ ] No secrets or sensitive data committed
- [ ] Breaking changes documented below with migration notes
- [ ] Rollback plan considered (what would we revert?)

## Breaking Changes (if any)

<!-- Describe what breaks and how to migrate. -->
- 

## Notes for Reviewers

<!-- Call out tricky parts, trade-offs, or areas that need extra attention. -->
- 

---

### Local quick checks (optional)

These commands may help reviewers validate quickly:

- Format & lint (Biome): bun run format && bun run lint
- Build: bun run build
- Test: bun run test

<!-- If your package manager differs (pnpm/npm/yarn), please adjust the commands accordingly. -->
