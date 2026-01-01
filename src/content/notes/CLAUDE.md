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

## Creating a New Note

### 1. English Version (`src/content/notes/en/{slug}.md`)

```markdown
---
draft: false
selfHealing: "ptrnsn"  # 6 chars, no vowels/dashes (use consonants from title)
starred: false  # Set true for featured notes
title: "Understanding the Observer Pattern in JavaScript"
description: "Learn the Observer pattern with practical examples for building reactive applications and event-driven architectures."
image:
  src: "observer-pattern-diagram"
  alt: "Observer pattern visualization"
publishDate: 2025-01-15T10:00:00.000Z
category: "development"  # development, patterns, architecture, performance, etc.
author: 000001-jorge-saud
collections:
  - patterns
  - architecture
tags:
  - design-patterns
  - javascript
  - architecture
cover: ../../../assets/images/observer-pattern.webp
coverAlt: "Understanding the Observer Pattern"
fmContentType: Notes
---

In this post, I'll explain the Observer pattern in a way that makes sense for real-world JavaScript development. This pattern is everywhere - from event listeners to reactive frameworks - so understanding it will level up your architectural thinking.

## What Problem Does It Solve?

Imagine you're building a dashboard that needs to update multiple widgets when data changes. Without the Observer pattern, you'd have tightly coupled code where the data source has to know about every single widget. That's a maintenance nightmare.

## The Pattern, Simplified

The Observer pattern lets objects "subscribe" to events from another object. When something happens, all subscribers get notified automatically.

\`\`\`javascript
class DataStore {
  constructor() {
    this.observers = []
    this.data = {}
  }

  subscribe(observer) {
    this.observers.push(observer)
  }

  notify(data) {
    this.observers.forEach(observer => observer.update(data))
  }

  updateData(newData) {
    this.data = { ...this.data, ...newData }
    this.notify(this.data)
  }
}

// Usage
const store = new DataStore()

const widget1 = {
  update: (data) => console.log('Widget 1 received:', data)
}

const widget2 = {
  update: (data) => console.log('Widget 2 received:', data)
}

store.subscribe(widget1)
store.subscribe(widget2)

store.updateData({ temperature: 23 })
// Both widgets receive the update automatically
\`\`\`

## Real-World Use Cases

1. **Event systems** - DOM events, custom application events
2. **State management** - Redux, MobX, Vue reactivity
3. **Real-time updates** - Chat apps, live dashboards
4. **Form validation** - Multiple validators responding to input changes

## Watch Out For

- **Memory leaks**: Always unsubscribe when you're done
- **Update storms**: Too many observers can hurt performance
- **Debugging complexity**: Hard to trace where updates come from

The Observer pattern is powerful but use it wisely. For simple cases, direct function calls might be clearer.
```

### 2. Spanish Version (`src/content/notes/es/{slug}.md`)

Translate the content while maintaining the same voice and structure. Keep technical terms in English when appropriate (e.g., "Observer pattern").

## Self-Healing Field Guide

Generate the `selfHealing` field by extracting consonants from the title:
- "Observer Pattern" → "bsrvr" or "ptrnsn"
- "React Hooks" → "rcthks"
- Must be exactly 6 characters
- No vowels (aeiouAEIOU) or dashes
- Use regex: `/^[^aeiouAEIOU-]{6}$/`

## Category Guidelines

Common categories:
- `development` - General coding practices
- `patterns` - Design patterns, architectural patterns
- `architecture` - System design, project structure
- `performance` - Optimization, profiling
- `testing` - Testing strategies, tools
- `devops` - Deployment, CI/CD
- `frontend` - UI/UX, frameworks
- `backend` - APIs, databases

## Collections Guidelines

Link to relevant collection tags:
- `patterns` - Design patterns
- `architecture` - Architectural concepts
- `javascript` - JS-specific content
- `typescript` - TS-specific content
- `react`, `vue`, `astro` - Framework-specific
- `performance` - Performance topics
- `security` - Security topics

## Examples of Good Note Titles

✅ "Understanding the Observer Pattern in JavaScript"
✅ "Simplified Explanation of React Hooks"
✅ "Why Your API is Slow (and How to Fix It)"
✅ "Preflight Requests and CORS Explained"

❌ "Design Patterns" (too broad)
❌ "My Thoughts on Code" (not specific)
❌ "Tutorial #5" (not descriptive)

## Publishing Checklist

Before setting `draft: false`:
- [ ] Title is clear and specific
- [ ] `selfHealing` matches regex pattern
- [ ] Code examples are tested and working
- [ ] Spanish translation is complete (if applicable)
- [ ] Author reference exists in team collection
- [ ] Collections references exist
- [ ] Cover image is added and optimized
- [ ] Content adds genuine value (not just rehashing docs)
