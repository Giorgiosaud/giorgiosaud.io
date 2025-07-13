---
draft: false
selfHealing: "FLBTNB"
title: "From Legacy Bloat to Native Brilliance: My Website Migration Journey"
resume: "Facing a slow, legacy codebase? See my journey of migrating to modern CSS & HTML, improving web performance, accessibility, and developer experience."
image: { src: "from-legacy-bloat-to-native-brilliance-our-website-migration-journey_fuemvo", alt: "From legacy to Native Brilliance" }
publishDate: "2025-07-13"
category: "frontend"
author: 000001-jorge-saud
collections: [frontend,patterns]
tags: [ evolution, frontend]
---

Over the past year, I embarked on a mission that many developers know but often dread: refactoring my web application. The project, this notebook and portal in the developers knowledge sector, was weighed down by months of accumulated technical debt, heavy frameworks, and a lot of refactors that led me to make the final one. My goal was clear: migrate to modern, native CSS and HTML features to build a faster, more maintainable, and highly accessible platform for the future.

This is the story of my journey – the tools I adopted, the challenges I faced, and the rewarding results.

Here I will resume the experience and in next days i will post more specific learings of this trip 

##  Why I Had to Abandon the Old Ways

Legacy codebases have a way of creeping up on me. What starts as a simple jQuery plugin here and a CSS framework there eventually becomes a complex web of dependencies. 

In my case, I didn’t reach a critical point due to performance or maintenance issues. Rather, what motivated me was curiosity and the desire to experiment with the new native features of the web—I wanted to see firsthand how the latest CSS and HTML capabilities could improve my development process and the user experience.

## My New Toolkit: Embracing Native Features

The modern web platform offers powerful alternatives to the tools I once relied on. Here are the key features that transformed my codebase.

### 1. CSS Container Queries: The Dream of True Modularity

Container queries were the single biggest game-changer for my UI. Previously, my responsive design was entirely dependent on the viewport. A component might look great on a "mobile" screen, but break when placed in a narrow sidebar on a "desktop" screen.

With container queries, components adapt to their *parent's* size. My dashboard widgets are now truly self-contained. The same widget component can render a compact view in a 300px sidebar and a detailed, expanded view in a 900px main content area, all without a single line of JavaScript.

```css
.widget-container {
  container-type: inline-size;
  container-name: widget;
}

.widget-header {
  /* Default styles */
}

/* If the container is wider than 400px, change the layout */
@container widget (min-width: 400px) {
  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
```


### 2. The :has() Selector: A CSS Superpower


Dubbed the "parent selector," ```:has()``` allowed me to eliminate complex class toggling scripts. I can now style an element based on its children or state, leading to cleaner, more declarative CSS.

A perfect use case was my form validation. I can now style a form field's entire container to indicate an error, simply by checking if it contains an input with an ```:invalid``` state.

```css
/* Highlight the entire form field if the input inside is invalid */
.form-field:has(input:invalid) {
  border-color: red;
  background-color: #fff8f8;
}

/* Add a "featured" banner to a card only if it contains the badge */
.card:has(.badge--featured) {
  border-left: 4px solid gold;
}
```
### 3. Native ```<dialog>``` & ```<popover>```: Accessibility Out-of-the-Box

My custom modals were a constant source of accessibility bugs. Focus trapping, keyboard navigation (Esc to close), and proper ARIA roles were brittle and hard to maintain.

Replacing them with the native ```<dialog>``` and the new popover attribute was a revelation. I deleted hundreds of lines of JavaScript. The browser now handles all the complex accessibility interactions for me, ensuring my modals and pop-ups are robust and compliant by default.

### 4. Form Improvements: A Better User Experience

I overhauled my forms using modern HTML attributes. This reduced my reliance on custom scripts and made my forms more user-friendly and secure.

```inputmode```: Displaying the correct keyboard on mobile devices (e.g., numeric for a PIN field) significantly reduced user friction.

```autocomplete```: Using standardized autocomplete values helped users fill out forms faster with their browser's stored information.

*Built-in Validation*: I leveraged native HTML5 validation attributes like required, pattern, and minlength for instant feedback, simplifying my validation logic immensely.

## My Migration Process

A full rewrite was not an option. I followed a gradual and strategic process:

*Audit*: I identified key areas where heavy, legacy solutions could be swapped with a lightweight, native feature. I prioritized high-traffic components and accessibility hotspots.

*Refactor*: I incrementally replaced polyfills and old components. For critical features, I often used a progressive enhancement approach, ensuring a baseline experience was available while providing the enhanced version to users on modern browsers.

*Test*: I used browser compatibility tables extensively and conducted real-device testing to validate my new implementations across my supported browsers, paying close attention to any required fallbacks.

*Educate*: This was a cultural shift. I documented the new standards, held internal workshops, and encouraged myself (and my collaborators) to think "native-first" when solving problems.

## Challenges I Faced

The path was not without its obstacles:

*Browser Support*: While excellent for most new features, I still support some older browser versions. This required me to write fallback strategies using tools like @supports to ensure a consistent, functional experience for all users.

*Adoption*: It took time for me to unlearn old habits and trust the native platform over familiar frameworks. Paired programming and celebrating small wins were key to building momentum.

*Integration*: My existing design system and CI/CD pipelines needed to be updated to accommodate and test these new native features properly.

## The Results: A Resounding Success

The effort paid off in dividends across the board:

*Performance*: I saw notable improvements in my Core Web Vitals, with faster load times and a much smoother runtime experience.

*Accessibility*: I achieved better WCAG compliance with less effort, as the browser now handles many of the complex interactions for me.

*Developer Experience*: The codebase is cleaner, smaller, and easier to understand. This has dramatically sped up my development cycles and made onboarding new team members a breeze.

## Final Thoughts

Migrating to modern CSS and HTML has been one of the most impactful initiatives I’ve undertaken. The web platform is more powerful and capable than ever before. By embracing these changes, I’ve not only delivered a better product to my users but have also empowered myself (and my collaborators) to build more efficiently.

If you’re stuck on a legacy codebase, I encourage you to start exploring. Begin with a small, low-risk component. The journey is well worth the effort.

> Have you migrated to new CSS or HTML features? Share your experiences