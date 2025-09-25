---
title: Introducing the New Summary API in Browsers
description: Learn about the new Summary API, which enables browsers to generate AI-powered summaries of web content.
publishDate: 2025-09-25
cover: ../../../assets/images/summary_api.png
coverAlt: Summary API illustration
selfHealing: SMMPPN
draft: false
lang: en
category: Development
author: giorgio-saud
collections:
  - ai
tags:
  - frontend
  - evolution
slug: introducing-summary-api-browsers
---

## What is the Summary API?

The new Summary API is a browser feature that allows developers and users to generate AI-powered summaries of web content directly in the browser. This API leverages advanced language models to provide concise, relevant, and readable summaries for articles, documentation, and more.

### Key Features
- **Streaming Summaries:** Summaries are generated in real-time, chunk by chunk, for a smooth user experience.
- **Customizable Context:** Developers can provide context or hints to guide the summary generation.
- **Markdown Support:** Output can be formatted in markdown for easy integration.

### Example Usage
```js
const summarizer = await Summarizer.create({
    sharedContext: 'Este es un artículo para desarrolladores FrontEnd, el tono es menos formal pero técnico',
    type: 'teaser',
    format: 'markdown',
    length: "medium",
    expectedInputLanguages: ["es-ES"],
    outputLanguage: 'es-ES',
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(`Downloaded ${e.loaded * 100}%`);
      });
    }
});
const summary = await summarizer.summarizeStreaming(document.body.innerText);
for await (const chunk of summary.values()) {
  console.log(chunk);
}
```


### Use Cases
- **Quick reading:** Instantly get the main points of long articles or blog posts without reading everything.
- **Accessibility:** Users with reading difficulties or limited time can benefit from concise summaries.
- **Technical documentation:** Developers can add automatic summaries to docs, making it easier to find relevant sections.
- **Education:** Students can use summaries to focus on key ideas in study materials.
- **Dashboards and search:** Show automatic summaries in search results or dashboards for faster information scanning.

### Limitations and Support
Currently, support for the Summary API is limited and only available in some experimental browsers or specific versions. Not all users will have access, so always check browser compatibility before using it in production.

### Why is this important?
The Summary API helps everyone save time and understand content faster. It improves accessibility, boosts productivity, and makes web browsing more efficient by providing instant overviews of any page.

---


## What is the Summary API? (Spanish section translated)

The new Summary API is a browser feature that allows developers and users to generate intelligent summaries of web content directly in the browser. It uses advanced language models to create concise and relevant summaries of articles, documentation, and more.

### Main Features
- **Real-time summaries:** Summaries are generated continuously, chunk by chunk, for a smooth experience.
- **Customizable context:** Developers can provide context to guide the summary generation.
- **Markdown support:** The result can be in markdown format for easy integration.

### Example Usage
```js
const summarizer = await Summarizer.create({
  sharedContext: 'This is an article for FrontEnd developers',
  type: 'teaser',
  format: 'markdown',
  length: 'long',
});
const summary = await summarizer.summarizeStreaming(document.body.innerText);
for await (const chunk of summary.values()) {
  console.log(chunk);
}
```

### Why is it important?
The Summary API makes it easier to understand long articles, improves accessibility, and increases productivity by providing quick summaries of content.

> **Tip:** You can try the Summary API right now if your browser supports it—just click the floating button in the bottom right corner of this page!