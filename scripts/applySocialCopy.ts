/**
 * One-shot script: inject linkedinCopy and twitterCopy into all EN notes.
 * Run with: bun scripts/applySocialCopy.ts
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dir, '..')
const NOTES_DIR = resolve(ROOT, 'src/content/notes/en')

interface SocialCopy {
  linkedinCopy: string
  twitterCopy: string
}

// keyed by filename without extension
const copies: Record<string, SocialCopy> = {
  '2025-09-14-mcps-role-in-the-future-of-ai-technology': {
    linkedinCopy: `Fellow devs — MCP (Model Context Protocol) is quietly reshaping how AI integrates with real applications. If you are building anything with LLMs and have not looked at MCP yet, you are going to want to. I wrote about where this is heading and why it matters for how we architect AI-powered systems. Sign in and drop your take in the comments — I want to know if you are already using MCP in production.
Read more: https://www.giorgiosaud.io/notebook/MCPNRF

#AI #MCP #LLM #SoftwareArchitecture #WhoNeedsPluginsAnymore #MCPOrBust`,
    twitterCopy: `Fellow devs — MCP is changing how AI connects to real apps and it is moving fast. Are you building with it yet? Sign in and comment: https://www.giorgiosaud.io/notebook/MCPNRF #AI #MCP #WhoNeedsPluginsAnymore`,
  },

  '2026-01-12-venezuela-2026-the-clean-install-of-a-national-hardware': {
    linkedinCopy: `What if you could reboot a country like a system? That is exactly the mental model I applied to Venezuela's current moment — dollarization, industrial reset, and a new social algorithm emerging from chaos. This is not a political take, it is a solution architect's read on resource orchestration at national scale. Sign in and tell me where you think the bottlenecks are.
Read more: https://www.giorgiosaud.io/notebook/VPRNF2

#Venezuela #DigitalTransformation #SolutionArchitecture #NationAsAPlatform #CleanInstallNotAvailable`,
    twitterCopy: `What if you could reboot a country like a system? My architect's take on Venezuela 2026. Sign in and comment: https://www.giorgiosaud.io/notebook/VPRNF2 #Venezuela #NationAsAPlatform #CleanInstallNotAvailable`,
  },

  '2026-05-03-chrome-built-in-ai-summarizer': {
    linkedinCopy: `Fellow devs — Chrome ships a native Summarizer API and the model runs entirely on device. No API keys, no server costs, no sending user content to the cloud. I explored the full API surface: availability detection, streaming, multi-language, and graceful fallback. If you are building content-heavy apps this is worth your attention right now. Sign in and share how you are thinking about on-device AI in your stack.
Read more: https://www.giorgiosaud.io/notebook/chrmbl

#AI #Chrome #BrowserAPI #WebDev #FreeAIUntilItIsnt #OnDeviceOrBust`,
    twitterCopy: `Fellow devs — Chrome now ships a native Summarizer API. No keys, no server, no cost. Runs on device. Sign in and comment: https://www.giorgiosaud.io/notebook/chrmbl #AI #Chrome #FreeAIUntilItIsnt`,
  },

  'better-auth-drizzle-neon-astro': {
    linkedinCopy: `Fellow devs — setting up auth in Astro from scratch is one of those things that should be simple and somehow takes a full day. Better Auth plus Drizzle plus Neon is the stack that finally clicked for me. Two config files, email, OAuth, passkeys — the whole thing explained without the usual boilerplate maze. Sign in and tell me what auth setup you are using in your Astro projects.
Read more: https://www.giorgiosaud.io/notebook/bttrth

#Astro #Auth #Drizzle #Postgres #WebDev #AuthAgainSeriouslyWhyIsThisHard #PasskeysForever`,
    twitterCopy: `Fellow devs — Better Auth + Drizzle + Neon in Astro: email, OAuth, passkeys explained without the maze. Sign in and comment: https://www.giorgiosaud.io/notebook/bttrth #Astro #Auth #PasskeysForever`,
  },

  'browser-native-ai-chrome-summarizer': {
    linkedinCopy: `Fellow devs — lazy loading an AI model that runs entirely in the browser felt like science fiction two years ago. Chrome's Summarizer API makes it real today. I went deep on the streaming API, multi-language support, and how to handle the cases where the model is not available yet. No backend, no keys, just the browser doing the work. Sign in and let me know if you are experimenting with browser-native AI.
Read more: https://www.giorgiosaud.io/notebook/brwsrn

#AI #Chrome #JavaScript #Performance #WebDev #BrowserDoingHeavyLifting #LazyLoadTheModel`,
    twitterCopy: `Fellow devs — Chrome's Summarizer API: AI in the browser, no backend, no keys, just works. Sign in and comment: https://www.giorgiosaud.io/notebook/brwsrn #AI #Chrome #BrowserDoingHeavyLifting`,
  },

  'bunx-vitest-vs-vitest-in-bun-scripts': {
    linkedinCopy: `Fellow devs — if your tests run fine with bun run test but fail with vitest: command not found inside a Bun script, this post is for you. The fix is one word: bunx. I explain exactly why Bun does not always put node_modules/.bin on PATH and when it matters. It is one of those things that costs you an hour the first time. Sign in and share what other Bun gotchas you have hit.
Read more: https://www.giorgiosaud.io/notebook/bnxvts

#Bun #Vitest #Testing #DevOps #OneWordFix #BunGotchaOfTheDay #TestingInTheDark`,
    twitterCopy: `Fellow devs — bun run test works but vitest says command not found? One word fix: bunx. Here is why: https://www.giorgiosaud.io/notebook/bnxvts #Bun #Vitest #OneWordFix`,
  },

  'carousel-scroll-marker': {
    linkedinCopy: `Fellow devs — building a carousel used to mean reaching for a JavaScript library. Not anymore. scroll-marker and scroll-marker-group are now real CSS properties and they give you pagination dots, keyboard navigation, and snap behavior with zero JS. I built one step by step and documented every part. Sign in and tell me if you are still reaching for JS carousels or making the switch.
Read more: https://www.giorgiosaud.io/notebook/0JSCRS

#CSS #NoJS #Carousel #FrontEnd #WebDev #JavaScriptWentForCigarettes #CSSWins`,
    twitterCopy: `Fellow devs — CSS carousels with pagination dots and snap, zero JavaScript. scroll-marker is here. Sign in and comment: https://www.giorgiosaud.io/notebook/0JSCRS #CSS #NoJS #JavaScriptWentForCigarettes`,
  },

  'chrome-summarizer-api-2026': {
    linkedinCopy: `Fellow devs — Chrome's built-in Summarizer API went mainstream in 2026 and the patterns for using it in production are clearer now. I cover availability detection, the latest capabilities, and what to do when the model has not downloaded yet on a fresh device. On-device AI for content summarization is no longer a prototype. Sign in and share how you are planning to use it.
Read more: https://www.giorgiosaud.io/notebook/chrmsm

#AI #Chrome #BrowserAPI #WebDev #2026 #AIRanOutOfExcuses #OnDeviceIsHere`,
    twitterCopy: `Fellow devs — Chrome's Summarizer API is mainstream in 2026. Here are the production patterns. Sign in and comment: https://www.giorgiosaud.io/notebook/chrmsm #AI #Chrome #AIRanOutOfExcuses`,
  },

  'claude-api-load-indicator-terminal': {
    linkedinCopy: `Fellow devs — I was tired of not knowing if Claude API was slow or if it was just my network. So I built a zsh plugin that shows live API latency in my Powerlevel10k prompt using a background launchd job and a rolling baseline. Every terminal prompt now tells me the current state. This is the kind of devtools rabbit hole I cannot stop going down. Sign in and tell me what terminal customizations you are obsessed with.
Read more: https://www.giorgiosaud.io/notebook/bldngc

#Terminal #ZSH #DevOps #AI #Claude #TerminalPersonalityDisorder #PromptEngineeringButLiterally`,
    twitterCopy: `Fellow devs — I put Claude API latency in my terminal prompt using a launchd background job. Because why not. Sign in and comment: https://www.giorgiosaud.io/notebook/bldngc #Terminal #Claude #PromptEngineeringButLiterally`,
  },

  'container-and-container-queries': {
    linkedinCopy: `Fellow devs — container queries were the CSS feature I did not know I was waiting for. Instead of asking how wide the viewport is, you ask how wide the parent component is. I used @container to redesign my notebook layout and the result is components that genuinely adapt to their context. Sign in and tell me if you have made the switch from media queries to container queries.
Read more: https://www.giorgiosaud.io/notebook/CQX001

#CSS #ContainerQueries #FrontEnd #WebDev #ViewportQueriesAreForBoomers #ComponentFirst`,
    twitterCopy: `Fellow devs — container queries: stop asking the viewport, ask the parent. Game changer for component design. Sign in and comment: https://www.giorgiosaud.io/notebook/CQX001 #CSS #ViewportQueriesAreForBoomers`,
  },

  'container-queries-2026': {
    linkedinCopy: `Fellow devs — container queries hit 95% browser support in 2026 and the advanced patterns are now worth learning. Style queries, named containers, and component-level responsive design are all production-ready. I wrote a practical guide with real card layouts and form designs that were genuinely impossible before universal support. Sign in and share the pattern you are most excited to use.
Read more: https://www.giorgiosaud.io/notebook/cntnrq

#CSS #ContainerQueries #ResponsiveDesign #FrontEnd #2026 #RIPMediaQueries #ComponentFirstForReal`,
    twitterCopy: `Fellow devs — container queries at 95% support in 2026. Style queries, named containers: all production-ready. Sign in and comment: https://www.giorgiosaud.io/notebook/cntnrq #CSS #RIPMediaQueries`,
  },

  'csp-without-unsafe-inline-astro-vercel': {
    linkedinCopy: `Fellow devs — removing unsafe-inline from your CSP sounds simple until you are knee-deep in Astro inline scripts and Vercel edge functions. I went through every pitfall: build-time hash generation, hydration scripts, third-party embeds. The result is a fully automated SHA-256 hash pipeline that runs at build time. Sign in and tell me if you have fought this battle on your own projects.
Read more: https://www.giorgiosaud.io/notebook/cspwth

#Security #CSP #Astro #Vercel #WebSecurity #UnsafeInlineIsVeryActuallySafe #HashItAndForgetIt`,
    twitterCopy: `Fellow devs — removing unsafe-inline from CSP in Astro + Vercel: every pitfall documented. Sign in and comment: https://www.giorgiosaud.io/notebook/cspwth #Security #CSP #HashItAndForgetIt`,
  },

  'css-anchor-positioning': {
    linkedinCopy: `Fellow devs — CSS Anchor Positioning is the feature that lets you throw away every JavaScript tooltip library you have ever reluctantly installed. Position popovers, dropdowns, and modals relative to any element, natively, with CSS. I built real examples: tooltips, dropdown menus, and context menus with no JavaScript. Sign in and tell me which JS positioning library you are finally ready to delete.
Read more: https://www.giorgiosaud.io/notebook/cssnch

#CSS #FrontEnd #WebDev #UI #GoodbyePopper #CSSDoingThingsAgain #TooltipsNeedNoJS`,
    twitterCopy: `Fellow devs — CSS Anchor Positioning is here and your tooltip library can finally retire. Sign in and comment: https://www.giorgiosaud.io/notebook/cssnch #CSS #GoodbyePopper #CSSDoingThingsAgain`,
  },

  'css-carousels-2026': {
    linkedinCopy: `Fellow devs — building carousels with pure CSS is no longer a hack. scroll-marker, scroll-button, and scroll snap are all here in 2026 and they give you pagination dots, previous/next buttons, and keyboard navigation without touching JavaScript. I put together a full guide from zero to production-ready. Sign in and tell me if you are finally ready to delete that carousel library from your package.json.
Read more: https://www.giorgiosaud.io/notebook/csscrs

#CSS #Carousels #FrontEnd #WebDev #2026 #DeletingSwiper #NativeOrNothingNow #ScrollSnapFTW`,
    twitterCopy: `Fellow devs — CSS carousels in 2026: native scroll markers, snap, and buttons. No JS library needed. Sign in and comment: https://www.giorgiosaud.io/notebook/csscrs #CSS #DeletingSwiper #ScrollSnapFTW`,
  },

  'css-custom-properties-2026': {
    linkedinCopy: `Fellow devs — @property is now universally supported and it changes everything about how we build design systems. Typed variables, animatable custom properties, and inheritance control are all production-ready. I wrote about the patterns that matter: typed tokens, animated gradients, and scoped theming without the usual hacks. Sign in and tell me if you have started using @property in your design system.
Read more: https://www.giorgiosaud.io/notebook/csscst

#CSS #DesignSystems #FrontEnd #WebDev #2026 #TypedCSSIsFinally #CustomPropertiesGrowUp`,
    twitterCopy: `Fellow devs — @property is universal in 2026. Typed variables, animated custom properties, proper design tokens. Sign in and comment: https://www.giorgiosaud.io/notebook/csscst #CSS #TypedCSSIsFinally`,
  },

  'css-grid-subgrid-2026': {
    linkedinCopy: `Fellow devs — subgrid landed in all major browsers and it solves the card alignment problem that CSS developers have been workarounding for years. Nested grids that participate in their parent's tracks. I show the patterns: aligned card footers, nested form labels, editorial layouts that actually work. Sign in and share which layout problem you are solving with subgrid.
Read more: https://www.giorgiosaud.io/notebook/cssgrd

#CSS #Grid #Subgrid #Layout #FrontEnd #WebDev #AlignmentTherapy #GridInAGrid`,
    twitterCopy: `Fellow devs — CSS subgrid is universal in 2026. Card alignment nightmares: solved. Sign in and comment: https://www.giorgiosaud.io/notebook/cssgrd #CSS #Grid #AlignmentTherapy`,
  },

  'css-layers-2026': {
    linkedinCopy: `Fellow devs — CSS Cascade Layers at 98% browser support means specificity wars are officially optional. @layer lets you declare the order of precedence between your resets, framework styles, component styles, and utilities. I cover the production patterns for integrating third-party frameworks without fighting their specificity. Sign in and tell me if @layer has changed how you organize your CSS.
Read more: https://www.giorgiosaud.io/notebook/csslyr

#CSS #CascadeLayers #FrontEnd #Architecture #2026 #SpecificityWarsAreOver #LayersOnLayers`,
    twitterCopy: `Fellow devs — CSS @layer at 98% support in 2026. Specificity wars are now a choice, not a fate. Sign in and comment: https://www.giorgiosaud.io/notebook/csslyr #CSS #SpecificityWarsAreOver`,
  },

  'css-scroll-animations-2026': {
    linkedinCopy: `Fellow devs — remember fighting with JavaScript intersection observers just to animate on scroll? That era is over. CSS Scroll Animations hit full browser support in 2026 and I have been using them in production. View timeline, scroll timeline, animation-range — all stable, all pure CSS. I wrote a practical breakdown with real examples so you can start today. Drop your questions in the comments, I would love to hear how you are using scroll animations in your projects.
Read more: https://www.giorgiosaud.io/notebook/cssscr

#CSS #ScrollAnimations #FrontEnd #WebDev #NoMoreJSForThis #CSSWins #ScrollWithoutTherapy`,
    twitterCopy: `Fellow devs — CSS Scroll Animations are production-ready in 2026. No JS, no observers, just CSS doing what we always wanted. Sign in and comment: https://www.giorgiosaud.io/notebook/cssscr #CSS #NoMoreJSForThis #CSSWins`,
  },

  'css-scrolling-animations-simplified': {
    linkedinCopy: `Fellow devs — animation-timeline and animation-range are the two CSS properties that make scroll-driven animations actually readable. I wrote a simplified guide that skips the academic spec-speak and goes straight to the patterns you will actually use. If you have been putting off learning scroll animations because the docs look intimidating, this is the starting point. Sign in and tell me which animation you are building first.
Read more: https://www.giorgiosaud.io/notebook/000016

#CSS #Animation #FrontEnd #WebDev #SimplifiedOrBust #ScrollAndLearn #CSSIsNotSoScary`,
    twitterCopy: `Fellow devs — CSS scroll animations demystified. animation-timeline, animation-range: the parts that actually matter. Sign in and comment: https://www.giorgiosaud.io/notebook/000016 #CSS #SimplifiedOrBust`,
  },

  'custom-properties-with-defaults': {
    linkedinCopy: `Fellow devs — handling default values in CSS variables has two patterns: the pseudo-private technique that works everywhere today, and the @property rule that gives you type safety and proper inheritance control. I compare both with real examples and show when to use each. This is the kind of CSS detail that makes design systems much more maintainable. Sign in and share which pattern you have been using.
Read more: https://www.giorgiosaud.io/notebook/LVCSTP

#CSS #DesignSystems #FrontEnd #WebDev #CSSVariablesHaveDefaultsToo #TypedOrUntyped`,
    twitterCopy: `Fellow devs — CSS custom properties with defaults: pseudo-private vs @property. When to use each. Sign in and comment: https://www.giorgiosaud.io/notebook/LVCSTP #CSS #CSSVariablesHaveDefaultsToo`,
  },

  'efficient-and-effective-use-of-the-img-tag-with-srcset-and-sizes-attributes': {
    linkedinCopy: `Fellow devs — most of us use img tags every day and most of us are leaving performance on the table by not using srcset and sizes correctly. The browser can pick the right image for the right screen but only if you give it the right hints. I break down the exact syntax, the mental model for sizes, and the real-world impact on Core Web Vitals. Sign in and tell me if you have tackled this in your projects.
Read more: https://www.giorgiosaud.io/notebook/000002

#WebDev #FrontEnd #Performance #Images #CoreWebVitals #SrcsetIsNotScary #ResponsiveImages`,
    twitterCopy: `Fellow devs — srcset and sizes: stop serving 2x images to 1x screens. Your CWV will thank you. Sign in and comment: https://www.giorgiosaud.io/notebook/000002 #WebDev #SrcsetIsNotScary`,
  },

  'from-legacy-bloat-to-native-brilliance-our-website-migration-journey': {
    linkedinCopy: `Fellow devs — I migrated my personal site from a bloated legacy stack to modern native web standards and documented every decision. Faster, more accessible, smaller bundle, less JavaScript. The journey had more gotchas than I expected and I share all of them. Sign in and tell me what your current migration pain point is or what you have already conquered.
Read more: https://www.giorgiosaud.io/notebook/FLBTNB

#WebDev #FrontEnd #Migration #Performance #Evolution #BloatNoBueno #NativeOrNative`,
    twitterCopy: `Fellow devs — migrated from legacy bloat to native web standards. Faster, leaner, fewer regrets. Sign in and comment: https://www.giorgiosaud.io/notebook/FLBTNB #WebDev #BloatNoBueno #NativeOrNative`,
  },

  'grid-simplified': {
    linkedinCopy: `Fellow devs — one CSS grid class to rule responsive layouts. No media queries, no breakpoint juggling, just a grid that adapts. I show how a single reusable grid utility can handle the majority of your layout needs and why it beats a 12-column framework for most projects. Sign in and share your favorite CSS grid trick.
Read more: https://www.giorgiosaud.io/notebook/GSWBRL

#CSS #Grid #FrontEnd #WebDev #ResponsiveDesign #OneClassToRuleThemAll #GridGang`,
    twitterCopy: `Fellow devs — one CSS grid class for responsive layouts. No breakpoints, no media queries, just math. Sign in and comment: https://www.giorgiosaud.io/notebook/GSWBRL #CSS #Grid #OneClassToRuleThemAll`,
  },

  'how-i-use-layer-in-css-to-organize-styles-in-my-project': {
    linkedinCopy: `Fellow devs — I refactored my entire CSS architecture around @layer and the clarity it brought to specificity management is hard to overstate. Resets in one layer, component styles in another, utilities on top. The cascade becomes something you control instead of something you fight. I share my exact setup and the order that works for me. Sign in and tell me how you are organizing your CSS.
Read more: https://www.giorgiosaud.io/notebook/LYRCSS

#CSS #CascadeLayers #FrontEnd #Architecture #WebDev #FightingTheCascadeNoMore #LayeredAndProud`,
    twitterCopy: `Fellow devs — @layer in CSS: I refactored my whole style architecture around it and I am not going back. Sign in and comment: https://www.giorgiosaud.io/notebook/LYRCSS #CSS #LayeredAndProud`,
  },

  'how-im-using-new-css-global-properties-on-my-website-and-some-examples': {
    linkedinCopy: `Fellow devs — new CSS global properties are making theming and transitions much cleaner than the old workarounds. I am using them on this site and the code is simpler than I expected. Real examples from a production site, not a demo. Sign in and share which CSS global properties you have already adopted or are planning to.
Read more: https://www.giorgiosaud.io/notebook/NCSSPG

#CSS #FrontEnd #WebDev #Theming #CSSEvolvesAgain #GloballyStyled`,
    twitterCopy: `Fellow devs — new CSS global properties in production: cleaner theming, simpler transitions. Real examples. Sign in and comment: https://www.giorgiosaud.io/notebook/NCSSPG #CSS #CSSEvolvesAgain`,
  },

  'how-to-mock-astro-content-in-vitest': {
    linkedinCopy: `Fellow devs — unit testing Astro content collection helpers is not obvious and the official docs leave a gap. I found the exact pattern to mock getCollection, control import.meta.env.DEV, and make tests that actually reflect production filtering behavior instead of lying to you with false passes. This one cost me a few hours and now you do not have to pay that. Sign in and tell me what else you have had to figure out the hard way with Astro testing.
Read more: https://www.giorgiosaud.io/notebook/hwtmck

#Astro #Vitest #Testing #TypeScript #WebDev #MockItLikeYouMeanIt #TestsThatActuallyTest`,
    twitterCopy: `Fellow devs — mocking astro:content in Vitest is not obvious. Here is the exact pattern that works. Sign in and comment: https://www.giorgiosaud.io/notebook/hwtmck #Astro #Vitest #MockItLikeYouMeanIt`,
  },

  'html-css-carousel-step-by-step': {
    linkedinCopy: `Fellow devs — I wrote the carousel guide I wished existed when I started: complete, copy-paste ready, covering scroll snap, scroll markers, scroll buttons, browser support, and progressive enhancement. No JavaScript, no library, just HTML and CSS doing the full job. Structured for both humans reading and AI tools referencing. Sign in and tell me if you are finally shipping JS-free carousels.
Read more: https://www.giorgiosaud.io/notebook/htmlcs

#CSS #HTML #Carousels #FrontEnd #WebDev #CopyPasteAndShip #NoJSCarousel #ScrollSnapFTW`,
    twitterCopy: `Fellow devs — the complete HTML+CSS carousel guide: snap, markers, buttons, no JS. Copy-paste ready. Sign in and comment: https://www.giorgiosaud.io/notebook/htmlcs #CSS #CopyPasteAndShip #ScrollSnapFTW`,
  },

  'import-meta-env-dev-in-vitest': {
    linkedinCopy: `Fellow devs — vi.stubEnv sets a string. Vite's DEV is a boolean. The string 'false' is truthy. Your tests pass when they should fail. I hit this exact bug and tracked it down to a one-line fix that is not in any FAQ. This is the kind of silent failure that makes you question your entire test suite. Sign in and share what silent test bug has cost you the most time.
Read more: https://www.giorgiosaud.io/notebook/mprtmt

#Vitest #Vite #Astro #Testing #TypeScript #FalseIsActuallyTrue #TrustyourTestsNot #BooleanLies`,
    twitterCopy: `Fellow devs — vi.stubEnv('DEV', 'false') sets a string. Strings are truthy. Your tests lie. Here is the fix: https://www.giorgiosaud.io/notebook/mprtmt #Vitest #BooleanLies #TrustYourTestsNot`,
  },

  'islands-architecture-multi-framework': {
    linkedinCopy: `Fellow devs — Astro's Islands Architecture lets you run React, Vue, and Svelte in the same project and only hydrate the parts that need to be interactive. I explain the model, the client directives, and why this approach delivers better performance than a full SPA for most content-heavy sites. Sign in and tell me which framework combination you are running in your Astro project.
Read more: https://www.giorgiosaud.io/notebook/slndsr

#Astro #React #Vue #Svelte #Architecture #WebDev #IslandsNotAnArchipelago #HydrateResponsibly`,
    twitterCopy: `Fellow devs — React + Vue + Svelte in one project, only hydrating what needs to be interactive. Astro Islands. Sign in and comment: https://www.giorgiosaud.io/notebook/slndsr #Astro #HydrateResponsibly`,
  },

  'llms-txt-implementation': {
    linkedinCopy: `Fellow devs — llms.txt is a simple standard that makes your site legible to AI crawlers and language models. I implemented it in Astro with per-page .md endpoints and the setup is lighter than you think. If you want your content to be properly indexed and cited by AI tools, this is the right move. Sign in and tell me if you have added llms.txt to your sites yet.
Read more: https://www.giorgiosaud.io/notebook/llmstx

#AI #SEO #Astro #WebDev #LLMs #RobotsButFriendly #AIReadableOrInvisible`,
    twitterCopy: `Fellow devs — llms.txt: make your site readable by AI crawlers. Implemented in Astro in an afternoon. Sign in and comment: https://www.giorgiosaud.io/notebook/llmstx #AI #SEO #AIReadableOrInvisible`,
  },

  'mdx-file-in-astro-as-content-vs-md-file': {
    linkedinCopy: `Fellow devs — when do you actually need MDX over plain markdown in Astro? The answer depends on whether you need JSX components in your content, and the tradeoffs go deeper than most tutorials show. I compare the two approaches from a content architecture perspective. Sign in and tell me which one you defaulted to and whether you would make the same choice again.
Read more: https://www.giorgiosaud.io/notebook/000009

#Astro #MDX #WebDev #Architecture #ContentFirst #MDXOrMD #FrontmatterFighters`,
    twitterCopy: `Fellow devs — MDX vs MD in Astro: when you actually need the extra power and when you do not. Sign in and comment: https://www.giorgiosaud.io/notebook/000009 #Astro #MDXOrMD`,
  },

  microfrontend: {
    linkedinCopy: `Fellow devs — micro frontends get a lot of hype and a lot of skepticism. I break down the architecture pattern clearly: what it is, when it makes sense, and the real tradeoffs around team autonomy, bundle size, and complexity. If you are on a team debating whether to go this route, this is a good starting point for the conversation. Sign in and share your experience with micro frontend architecture.
Read more: https://www.giorgiosaud.io/notebook/000003

#MicroFrontend #Architecture #WebDev #FrontEnd #ScaleOrFail #MicrofrontendsAreJustFrontends #TeamAutonomy`,
    twitterCopy: `Fellow devs — micro frontend architecture: what it actually is, when it makes sense, real tradeoffs. Sign in and comment: https://www.giorgiosaud.io/notebook/000003 #Architecture #MicrofrontendsAreJustFrontends`,
  },

  'my-venezuelan-vision': {
    linkedinCopy: `Fellow devs with a broader perspective — I applied solution architecture thinking to Venezuela's industrial future. Automation in oil, mining, and tourism as priority vectors during a new investment cycle. This is the kind of systems thinking that rarely gets applied to national-scale problems and I think it should. Sign in and tell me how you think about technology and society at scale.
Read more: https://www.giorgiosaud.io/notebook/000008

#Venezuela #DigitalTransformation #Automation #SolutionArchitecture #IndustrialStrategy #ArchitectingANation #OilButMakeItDigital`,
    twitterCopy: `Fellow devs — applying solution architecture to Venezuela's industrial recovery. Automation, strategy, and systems thinking at national scale. Sign in and comment: https://www.giorgiosaud.io/notebook/000008 #Venezuela #ArchitectingANation`,
  },

  'paginator-in-astro': {
    linkedinCopy: `Fellow devs — pagination in Astro is one of those things that looks simple until you are deep in the paginate() API trying to figure out URL patterns and getStaticPaths. I built a production-ready paginator and documented the setup that actually works, including the edge cases most tutorials skip. Sign in and tell me what part of Astro pagination tripped you up.
Read more: https://www.giorgiosaud.io/notebook/000006

#Astro #FrontEnd #WebDev #Pagination #DoItLikeAPro #PageTwoExistsApparently #AstroGotchas`,
    twitterCopy: `Fellow devs — Astro pagination done right, including the edge cases tutorials skip. Sign in and comment: https://www.giorgiosaud.io/notebook/000006 #Astro #PageTwoExistsApparently`,
  },

  'prefllight-request-and-cors': {
    linkedinCopy: `Fellow devs — CORS errors in the browser console are one of the most common and most confusing integration problems. Preflight requests, OPTIONS methods, allowed headers — I break it all down clearly with real examples of what goes wrong and how to fix it on both the client and server side. Sign in and share your most memorable CORS war story.
Read more: https://www.giorgiosaud.io/notebook/000007

#CORS #WebDev #FrontEnd #Security #Integration #CORSisNotACurse #PreflightFrenzy`,
    twitterCopy: `Fellow devs — CORS and preflight requests demystified. What actually happens and how to fix it. Sign in and comment: https://www.giorgiosaud.io/notebook/000007 #CORS #CORSisNotACurse`,
  },

  'really-common-issues-integrating-from-front-end': {
    linkedinCopy: `Fellow devs — Content Security Policy is one of the most valuable security tools you can add to your site and one of the most misunderstood. I cover the basics of how CSP works, why it matters against XSS, and how to implement it without breaking everything on day one. A good starting point before you go deep. Sign in and share your CSP setup or the error that sent you back to unsafe-inline.
Read more: https://www.giorgiosaud.io/notebook/000001

#Security #CSP #WebDev #FrontEnd #XSS #CSPorNoCSP #unsafe-inlineIsASinActually`,
    twitterCopy: `Fellow devs — CSP basics: what it is, why it matters, how to add it without breaking your site. Sign in and comment: https://www.giorgiosaud.io/notebook/000001 #Security #CSP #unsafe-inlineIsASinActually`,
  },

  'refactoring-venezuela': {
    linkedinCopy: `Fellow devs and policy thinkers — US integration and the development of Puerto Ordaz as an industrial hub is not just an economic argument, it is a systems deployment question. I analyze it the way I would analyze a major infrastructure migration: dependencies, critical path, rollback plan. Sign in and tell me how you think technology and geopolitics intersect.
Read more: https://www.giorgiosaud.io/notebook/rfctrn

#Venezuela #Strategy #Architecture #DigitalTransformation #RefactoringANation #PuertoOrdazAsAService`,
    twitterCopy: `Fellow devs — analyzing Venezuela's recovery as a system refactoring problem. Critical path, dependencies, rollback. Sign in and comment: https://www.giorgiosaud.io/notebook/rfctrn #Venezuela #RefactoringANation`,
  },

  'repository-pattern-revisited': {
    linkedinCopy: `Fellow devs — the Repository pattern has a better name: Data Layer Architecture. Separating your API calls from your UI code is not just about testability, it is about giving your frontend a clean abstraction over whatever data source you have today. I revisit the pattern with modern frontend examples. Sign in and share how you structure your data layer.
Read more: https://www.giorgiosaud.io/notebook/000008

#FrontEnd #Architecture #WebDev #DataLayer #DesignPatterns #RepositoryPatternWalksIntoABar #DataLayerUp`,
    twitterCopy: `Fellow devs — the Repository pattern is actually called Data Layer Architecture and here is why the name matters. Sign in and comment: https://www.giorgiosaud.io/notebook/000008 #Architecture #DataLayerUp`,
  },

  'repository-pattern': {
    linkedinCopy: `Fellow devs — the Repository pattern in frontend development solves the problem of business logic getting tangled with data fetching. Better testability, cleaner components, and a data layer you can swap without touching the UI. I show the pattern with real frontend examples and why it improves maintainability. Sign in and tell me if you are using it in your current project.
Read more: https://www.giorgiosaud.io/notebook/000005

#FrontEnd #Architecture #WebDev #DesignPatterns #MicrofrontEnd #PatternOfTheDay #FetchSeparated`,
    twitterCopy: `Fellow devs — the Repository pattern in frontend: testable, swappable, and your components will thank you. Sign in and comment: https://www.giorgiosaud.io/notebook/000005 #FrontEnd #FetchSeparated`,
  },

  'self-healing-url-in-astro': {
    linkedinCopy: `Fellow devs — renaming a blog post should not break all the links pointing to it. Self-healing URLs in Astro solve this by mapping a stable short code to the current slug, so old links redirect automatically forever. I built the first version of this feature and documented the approach. Sign in and tell me how you handle URL stability in your content sites.
Read more: https://www.giorgiosaud.io/notebook/000010

#Astro #WebDev #Architecture #SEO #URLs #LinksLiveLongAndProsper #SelfHealingNotSelfHelp`,
    twitterCopy: `Fellow devs — self-healing URLs in Astro: rename your posts without breaking a single link. Sign in and comment: https://www.giorgiosaud.io/notebook/000010 #Astro #SelfHealingNotSelfHelp`,
  },

  'self-healing-urls-astro-5': {
    linkedinCopy: `Fellow devs — Astro 5 changed the content collections API and the self-healing URL implementation needed an update. glob loaders replace getCollection for this use case and the type-safe URL healing pattern is cleaner now. I document the migration from the Astro 4 approach. Sign in and share what Astro 5 migration surprised you most.
Read more: https://www.giorgiosaud.io/notebook/slfhln

#Astro #WebDev #SEO #URLs #2026 #Astro5OrBust #ContentCollectionsSurvivor`,
    twitterCopy: `Fellow devs — self-healing URLs updated for Astro 5: glob loaders, new API, same resilient links. Sign in and comment: https://www.giorgiosaud.io/notebook/slfhln #Astro #Astro5OrBust`,
  },

  'selfhealing-urls-astro-vercel': {
    linkedinCopy: `Fellow devs — implementing self-healing URLs in Astro deployed on Vercel has silent failure modes that took me a while to find. Middleware routing order, Vercel output config, and the exact architecture that actually works — I document every gotcha. If you are doing this on Vercel, read this before you spend three hours debugging routing. Sign in and share your Vercel routing war stories.
Read more: https://www.giorgiosaud.io/notebook/slfhln

#Astro #Vercel #Routing #Middleware #WebDev #VercelGotchasAreReal #SelfHealingInProduction`,
    twitterCopy: `Fellow devs — self-healing URLs on Astro + Vercel: the gotchas that silently break things and the fix. Sign in and comment: https://www.giorgiosaud.io/notebook/slfhln #Astro #Vercel #VercelGotchasAreReal`,
  },

  'server-actions-astro-forms': {
    linkedinCopy: `Fellow devs — Astro's server actions are the cleanest way to handle form submissions I have found in any framework. Zod validation, type-safe errors, and bot protection all in one pattern. No separate API route, no client-side fetch, just progressive enhancement that works without JavaScript. Sign in and tell me what your current form handling setup looks like.
Read more: https://www.giorgiosaud.io/notebook/srvrct

#Astro #WebDev #Forms #Backend #Security #FormsAreHardActually #ZodToTheRescue #NoApiRouteNeeded`,
    twitterCopy: `Fellow devs — Astro server actions: forms with Zod validation, type-safe errors, and bot protection. No API route needed. Sign in and comment: https://www.giorgiosaud.io/notebook/srvrct #Astro #ZodToTheRescue`,
  },

  'sharing-state-nanostores': {
    linkedinCopy: `Fellow devs — sharing state between React, Vue, and Svelte components in the same Astro project should not require a global state management library. Nanostores is tiny, framework-agnostic, and gets out of your way. I show the exact pattern for reactive shared state across the island boundaries in Astro. Sign in and tell me how you are handling cross-framework state.
Read more: https://www.giorgiosaud.io/notebook/shrngs

#Astro #React #Vue #Svelte #StateManagement #WebDev #NanoButMighty #IslandsNeedFriends`,
    twitterCopy: `Fellow devs — sharing state between React, Vue, and Svelte in Astro with Nanostores. Tiny library, big clarity. Sign in and comment: https://www.giorgiosaud.io/notebook/shrngs #Astro #NanoButMighty`,
  },

  'simplified-explanation-of-the-singleton-design-pattern': {
    linkedinCopy: `Fellow devs — the Singleton pattern gets used without thinking and misunderstood more often than not. I wrote the simplified explanation I wish I had when I first encountered it: what it actually does, when it genuinely makes sense for configuration and state management, and when you should reach for something else. Sign in and tell me your honest take on Singletons.
Read more: https://www.giorgiosaud.io/notebook/000011

#DesignPatterns #Architecture #WebDev #Development #SingletonNotASocialState #PatternOrAntiPattern #OnlyOneInstance`,
    twitterCopy: `Fellow devs — the Singleton pattern: simplified, honest, and when to actually use it. Sign in and comment: https://www.giorgiosaud.io/notebook/000011 #DesignPatterns #OnlyOneInstance`,
  },

  'summary-api': {
    linkedinCopy: `Fellow devs — browser-native AI summarization is no longer a proposal, it is shipping. The Summary API lets browsers generate AI-powered summaries of web content without any external service. I introduce the API, show what it can do today, and where it is heading. Sign in and share how you are thinking about integrating browser AI into your apps.
Read more: https://www.giorgiosaud.io/notebook/SMMPPN

#AI #FrontEnd #WebDev #BrowserAPI #Evolution #SummarizeAllTheThings #BrowserAIHasArrived`,
    twitterCopy: `Fellow devs — browser-native AI summarization is shipping. The Summary API is here and worth your attention. Sign in and comment: https://www.giorgiosaud.io/notebook/SMMPPN #AI #SummarizeAllTheThings`,
  },

  'tag-link': {
    linkedinCopy: `Fellow devs — the link tag in the HTML head is one of the most underused performance tools available. Preload, prefetch, preconnect, and modulepreload done right can meaningfully improve your Core Web Vitals. I cover the right tag for the right use case and the common mistakes that hurt instead of help. Sign in and share which link tag recommendations have made the biggest difference for you.
Read more: https://www.giorgiosaud.io/notebook/000004

#WebDev #FrontEnd #Performance #SEO #CoreWebVitals #LinkTagNotThatLink #PreloadOrDieSlowly`,
    twitterCopy: `Fellow devs — link tags done right: preload, prefetch, preconnect. The ones that help vs the ones that hurt. Sign in and comment: https://www.giorgiosaud.io/notebook/000004 #WebDev #PreloadOrDieSlowly`,
  },

  'the-planned-city-of-the-future': {
    linkedinCopy: `Fellow devs and digital architects — Puerto Ordaz as a beta test for Venezuela's recovery: digital identity, transparent infrastructure, and smart contracts as the operating system for an industrial city. This is the most ambitious system design I have ever written about and I think the framework applies beyond Venezuela. Sign in and tell me how you think about digital infrastructure at city scale.
Read more: https://www.giorgiosaud.io/notebook/000009

#Venezuela #SmartCity #DigitalTransformation #Architecture #Strategy #PuertoOrdazAlpha #DigitalCityOrBust`,
    twitterCopy: `Fellow devs — Puerto Ordaz as a beta test for Venezuela's digital recovery. Digital identity, smart contracts, city-scale architecture. Sign in and comment: https://www.giorgiosaud.io/notebook/000009 #Venezuela #PuertoOrdazAlpha`,
  },

  'type-safe-i18n-typescript': {
    linkedinCopy: `Fellow devs — TypeScript autocomplete for every nested key in your translation files is not a nice-to-have, it is a typo-catching superpower. I built a recursive deep key extraction type that gives you full type safety for i18n without any code generation step. The TypeScript is a little gnarly but I explain every part. Sign in and share how you are handling i18n type safety in your projects.
Read more: https://www.giorgiosaud.io/notebook/typsf1

#TypeScript #i18n #FrontEnd #WebDev #TypeSafety #AutocompleteOrAnarchy #RecursiveTypesAreNotScary`,
    twitterCopy: `Fellow devs — type-safe i18n in TypeScript with full autocomplete for nested translation keys. No codegen. Sign in and comment: https://www.giorgiosaud.io/notebook/typsf1 #TypeScript #AutocompleteOrAnarchy`,
  },

  'upgrading-astro-6-svelte-5-dependency-conflicts': {
    linkedinCopy: `Fellow devs — upgrading a production Astro site to Astro 6, Svelte 5, and Better Auth 1.6 at the same time turned into a dependency conflict archaeology project. TypeScript preprocessing failures, transitive dependency hell, and a Vercel build cache that made everything worse. I documented everything that broke and exactly how I fixed it. Sign in and share your most chaotic upgrade story.
Read more: https://www.giorgiosaud.io/notebook/pgrdng

#Astro #Svelte #WebDev #Dependencies #DependencyHell #UpgradeOrDieTrying #SemVerIsALie`,
    twitterCopy: `Fellow devs — upgrading Astro 6 + Svelte 5 + Better Auth 1.6 in production. Everything that broke and how I fixed it. Sign in and comment: https://www.giorgiosaud.io/notebook/pgrdng #Astro #UpgradeOrDieTrying`,
  },

  'venezuela-as-a-platform': {
    linkedinCopy: `Fellow devs with a global perspective — I applied platform thinking to Venezuela's repositioning for global investment. What are the technical and industrial priorities that matter most? How do you architect a country for the next cycle? This is the kind of problem I find as interesting as any software system. Sign in and share how you think about technology and national scale.
Read more: https://www.giorgiosaud.io/notebook/VPRNFG

#Venezuela #Architecture #DigitalTransformation #Investment #Strategy #VenezuelaAsAStartup #NationScaleThinking`,
    twitterCopy: `Fellow devs — Venezuela as a platform: a solution architect's take on the technical priorities for global repositioning. Sign in and comment: https://www.giorgiosaud.io/notebook/VPRNFG #Venezuela #NationScaleThinking`,
  },

  'view-transitions-api': {
    linkedinCopy: `Fellow devs — smooth page transitions with a single CSS rule felt impossible until the View Transitions API shipped. No JavaScript animation library, no SPA overhead, just native browser transitions between pages. I show how to customize animations for specific elements and create SPA-like experiences that actually respect progressive enhancement. Sign in and tell me if you have shipped view transitions in production.
Read more: https://www.giorgiosaud.io/notebook/vwtrns

#CSS #WebDev #FrontEnd #Animation #ViewTransitions #SpaVibesWithoutTheSpa #TransitionsForFree`,
    twitterCopy: `Fellow devs — smooth page transitions with one CSS rule. The View Transitions API is better than it looks. Sign in and comment: https://www.giorgiosaud.io/notebook/vwtrns #CSS #TransitionsForFree`,
  },

  'web-push-notifications-astro-vercel': {
    linkedinCopy: `Fellow devs — web push notifications sound straightforward until you are debugging VAPID keys, service worker scope issues, and Vercel serverless function cold starts at the same time. I implemented the full stack in Astro on Vercel and documented every failure mode. If you are building push notifications and want to skip the painful parts, this is your guide. Sign in and tell me what push notification bug haunts you most.
Read more: https://www.giorgiosaud.io/notebook/wbpshn

#Astro #Vercel #WebPush #ServiceWorker #FrontEnd #Backend #PushOrBeIgnored #VAPIDKeysAreNotEasyOkay`,
    twitterCopy: `Fellow devs — web push notifications in Astro + Vercel: VAPID keys, service workers, and everything that can go wrong. Sign in and comment: https://www.giorgiosaud.io/notebook/wbpshn #Astro #VAPIDKeysAreNotEasyOkay`,
  },
}

function insertSocialCopy(content: string, linkedinCopy: string, twitterCopy: string): string {
  // Find the closing --- of frontmatter
  const fmEnd = content.indexOf('\n---', 4)
  if (fmEnd === -1) return content

  // Skip if already has the fields
  if (content.includes('linkedinCopy:') || content.includes('twitterCopy:')) return content

  const formatBlock = (text: string, field: string): string => {
    const indented = text.split('\n').map(l => `  ${l}`).join('\n')
    return `${field}: |\n${indented}`
  }

  const insertion = `\n${formatBlock(linkedinCopy, 'linkedinCopy')}\n${formatBlock(twitterCopy, 'twitterCopy')}`
  return content.slice(0, fmEnd) + insertion + content.slice(fmEnd)
}

const files = Bun.spawnSync(['find', NOTES_DIR, '-name', '*.md', '-o', '-name', '*.mdx'], {
  stdout: 'pipe',
}).stdout.toString().trim().split('\n').filter(Boolean)

let ok = 0, skipped = 0, missing = 0

for (const file of files) {
  const basename = file.split('/').pop()!.replace(/\.mdx?$/, '')
  const copy = copies[basename]

  if (!copy) {
    console.log(`[skip] no copy entry for: ${basename}`)
    missing++
    continue
  }

  const content = readFileSync(file, 'utf-8')

  if (content.includes('linkedinCopy:') || content.includes('twitterCopy:')) {
    console.log(`[skip] already has social copy: ${basename}`)
    skipped++
    continue
  }

  const updated = insertSocialCopy(content, copy.linkedinCopy, copy.twitterCopy)
  writeFileSync(file, updated, 'utf-8')
  console.log(`[ok]   ${basename}`)
  ok++
}

console.log(`\nDone. ok=${ok} skipped=${skipped} missing=${missing}`)
