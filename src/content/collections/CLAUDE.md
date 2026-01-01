# Collections Collection - Writing Guide

## Purpose

Collections are **category tags** used to organize notes and other content. They act as thematic groupings that help users discover related content.

## Voice & Tone

**Voice**: Clear categorization helper
**Tone**: Concise and descriptive
**Style**: Minimal metadata with meaningful names

### Writing Principles
- Keep it simple - just metadata, no content body
- Use descriptive names that clearly indicate the topic
- Choose icons that visually represent the category
- Be consistent with naming conventions

## Content Structure

Collections are minimal frontmatter-only files:
1. **Title** - The display name of the collection
2. **Icon** - Emoji representing the category
3. **Description** - Brief explanation of what belongs in this collection

## Creating a New Collection

### 1. English Version (`src/content/collections/en/{slug}.md`)

```markdown
---
title: "Design Patterns"
description: "Software design patterns and architectural solutions"
icon: "🏗️"
---
```

### 2. Spanish Version (`src/content/collections/es/{slug}.md`)

```markdown
---
title: "Patrones de Diseño"
description: "Patrones de diseño de software y soluciones arquitectónicas"
icon: "🏗️"
---
```

**Important:** The icon should be the same in both languages.

## Field Guidelines

### `title`
- Clear, descriptive category name
- Use title case
- Keep to 2-3 words when possible
- Should be obvious what content fits here

Examples:
- ✅ `"Design Patterns"`
- ✅ `"Web Performance"`
- ✅ `"React Ecosystem"`
- ❌ `"Stuff"` (too vague)
- ❌ `"My Favorite Development Topics"` (too long)

### `description`
- One sentence explaining what goes in this collection
- Focus on the type of content included
- Keep under 100 characters
- Be specific enough to guide content creators

Examples:
- ✅ `"Software design patterns and architectural solutions"`
- ✅ `"Performance optimization techniques and best practices"`
- ✅ `"React libraries, patterns, and ecosystem tools"`
- ❌ `"Patterns"` (too brief, not helpful)
- ❌ `"Everything related to design patterns in software development using various languages"` (too long)

### `icon`
- Use a single emoji that visually represents the topic
- Choose recognizable, universally understood emojis
- Avoid country flags or culturally specific symbols
- Keep consistent with the topic

## Icon Selection Guide

Choose emojis that clearly represent the category:

**Development Topics:**
- 🏗️ Architecture, Patterns
- ⚡ Performance
- 🔒 Security
- 🎨 Design, UI/UX
- 🧪 Testing
- 🚀 Deployment, DevOps

**Technologies:**
- ⚛️ React
- 💚 Vue
- 🅰️ Angular
- 📘 TypeScript
- 🟨 JavaScript
- 🐍 Python
- 🦀 Rust

**Concepts:**
- 📚 Learning, Education
- 🧠 Algorithms
- 💾 Databases
- 🌐 Web APIs
- 📱 Mobile Development
- ☁️ Cloud Computing
- 🤖 AI/ML

**General:**
- 💡 Tips & Tricks
- 📝 Best Practices
- 🔧 Tools
- 📊 Data & Analytics

## Common Collection Examples

### Technology-Specific
```markdown
---
title: "React Ecosystem"
description: "React libraries, hooks, patterns, and ecosystem tools"
icon: "⚛️"
---
```

### Topic-Based
```markdown
---
title: "Web Accessibility"
description: "Building inclusive, accessible web applications"
icon: "♿"
---
```

### Skill-Based
```markdown
---
title: "Performance Optimization"
description: "Techniques for faster, more efficient applications"
icon: "⚡"
---
```

### Concept-Based
```markdown
---
title: "State Management"
description: "Patterns and libraries for managing application state"
icon: "🗄️"
---
```

## Naming Conventions

**Use singular or plural consistently:**
- ✅ `"Design Patterns"` (plural - multiple patterns discussed)
- ✅ `"TypeScript"` (singular - the technology itself)
- ⚠️ Be consistent within your site

**Be specific but not too narrow:**
- ✅ `"React Hooks"` (specific enough to be useful)
- ❌ `"useState Hook"` (too narrow - would need one collection per hook)
- ❌ `"Frontend"` (too broad - everything is frontend)

**Avoid redundancy:**
- ✅ `"Security"`
- ❌ `"Security Topics"`
- ❌ `"Security Collection"`

## When to Create a New Collection

**Create a collection when:**
- ✅ You have 3+ pieces of content on a topic
- ✅ The topic is distinct from existing collections
- ✅ Users would benefit from grouping this content
- ✅ The topic will have ongoing content

**Don't create a collection when:**
- ❌ You only have 1-2 pieces of content
- ❌ It overlaps heavily with existing collections
- ❌ It's too specific (e.g., one tool or library)
- ❌ You're unlikely to add more content to it

## Referencing Collections

Collections are referenced in note frontmatter:

```yaml
collections:
  - collections/design-patterns
  - collections/architecture
```

The slug must match the filename (without `.md` extension).

## Organization Tips

**Group related concepts:**
- Instead of: `"React Hooks"`, `"React Context"`, `"React Performance"`
- Consider: `"React Ecosystem"` (covers all)

**Balance specificity:**
- Too broad: `"JavaScript"` (almost all content fits)
- Too narrow: `"Array.map()"` (too specific)
- Just right: `"JavaScript Arrays"` (focused but flexible)

**Think about discovery:**
- Users browse collections to find related content
- Name and describe collections to help users discover content
- Icon should give immediate visual context

## Publishing Checklist

Before creating a collection:
- [ ] Title is clear and descriptive
- [ ] Description explains what content belongs here
- [ ] Icon appropriately represents the topic
- [ ] No existing collection covers this topic
- [ ] Spanish translation is complete
- [ ] You have or plan to have 3+ pieces of content for this collection
- [ ] Slug (filename) is lowercase-with-dashes
