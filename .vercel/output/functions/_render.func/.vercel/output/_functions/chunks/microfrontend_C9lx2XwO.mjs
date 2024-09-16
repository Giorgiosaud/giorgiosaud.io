import { a as createComponent, r as renderTemplate, m as maybeRenderHead, u as unescapeHTML } from './astro/server_ICIjUNoW.mjs';

const html = "<p>In a <a href=\"https://blog.modyo.com/posts/micro-frontends-empower-your-developers-to-build-better-digital-products\">previous article at modyo blog</a>, we talked about how micro frontends offer more freedom for teams and deliver more efficient applications. Because of this, they are becoming popular among architects and developers because large organizations and industry leaders are successfully managing their own web applications using micro frontend architectures.</p>\n<p>We can begin by first explaining how to determine if something is a trend that won’t last long, a new way of making things that people are beginning to adopt, or a widely accepted architecture. Let’s start by defining the word, architecture:</p>\n<blockquote>\n<p><em>Both the process and the product of planning, designing, and constructing buildings or other structures. Architectural works, in the material form of buildings, are often perceived as cultural symbols and as works of art. Historical civilizations are often identified with their surviving architectural achievements.</em></p>\n</blockquote>\n<p>Like the definition says, architecture is representative of an era or period of time; this is also true of software architecture. Everything related to architecture, whether physical or software, is something that must evolve and represent a way of doing things long term.</p>\n<h2 id=\"micro-frontend-architecture\">Micro frontend architecture</h2>\n<hr>\n<p>Frontend architecture is a new concept, but it’s becoming more and more popular every day due to the evolution of the web and the need for people to interact more with computers, websites, native applications, and <a href=\"https://www.youtube.com/watch?v=zB9xQH_Rhnk&#x26;t=4s\">progressive web applications</a>. How we use and choose technology like frontend architecture is more important now than ever given the changes brought on by the COVID-19 pandemic. Not only do we use technology to make our lives easier and more convenient, but also to make us safer. It helps us stay safe at home, pay for services online, and keeps the general economical ball rolling.</p>\n<p>Although we’ve made many changes to adjust to the demands of the pandemic, these changes aren’t temporary. They’re here to stay, <strong>which now drives the market need to adopt a new architecture</strong>–an architecture that interacts directly with people, one that humanizes our interactions with people and doesn’t just deal with APIs. This situation makes us evolve how we deliver new services and take advantage of faster time to market (TTM). We need to take the decisions that we make in the front end with careful consideration and more accountability. This is where the <strong>Front End Architecture</strong> emerges from the shadows.</p>\n<p>And yes, I say “from the shadows” because this architecture has always existed. When we define an application like a Model View Controller (MVC), or a Single Page Application (SPA) that consumes an API, it is the responsibility of software architects to make choices for which architecture solves any given use case, and architects need to address a number of factors:</p>\n<ul>\n<li>The way queues are attended to.</li>\n<li>Services that need to be orchestrated to have an effective API available.</li>\n<li>The Backend For Frontend (BFF) layer to help create an easy implementation and separation of concerns for different frameworks.</li>\n<li>Many other factors that demand consideration and push defining the front end lower and lower in the order of importance.</li>\n</ul>\n<p>To solve these issues, this is where the Front End architect emerges, because the architect must deal with the user experience, performance, SEO, Accessibility, Tagging events, and take ownership of this layer, between the service and the user.</p>\n<p><img src=\"https://miro.medium.com/v2/resize:fit:1400/1*MmgKz3-I72tznd1xMMDf2Q.png\" alt=\"\"></p>\n<h2 id=\"how-frontend-architects-harness-micro-frontends\">How Frontend Architects Harness Micro Frontends</h2>\n<hr>\n<p>As we mentioned before, the importance of TTM is growing and we need new ways of working in order to meet demand. However, MVCs and SPAs are mired in issues that reduce overall speed because of enlarged pipeline processes, resolving difficulties and issues during fast deployments, misaligning developer priorities to focus more on business rather than the code necessary to implement it, which means less time resolving issues on StackOverflow 😉.</p>\n<p>In this scenario, micro frontends (MFEs) offer a path forward to make frontend development more specialized, taking advantage of the Domain-Driven-Design (DDD) to orient frontend applications toward respective business subdomains and deploy as fast as possible from start to finish.</p>\n<p>Even within MFE development, there are a variety of approaches. One approach separates a custom app into mini, sometimes nano applications, that take care of specific concerns like a shopping cart or purchase summary. This approach could include separating a shopping cart from a general product view page. Another approach could address optimization issues, for example, by separating an image within a card from the card details. Typically at Modyo, we use a more global approach associated with the business subdomain and objectives.</p>\n<h2 id=\"micro-frontends-at-modyo\">Micro Frontends at ®Modyo</h2>\n<hr>\n<p>Between a complete single page application approach, and a micro app approach based purely on functionality, at Modyo we use something in between, where we separate applications by their business subdomain. We call each of these applications a widget, and these widgets can be managed independently from the rest of the developed web application. They can even be deployed and rolled back on their own, and take advantage of the benefits of the overall Modyo platform to bootstrap and manage them, injecting them into a page to load asynchronously in any order that we need.</p>\n<p>As an approach, at Modyo we encourage the usage of MFEs, but more specifically, those rendered client-side, rather than say, server-side such as single-spa solutions or webpack module federation. This categorizes us in a specific space within MFE architecture, and even though we’re already actively <a href=\"https://www.modyo.com/solutions/microfrontend\">delivering digital products to market with this approach</a>, we continue to make improvements over time to more closely align our solutions to an MFE architecture approach.</p>\n<p>Recently, we’ve resolved how to share portions of code between apps, similar to how designers work with <a href=\"https://www.modyo.com/blog/designing-consistent-and-scalable-products-building-a-design-system-with-atomic-design\">design systems</a>. This concern of sharing code within a pure MFE architecture is taboo, but we make it work by putting all that common code in a package available to any MFE as a dependency, making possible to develop and update it (with its own pace of development and with proper semantic versioning) independently from the main application. It’s all about making deliberate choices in the organization of common, shared components. With this approach, we accomplish our goal of TTM as fast as possible while keeping rigor in the definition of each independently deployed application, taking advantage of the code sharing we have available for the way we manage our MFE architecture.</p>\n<p>When delivering content, Modyo is a mix between a headless and decoupled CMS, and with the advantages of the decoupled CMS strategy, we can deliver content from the server-side directly to our widgets (MFEs) via the Liquid Template Engine that we natively support. It’s a best practice to adopt and take advantage of this MFE architecture, with the foundation of client-side MFE composition.</p>\n<p><img src=\"https://miro.medium.com/v2/resize:fit:1400/0*pgqMdevdWSs9_HL8.png\" alt=\"\"></p>\n<h2 id=\"the-future-of-micro-frontends-at-modyo\">The Future of Micro Frontends at Modyo</h2>\n<hr>\n<p>We’re working hard on new features that allow us to deliver this architecture to the Modyo platform, all without interrupting the normal workflow of expert developers on the market while also giving them the ability to use native APIs to build interactions between widgets without breaking core MFE principles.</p>\n<p>In a future post, we’ll talk about how to make this happen from a front end perspective and how this improves our work once the Modyo way of managing MFE architecture is in our veins.</p>\n<p>Until next time!</p>\n<p><a href=\"https://medium.com/tag/mfe?source=post_page-----198b211b1bcc---------------mfe-----------------\"></a></p>";

				const frontmatter = {"draft":false,"selfHealing":"000003","title":"Micro Frontend Architecture","resume":"Giorgio discusses the benefits and implementation of micro frontend architecture, emphasizing its growing popularity and effectiveness in modern web development. He outlines how this architecture enables more efficient, specialized development by dividing frontend applications into smaller, manageable components.","image":{"src":"microfrontend_klswbm","alt":"Micro Frontend Architecture"},"publishDate":"2023-05-08 11:39","category":"architecture","author":"jorge-saud","tags":["microfrontend","architecture"]};
				const file = "/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/microfrontend.md";
				const url = undefined;
				function rawContent() {
					return "\nIn a [previous article at modyo blog](https://blog.modyo.com/posts/micro-frontends-empower-your-developers-to-build-better-digital-products), we talked about how micro frontends offer more freedom for teams and deliver more efficient applications. Because of this, they are becoming popular among architects and developers because large organizations and industry leaders are successfully managing their own web applications using micro frontend architectures.\n\nWe can begin by first explaining how to determine if something is a trend that won’t last long, a new way of making things that people are beginning to adopt, or a widely accepted architecture. Let’s start by defining the word, architecture:\n\n> _Both the process and the product of planning, designing, and constructing buildings or other structures. Architectural works, in the material form of buildings, are often perceived as cultural symbols and as works of art. Historical civilizations are often identified with their surviving architectural achievements._\n\nLike the definition says, architecture is representative of an era or period of time; this is also true of software architecture. Everything related to architecture, whether physical or software, is something that must evolve and represent a way of doing things long term.\n\n## Micro frontend architecture\n\n---\n\nFrontend architecture is a new concept, but it’s becoming more and more popular every day due to the evolution of the web and the need for people to interact more with computers, websites, native applications, and [progressive web applications](https://www.youtube.com/watch?v=zB9xQH_Rhnk&t=4s). How we use and choose technology like frontend architecture is more important now than ever given the changes brought on by the COVID-19 pandemic. Not only do we use technology to make our lives easier and more convenient, but also to make us safer. It helps us stay safe at home, pay for services online, and keeps the general economical ball rolling.\n\nAlthough we’ve made many changes to adjust to the demands of the pandemic, these changes aren’t temporary. They’re here to stay, **which now drives the market need to adopt a new architecture**–an architecture that interacts directly with people, one that humanizes our interactions with people and doesn’t just deal with APIs. This situation makes us evolve how we deliver new services and take advantage of faster time to market (TTM). We need to take the decisions that we make in the front end with careful consideration and more accountability. This is where the **Front End Architecture** emerges from the shadows.\n\nAnd yes, I say “from the shadows” because this architecture has always existed. When we define an application like a Model View Controller (MVC), or a Single Page Application (SPA) that consumes an API, it is the responsibility of software architects to make choices for which architecture solves any given use case, and architects need to address a number of factors:\n\n- The way queues are attended to.\n- Services that need to be orchestrated to have an effective API available.\n- The Backend For Frontend (BFF) layer to help create an easy implementation and separation of concerns for different frameworks.\n- Many other factors that demand consideration and push defining the front end lower and lower in the order of importance.\n\nTo solve these issues, this is where the Front End architect emerges, because the architect must deal with the user experience, performance, SEO, Accessibility, Tagging events, and take ownership of this layer, between the service and the user.\n\n![](https://miro.medium.com/v2/resize:fit:1400/1*MmgKz3-I72tznd1xMMDf2Q.png)\n\n## How Frontend Architects Harness Micro Frontends\n\n---\n\nAs we mentioned before, the importance of TTM is growing and we need new ways of working in order to meet demand. However, MVCs and SPAs are mired in issues that reduce overall speed because of enlarged pipeline processes, resolving difficulties and issues during fast deployments, misaligning developer priorities to focus more on business rather than the code necessary to implement it, which means less time resolving issues on StackOverflow 😉.\n\nIn this scenario, micro frontends (MFEs) offer a path forward to make frontend development more specialized, taking advantage of the Domain-Driven-Design (DDD) to orient frontend applications toward respective business subdomains and deploy as fast as possible from start to finish.\n\nEven within MFE development, there are a variety of approaches. One approach separates a custom app into mini, sometimes nano applications, that take care of specific concerns like a shopping cart or purchase summary. This approach could include separating a shopping cart from a general product view page. Another approach could address optimization issues, for example, by separating an image within a card from the card details. Typically at Modyo, we use a more global approach associated with the business subdomain and objectives.\n\n## Micro Frontends at ®Modyo\n\n---\n\nBetween a complete single page application approach, and a micro app approach based purely on functionality, at Modyo we use something in between, where we separate applications by their business subdomain. We call each of these applications a widget, and these widgets can be managed independently from the rest of the developed web application. They can even be deployed and rolled back on their own, and take advantage of the benefits of the overall Modyo platform to bootstrap and manage them, injecting them into a page to load asynchronously in any order that we need.\n\nAs an approach, at Modyo we encourage the usage of MFEs, but more specifically, those rendered client-side, rather than say, server-side such as single-spa solutions or webpack module federation. This categorizes us in a specific space within MFE architecture, and even though we’re already actively [delivering digital products to market with this approach](https://www.modyo.com/solutions/microfrontend), we continue to make improvements over time to more closely align our solutions to an MFE architecture approach.\n\nRecently, we’ve resolved how to share portions of code between apps, similar to how designers work with [design systems](https://www.modyo.com/blog/designing-consistent-and-scalable-products-building-a-design-system-with-atomic-design). This concern of sharing code within a pure MFE architecture is taboo, but we make it work by putting all that common code in a package available to any MFE as a dependency, making possible to develop and update it (with its own pace of development and with proper semantic versioning) independently from the main application. It’s all about making deliberate choices in the organization of common, shared components. With this approach, we accomplish our goal of TTM as fast as possible while keeping rigor in the definition of each independently deployed application, taking advantage of the code sharing we have available for the way we manage our MFE architecture.\n\nWhen delivering content, Modyo is a mix between a headless and decoupled CMS, and with the advantages of the decoupled CMS strategy, we can deliver content from the server-side directly to our widgets (MFEs) via the Liquid Template Engine that we natively support. It’s a best practice to adopt and take advantage of this MFE architecture, with the foundation of client-side MFE composition.\n\n![](https://miro.medium.com/v2/resize:fit:1400/0*pgqMdevdWSs9_HL8.png)\n\n## The Future of Micro Frontends at Modyo\n\n---\n\nWe’re working hard on new features that allow us to deliver this architecture to the Modyo platform, all without interrupting the normal workflow of expert developers on the market while also giving them the ability to use native APIs to build interactions between widgets without breaking core MFE principles.\n\nIn a future post, we’ll talk about how to make this happen from a front end perspective and how this improves our work once the Modyo way of managing MFE architecture is in our veins.\n\nUntil next time!\n\n[](https://medium.com/tag/mfe?source=post_page-----198b211b1bcc---------------mfe-----------------)\n";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [{"depth":2,"slug":"micro-frontend-architecture","text":"Micro frontend architecture"},{"depth":2,"slug":"how-frontend-architects-harness-micro-frontends","text":"How Frontend Architects Harness Micro Frontends"},{"depth":2,"slug":"micro-frontends-at-modyo","text":"Micro Frontends at ®Modyo"},{"depth":2,"slug":"the-future-of-micro-frontends-at-modyo","text":"The Future of Micro Frontends at Modyo"}];
				}

				const Content = createComponent((result, _props, slots) => {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;

					return renderTemplate`${maybeRenderHead()}${unescapeHTML(html)}`;
				});

export { Content, compiledContent, Content as default, file, frontmatter, getHeadings, rawContent, url };
