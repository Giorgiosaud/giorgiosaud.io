# Badges Collection - Writing Guide

## Voice & Tone

**Voice**: Proud but not boastful showcase of achievements
**Tone**: Professional recognition of milestones and certifications
**Style**: Clear, factual descriptions of earned credentials

### Writing Principles
- Celebrate legitimate achievements
- Provide context for why the badge matters
- Keep descriptions concise and informative
- Link to verification when possible
- Be accurate about what the badge represents

## Content Structure

Badge entries are simple metadata files:
1. **Title** - Name of the badge/certification
2. **Description** - What this badge represents (1-2 sentences)
3. **Visual** - Badge image source
4. **Context** - Category, issuing organization, date earned

## Creating a New Badge

### 1. English Version (`src/content/badges/en/{slug}.md`)

```markdown
---
slug: "React Advanced Certification"
imgSrc: "https://certificates.dev/badges/react-advanced.svg"
title: "React Advanced Certification"
description: "Advanced React patterns including hooks, context, performance optimization, and state management"
cardColor: "#61DAFB"  # Use brand color of the certification provider
category: "React"
link: "https://certificates.dev/verify/abc123"
date: 2024-09-15
poweredBy: "React Training"
---
```

### 2. Spanish Version (`src/content/badges/es/{slug}.md`)

```markdown
---
slug: "React Advanced Certification"
imgSrc: "https://certificates.dev/badges/react-advanced.svg"
title: "Certificación Avanzada en React"
description: "Patrones avanzados de React incluyendo hooks, context, optimización de rendimiento y gestión de estado"
cardColor: "#61DAFB"
category: "React"
link: "https://certificates.dev/verify/abc123"
date: 2024-09-15
poweredBy: "React Training"
---
```

## Field Guidelines

### `slug`
- Use the official badge name
- Keep consistent with title
- Use title case with spaces

### `imgSrc`
- Direct URL to the badge SVG or PNG
- Prefer SVG for scalability
- Ensure HTTPS
- Verify image is publicly accessible

### `title`
- Official name of the certification/badge
- Keep as issued by the provider
- Use title case

### `description`
- 1-2 sentences explaining what this represents
- Focus on skills or knowledge validated
- Be specific about what was learned/demonstrated
- Keep under 200 characters

### `cardColor`
- Hex color code representing the brand/category
- Use the official brand color when available
- Examples:
  - React: `#61DAFB`
  - Vue: `#42b883`
  - Google: `#4285f4`
  - AWS: `#FF9900`
  - Azure: `#0078D4`

### `category`
- Technology or skill area
- Examples: `"React"`, `"Web Performance"`, `"Cloud"`, `"Security"`, `"Accessibility"`
- Use official category if provided by issuer

### `link`
- Verification URL where the badge can be validated
- Link to public profile if no direct verification
- Must be publicly accessible
- Use HTTPS

### `date`
- Date earned in YYYY-MM-DD format
- Use the issue date, not expiration date
- Be accurate

### `poweredBy`
- Name of the issuing organization
- Use official name: `"Google Developers"`, `"Microsoft Learn"`, `"Meta"`
- Keep consistent with provider branding

## Common Badge Types

### Platform Certifications
```yaml
category: "Cloud"
poweredBy: "AWS"
# or
category: "Frontend"
poweredBy: "Meta"
```

### Learning Platforms
```yaml
category: "JavaScript"
poweredBy: "Frontend Masters"
# or
category: "Full Stack"
poweredBy: "freeCodeCamp"
```

### Professional Certifications
```yaml
category: "Accessibility"
poweredBy: "IAAP"
# or
category: "Security"
poweredBy: "CompTIA"
```

### Achievement Badges
```yaml
category: "Open Source"
poweredBy: "GitHub"
# or
category: "Web Performance"
poweredBy: "Google Developers"
```

## Description Examples

**Good Descriptions:**
✅ "Master modern web performance metrics and optimization techniques to build faster websites"
✅ "Deep dive into TypeScript's advanced types, generics, and compiler configuration"
✅ "Comprehensive coverage of WCAG 2.1 guidelines and accessible web development practices"
✅ "Build and deploy serverless applications using AWS Lambda, API Gateway, and DynamoDB"

**Avoid:**
❌ "Completed a course" (too vague)
❌ "Learned stuff about React" (unprofessional)
❌ "I am now certified in..." (wrong voice - use third person)
❌ "The best certification ever" (subjective, unprofessional)

## Image Guidelines

- **Size**: Badges should be square or roughly square (SVG handles this best)
- **Format**: Prefer SVG over PNG for scalability
- **Hosting**: Use official badge image from issuing organization
- **Accessibility**: Ensure meaningful alt text (handled by title field)

## Color Palette Reference

Common technology colors for `cardColor`:

| Technology | Hex Color | Usage |
|------------|-----------|-------|
| React | `#61DAFB` | React certifications |
| Vue.js | `#42b883` | Vue certifications |
| Angular | `#DD0031` | Angular certifications |
| Node.js | `#339933` | Node.js certifications |
| TypeScript | `#3178C6` | TypeScript certifications |
| JavaScript | `#F7DF1E` | JavaScript certifications |
| Python | `#3776AB` | Python certifications |
| AWS | `#FF9900` | AWS certifications |
| Azure | `#0078D4` | Azure certifications |
| Google Cloud | `#4285F4` | GCP certifications |
| Docker | `#2496ED` | Docker certifications |
| Kubernetes | `#326CE5` | Kubernetes certifications |

## Verification Best Practices

- Always link to official verification if available
- If no direct verification, link to:
  - Your profile on the issuing platform
  - The course/certification page
  - Your LinkedIn certifications section
- Ensure links work and are publicly accessible
- Update links if verification URLs change

## Publishing Checklist

Before adding a badge:
- [ ] Badge is legitimate and earned
- [ ] Image URL is working and publicly accessible
- [ ] Verification link is correct and public
- [ ] Description accurately represents the achievement
- [ ] Date is accurate
- [ ] Spanish translation matches English version
- [ ] Card color represents the brand/category
- [ ] poweredBy field uses official organization name
