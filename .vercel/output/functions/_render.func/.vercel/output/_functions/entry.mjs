import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_LoQXCUeW.mjs';
import { manifest } from './manifest_CuyN0Jj5.mjs';
import { onRequest } from './_noop-middleware.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/about.astro.mjs');
const _page3 = () => import('./pages/contact.astro.mjs');
const _page4 = () => import('./pages/es/acerca-de-mi.astro.mjs');
const _page5 = () => import('./pages/es/contactame.astro.mjs');
const _page6 = () => import('./pages/es/cuaderno/_redirect_.astro.mjs');
const _page7 = () => import('./pages/es/cuaderno/_slug_.astro.mjs');
const _page8 = () => import('./pages/es/cuaderno/_---page_.astro.mjs');
const _page9 = () => import('./pages/es.astro.mjs');
const _page10 = () => import('./pages/manifest.json.astro.mjs');
const _page11 = () => import('./pages/notebook/_redirect_.astro.mjs');
const _page12 = () => import('./pages/notebook/_slug_.astro.mjs');
const _page13 = () => import('./pages/notebook/_---page_.astro.mjs');
const _page14 = () => import('./pages/portfolio/_redirect_.astro.mjs');
const _page15 = () => import('./pages/portfolio/_slug_.astro.mjs');
const _page16 = () => import('./pages/portfolio/_---page_.astro.mjs');
const _page17 = () => import('./pages/pricing.astro.mjs');
const _page18 = () => import('./pages/robot.txt.astro.mjs');
const _page19 = () => import('./pages/rss.xml.astro.mjs');
const _page20 = () => import('./pages/team/_slug_.astro.mjs');
const _page21 = () => import('./pages/team.astro.mjs');
const _page22 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/.pnpm/astro@4.15.4_@types+node@22.4.0_rollup@2.79.1_terser@5.31.6_typescript@5.6.2/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/about.astro", _page2],
    ["src/pages/contact.astro", _page3],
    ["src/pages/es/acerca-de-mi.astro", _page4],
    ["src/pages/es/contactame.astro", _page5],
    ["src/pages/es/cuaderno/[redirect].astro", _page6],
    ["src/pages/es/cuaderno/[slug].astro", _page7],
    ["src/pages/es/cuaderno/[...page]/index.astro", _page8],
    ["src/pages/es/index.astro", _page9],
    ["src/pages/manifest.json.ts", _page10],
    ["src/pages/notebook/[redirect].astro", _page11],
    ["src/pages/notebook/[slug].astro", _page12],
    ["src/pages/notebook/[...page]/index.astro", _page13],
    ["src/pages/portfolio/[redirect].astro", _page14],
    ["src/pages/portfolio/[slug].astro", _page15],
    ["src/pages/portfolio/[...page]/index.astro", _page16],
    ["src/pages/pricing.astro", _page17],
    ["src/pages/robot.txt.ts", _page18],
    ["src/pages/rss.xml.ts", _page19],
    ["src/pages/team/[slug].astro", _page20],
    ["src/pages/team/index.astro", _page21],
    ["src/pages/index.astro", _page22]
]);
const serverIslandMap = new Map();

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: onRequest
});
const _args = {
    "middlewareSecret": "ff88e3c4-999c-4a17-92db-f1d7dd6d5774",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
