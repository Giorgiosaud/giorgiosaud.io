# Portfolio Collection - Writing Guide

## Voice & Tone

**Voice**: Professional project storyteller highlighting solutions and outcomes
**Tone**: Confident but not boastful, focused on value delivered
**Style**: Clear project narratives with emphasis on challenges solved

### Writing Principles
- Lead with business value, not just tech stack
- Highlight the "why" behind technical decisions
- Show problem-solving skills through challenges
- Be specific about your role and contributions
- Focus on outcomes and measurable impact

## Content Structure

Portfolio entries should follow this narrative:
1. **Project Overview** - What was built and for whom
2. **Your Role** - Specific responsibilities and contributions
3. **Challenges & Solutions** - Problems faced and how you solved them
4. **Key Features** - What makes this project notable
5. **Outcome** - Impact, results, lessons learned

## Creating a New Portfolio Entry

### 1. English Version (`src/content/portfolio/en/{slug}.md`)

```markdown
---
draft: false
workingOn: "Company Name"
selfHealing: "900004"  # 6 chars, no vowels/dashes (use 9xxxxx pattern for portfolio)
country: "Chile"
client: "Client Name"
category: "E-commerce Platform"  # Type of project
project: "Modern Checkout Experience"
resume: "Redesigned checkout flow reducing cart abandonment by 35% through improved UX and performance optimization."
image: { src: "project-screenshot", alt: "Project preview showing checkout interface" }
publishDate: "2024-08-15"
classes: "bg-clip-text text-transparent bg-gradient-to-b from-purple-300 to-purple-600"
classesClient: "bg-clip-text bg-gradient-to-b text-transparent from-purple-600 to-purple-950"
technologies: ["react", "typescript", "stripe", "tailwind css", "next.js"]
---

# Project Overview: Modern Checkout Experience

**Objective:**
Transform the existing checkout process to reduce friction, improve conversion rates, and create a mobile-first experience that works seamlessly across all devices.

**Role:**
As **Lead Front-End Developer**, I architected and implemented the new checkout flow, collaborated with UX designers on user research, and worked directly with the backend team to optimize API performance.

**Challenges & Solutions:**

1. **High Cart Abandonment (47%)**
   - *Challenge*: Users were dropping off at multiple points in the checkout flow
   - *Solution*: Implemented progressive disclosure, reduced form fields from 23 to 12, added inline validation with clear error messages
   - *Result*: Cart abandonment dropped to 31%

2. **Mobile Performance Issues**
   - *Challenge*: Checkout took 8+ seconds to load on 3G connections
   - *Solution*: Implemented code splitting, lazy-loaded payment forms, optimized images with next/image, reduced bundle size by 40%
   - *Result*: Load time reduced to 2.3 seconds on 3G

3. **Complex State Management**
   - *Challenge*: Checkout flow had 15+ states to manage (shipping, payment, validation, etc.)
   - *Solution*: Built a finite state machine using XState, making the flow predictable and easier to test
   - *Result*: Bug reports decreased by 60%, tests became more maintainable

**Key Features:**

- **One-Click Checkout**: Saved customer information for returning users
- **Real-time Validation**: Instant feedback on form fields
- **Multiple Payment Methods**: Credit card, PayPal, Apple Pay integration
- **Shipping Calculator**: Real-time shipping cost estimation
- **Mobile-First Design**: Optimized for touch interactions

**Technical Highlights:**

- Built with **React 18** and **TypeScript** for type safety
- Used **Next.js 13** App Router for optimal performance
- Integrated **Stripe Elements** for secure payment processing
- Implemented **Tailwind CSS** for rapid UI development
- Created custom hooks for form validation and state management

**Outcome:**

The redesigned checkout experience launched in August 2024 and has processed over $2M in transactions in the first quarter. Customer satisfaction scores for the checkout process increased from 3.2/5 to 4.6/5. The project was delivered 2 weeks ahead of schedule with zero critical bugs in production.

**Key Learnings:**

- Progressive enhancement is crucial for conversion
- Performance optimization is a feature, not an afterthought
- Close collaboration with UX research prevents costly redesigns
- State machines make complex flows manageable and testable
```

### 2. Spanish Version (`src/content/portfolio/es/{slug}.md`)

Translate while maintaining professional tone and project narrative structure.

## Self-Healing Pattern for Portfolio

Portfolio entries use the `9xxxxx` pattern:
- Start with `9` to distinguish from notes
- Follow with 5 characters (no vowels/dashes)
- Example: `900001`, `900002`, `9abcdf`

## Category Guidelines

Choose categories that describe the project type:
- `E-commerce Platform` - Online stores, shopping experiences
- `SaaS Application` - Software as a service products
- `Corporate Website` - Company websites, landing pages
- `Mobile Application` - Native or hybrid mobile apps
- `Dashboard / Analytics` - Data visualization, admin panels
- `API / Backend Service` - Backend-focused projects
- `Design System` - Component libraries, style guides
- `Private Site` - Internal tools, portals

## Technologies Field

List technologies in order of importance:
```yaml
technologies: ["react", "typescript", "next.js", "tailwind css", "stripe"]
```

Use lowercase, be specific:
- ✅ `"next.js"`, `"vue 3"`, `"node.js"`
- ❌ `"NextJS"`, `"Vue"`, `"Node"`

## Writing Tips

### Good Project Descriptions
✅ Focus on outcomes: "Reduced load time by 60%"
✅ Quantify impact: "Processed $2M in transactions"
✅ Show problem-solving: "Solved X by implementing Y"
✅ Highlight collaboration: "Worked with UX team to..."

### Avoid
❌ Vague claims: "Built a really good website"
❌ Just listing features: "It has authentication and forms"
❌ Tech stack bragging: "Used 47 different technologies"
❌ No context: "Made it faster" (faster than what? by how much?)

## Image Guidelines

- Use descriptive filenames: `checkout-mobile-view.webp`
- Keep images under 500KB
- Provide meaningful alt text
- Show the actual product, not stock photos

## Gradient Classes

Use gradient classes for visual variety:

**Purple** (default):
```yaml
classes: "bg-clip-text text-transparent bg-gradient-to-b from-purple-300 to-purple-600"
classesClient: "bg-clip-text bg-gradient-to-b text-transparent from-purple-600 to-purple-950"
```

**Blue**:
```yaml
classes: "bg-clip-text text-transparent bg-gradient-to-b from-blue-300 to-blue-600"
classesClient: "bg-clip-text bg-gradient-to-b text-transparent from-blue-600 to-blue-950"
```

**Indigo**:
```yaml
classes: "bg-clip-text text-transparent bg-gradient-to-b from-indigo-300 to-indigo-600"
classesClient: "bg-clip-text bg-gradient-to-b text-transparent from-indigo-600 to-indigo-950"
```

## Publishing Checklist

Before setting `draft: false`:
- [ ] Quantifiable outcomes included
- [ ] Challenges show problem-solving skills
- [ ] Technologies list is accurate and relevant
- [ ] Images showcase the actual project
- [ ] Client/company names are approved for public sharing
- [ ] Spanish translation is complete
- [ ] Self-healing code follows 9xxxxx pattern
- [ ] Resume field is concise (under 200 chars)
