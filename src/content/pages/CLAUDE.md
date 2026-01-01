# Pages Collection - Writing Guide

## Purpose

Pages are **static content pages** that provide information about the site, portfolio, or author. Unlike notes (which are blog-style content), pages are evergreen informational content.

## Voice & Tone

**Voice**: Welcoming and informative guide
**Tone**: Friendly yet professional, inviting exploration
**Style**: Clear explanation with personality

### Writing Principles
- Make it welcoming and easy to understand
- Show personality while staying professional
- Guide users on how to use or understand the site
- Keep content evergreen (not time-sensitive)
- Use emoji sparingly and purposefully

## Content Structure

Pages should include:
1. **Title** - Clear page purpose
2. **Introduction** - Why this page exists and what users will find
3. **Main Content** - Organized sections with clear headings
4. **Call to Action** - What users should do next (optional)

## Creating a New Page

### 1. English Version (`src/content/pages/en/{slug}.md`)

```markdown
---
title: "How to Use This Notebook"
description: "Learn how to navigate and get the most value from this developer notebook, including search, collections, and content organization"
pathToTranslate: "how-to-use"
---

# 📖 How to Use This Notebook

> Your guide to navigating and getting the most from this developer resource

Welcome! This notebook is designed to help you find practical solutions and learn from real development experiences. Here's how to make the most of it.

---

## 🔍 Finding What You Need

### Browse by Collection
Content is organized into **collections** (categories) like Design Patterns, Performance, React, etc. Click any collection to see all related notes.

### Search Functionality
Use the search bar to find specific topics, technologies, or keywords. The search covers titles, descriptions, and content.

### Starred Notes
Look for the ⭐ icon on notes I've marked as particularly useful or popular. These are great starting points.

---

## 📚 Content Types

### Notes
Blog-style articles covering specific topics, patterns, or solutions. Each note includes:
- Clear explanations with real code examples
- Practical use cases
- Common gotchas to avoid

### Portfolio
Real projects I've worked on, including challenges faced and solutions implemented. Great for seeing concepts applied in production.

### Team
Information about contributors to this notebook.

---

## 🌍 Language Switching

This notebook is available in English and Spanish. Use the language switcher in the navigation to toggle between languages. All content is available in both languages.

---

## 💡 Tips for Learning

**Start with fundamentals**: If you're new to a topic, look for notes tagged with basics or fundamentals.

**Follow the code examples**: All code snippets are tested and meant to be followed along. Try them in your own projects.

**Bookmark useful notes**: Use your browser bookmarks for notes you reference often.

**Share what helps**: If a note solves your problem, share it with others who might benefit.

---

## 🚀 Stay Updated

New notes are added regularly covering:
- Modern web development practices
- Real-world patterns and solutions
- Tools and workflows that improve developer experience
- Lessons learned from production projects

Check the homepage for recently added content.

---

## 📬 Get in Touch

Have questions or suggestions? Found something that could be improved? I'd love to hear from you.

[Contact me](/contact) or connect on [GitHub](https://github.com/giorgiosaud)

---

Happy learning! 🎉
```

### 2. Spanish Version (`src/content/pages/es/{slug}.md`)

Translate while maintaining the friendly, welcoming tone.

## Field Guidelines

### `title`
- Clear description of page purpose
- Use title case
- Be specific about what the page covers

Examples:
- ✅ `"About This Notebook"`
- ✅ `"How to Contribute"`
- ✅ `"Privacy Policy"`
- ❌ `"Info"` (too vague)
- ❌ `"Page 1"` (not descriptive)

### `description`
- One sentence summary of page content
- Helps with SEO and social sharing
- Keep under 160 characters
- Should give users a reason to read

Examples:
- ✅ `"Learn about the philosophy and purpose behind this developer notebook"`
- ✅ `"Guidelines for contributing content, fixing issues, and improving this notebook"`
- ❌ `"A page about stuff"` (too vague)
- ❌ `"This page contains information"` (obvious, not helpful)

### `pathToTranslate`
- Matches the route name in `src/global/i18n/routes.ts`
- Used for language switching
- Must exist in routes configuration

Example:
```yaml
pathToTranslate: "about-this"
```

This references:
```typescript
// src/global/i18n/routes.ts
'about-this': {
  es: 'sobre-este-cuaderno',
  en: 'about-this-notebook',
}
```

## Common Page Types

### About Pages
Explain the purpose, philosophy, or story behind the site.

```markdown
---
title: "About This Notebook"
description: "The story behind this developer notebook and what you'll find here"
pathToTranslate: "about-this"
---
```

### How-To / Guide Pages
Help users navigate or use the site effectively.

```markdown
---
title: "How to Use This Site"
description: "Tips and tricks for getting the most value from this notebook"
pathToTranslate: "how-to-use"
---
```

### Policy Pages
Legal or privacy information.

```markdown
---
title: "Privacy Policy"
description: "How we handle your data and protect your privacy"
pathToTranslate: "privacy"
---
```

### Contact / Connect Pages
Information on how to get in touch.

```markdown
---
title: "Get in Touch"
description: "Connect with me for questions, collaborations, or feedback"
pathToTranslate: "contact"
---
```

## Writing Style Guidelines

### Use Clear Headings
Break content into scannable sections with descriptive headings.

```markdown
## 🔍 Finding Content
## 💡 Learning Tips
## 📬 Contact Information
```

### Make It Scannable
- Use bullet points for lists
- Keep paragraphs short (3-4 sentences max)
- Use bold for emphasis
- Add visual breaks with horizontal rules

### Add Personality
- Use conversational language
- Include relevant emoji (but not excessively)
- Share the "why" behind decisions
- Be authentic

### Be Helpful
- Anticipate user questions
- Provide clear next steps
- Link to relevant resources
- Make navigation easy

## Content Examples

### Good Opening
```markdown
# 📚 Welcome to the Notebook

> A developer's personal knowledge base, shared with the community

This isn't your typical blog. It's a curated collection of real solutions
to real problems I've encountered while building web applications. Think of
it as the documentation I wish existed when I started learning.
```

### Good Section
```markdown
## 🎯 What You'll Find Here

**Practical Solutions**
Real code examples that solve specific problems. No fluff, just working code.

**Battle-Tested Patterns**
Architectural patterns I've used in production. The good, the bad, and the
lessons learned.

**Tool Recommendations**
Honest reviews of tools and libraries I actually use in my daily workflow.
```

### Good Call to Action
```markdown
## 🚀 Ready to Explore?

Start with the [latest notes](/notebook) or browse by [collection](/collections).
Looking for something specific? Try the search feature.

Have questions? [Get in touch](/contact) - I'd love to hear from you!
```

## Common Pages to Create

Most sites need these standard pages:

1. **About** - Site purpose and philosophy
2. **How to Use** - Navigation and features guide
3. **Contact** - How to get in touch
4. **Acknowledgements** - Credits and thanks (optional)
5. **Privacy** - Privacy policy (if collecting data)
6. **Terms** - Terms of use (if needed)

## Avoid Common Mistakes

❌ **Too formal**: "This repository contains information pertaining to..."
✅ **Conversational**: "Here's what you'll find in this notebook..."

❌ **Too casual**: "Hey dude, like, check out my sick notes lol"
✅ **Professional but friendly**: "Welcome! I'm excited to share what I've learned..."

❌ **Too long**: 3000-word manifesto on your development philosophy
✅ **Concise**: Clear, scannable content that respects user time

❌ **No personality**: Generic corporate speak
✅ **Authentic**: Your voice, your story, your perspective

## Publishing Checklist

Before publishing a page:
- [ ] Title clearly describes page purpose
- [ ] Description is SEO-friendly and under 160 chars
- [ ] Content is organized with clear headings
- [ ] pathToTranslate exists in routes.ts
- [ ] Spanish translation is complete
- [ ] Links are working and point to correct locations
- [ ] Content is evergreen (won't need constant updates)
- [ ] Tone is welcoming and helpful
- [ ] Content is scannable with good formatting
