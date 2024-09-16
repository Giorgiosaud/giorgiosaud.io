import { a as createComponent, r as renderTemplate, m as maybeRenderHead, u as unescapeHTML } from './astro/server_ICIjUNoW.mjs';

const html = "<h1 id=\"project-overview-full-copec-website\">Project Overview: Full Copec Website</h1>\n<p><strong>Objective:</strong><br>\nThe objective of this project was to create a site that allows users to redeem points from Copec, a leading energy and retail company in Chile. The site was designed to provide an easy and efficient way for customers to browse a catalog and redeem their points.</p>\n<p><strong>Role:</strong><br>\nAs the <strong>Front-End Architect</strong>, I was responsible for designing and implementing the architecture of the site, ensuring it met the client’s requirements while maintaining high performance and scalability.</p>\n<p><strong>Challenges &#x26; Solutions:</strong><br>\nOne of the significant challenges was integrating an external API for redemptions into the site while maintaining a seamless front-end session within a Single-Page Application (SPA) built on Modyo. This required advanced techniques to ensure that the site could be indexed by Google despite being JavaScript-driven. To achieve this, I implemented SEO techniques tailored for JavaScript applications, ensuring proper indexing and visibility on search engines. Additionally, I handled global stores and routing within Modyo to provide a smooth user experience.</p>\n<p><strong>Key Features:</strong></p>\n<ul>\n<li><strong>Catalog Display:</strong> Users can browse through a catalog of available items for redemption.</li>\n<li><strong>Point Redemption:</strong> The site allows users to redeem their accumulated points directly within the app.</li>\n</ul>\n<p><strong>Outcome:</strong><br>\nThe project was completed on time and successfully delivered a functional, user-friendly site that met all of Copec’s needs.</p>\n<p><strong>Client:</strong><br>\nCopec, a prominent company in the energy and retail sector in Chile, was the client for this project.</p>";

				const frontmatter = {"draft":false,"workingOn":"Modyo","selfHealing":"900003","country":"Chile","client":"Copec","category":"Private Site","project":"Redeem Site","resume":"Create a simple site for manage credits summary and add check credit details.","image":{"src":"fullcopec","alt":"Full Copec Project"},"publishDate":"08-01-2020","classes":"bg-clip-text text-transparent bg-gradient-to-b from-indigo-300 to-indigo-600","classesClient":"bg-clip-text bg-gradient-to-b text-transparent from-indigo-600 to-indigo-950","technologies":["vue 2","bootstrap 4","vanilla js"]};
				const file = "/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/portfolio/full-copec.md";
				const url = undefined;
				function rawContent() {
					return "\n# Project Overview: Full Copec Website\n\n**Objective:**  \nThe objective of this project was to create a site that allows users to redeem points from Copec, a leading energy and retail company in Chile. The site was designed to provide an easy and efficient way for customers to browse a catalog and redeem their points.\n\n**Role:**  \nAs the **Front-End Architect**, I was responsible for designing and implementing the architecture of the site, ensuring it met the client's requirements while maintaining high performance and scalability.\n\n**Challenges & Solutions:**  \nOne of the significant challenges was integrating an external API for redemptions into the site while maintaining a seamless front-end session within a Single-Page Application (SPA) built on Modyo. This required advanced techniques to ensure that the site could be indexed by Google despite being JavaScript-driven. To achieve this, I implemented SEO techniques tailored for JavaScript applications, ensuring proper indexing and visibility on search engines. Additionally, I handled global stores and routing within Modyo to provide a smooth user experience.\n\n**Key Features:**\n\n- **Catalog Display:** Users can browse through a catalog of available items for redemption.\n- **Point Redemption:** The site allows users to redeem their accumulated points directly within the app.\n\n**Outcome:**  \nThe project was completed on time and successfully delivered a functional, user-friendly site that met all of Copec's needs.\n\n**Client:**  \nCopec, a prominent company in the energy and retail sector in Chile, was the client for this project.\n";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [{"depth":1,"slug":"project-overview-full-copec-website","text":"Project Overview: Full Copec Website"}];
				}

				const Content = createComponent((result, _props, slots) => {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;

					return renderTemplate`${maybeRenderHead()}${unescapeHTML(html)}`;
				});

export { Content, compiledContent, Content as default, file, frontmatter, getHeadings, rawContent, url };
