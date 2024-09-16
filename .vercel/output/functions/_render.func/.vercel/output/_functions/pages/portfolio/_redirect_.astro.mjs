/* empty css                                    */
import { c as createAstro, a as createComponent, r as renderTemplate } from '../../chunks/astro/server_ICIjUNoW.mjs';
import { g as getCollection } from '../../chunks/_astro_content_BgJEc3n0.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://giorgiosaud.io");
const prerender = false;
const $$redirect = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$redirect;
  let path = Astro2.url.pathname;
  if (path.includes("/portfolio")) {
    console.log("inside if path::");
    const hashToHeal = path.match(/\/portfolio\/.*?(\d{6})/)?.[1];
    if (hashToHeal) {
      const col = await getCollection("portfolio", (entry) => {
        return entry.data.selfHealing === hashToHeal;
      });
      if (col.length) {
        const redirect = "/portfolio/" + col[0].slug;
        return Astro2.redirect(redirect);
      }
    }
    return Astro2.redirect("/404");
  }
  return renderTemplate``;
}, "/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/portfolio/[redirect].astro", void 0);

const $$file = "/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/portfolio/[redirect].astro";
const $$url = "/portfolio/[redirect]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$redirect,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
