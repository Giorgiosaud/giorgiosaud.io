import { F as Fragment, _ as __astro_tag_component__, l as createVNode } from './astro/server_ICIjUNoW.mjs';
import { $ as $$Image } from './_astro_assets_39s0VT-X.mjs';
/* empty css                                                              */
import { ref, onMounted, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
/* empty css                                                             */
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';

/** @returns {void} */

function run(fn) {
	return fn();
}

function blank_object() {
	return Object.create(null);
}

/**
 * @param {Function[]} fns
 * @returns {void}
 */
function run_all(fns) {
	fns.forEach(run);
}

let current_component;

/** @returns {void} */
function set_current_component(component) {
	current_component = component;
}

const ATTR_REGEX = /[&"<]/g;
const CONTENT_REGEX = /[&<]/g;

/**
 * Note: this method is performance sensitive and has been optimized
 * https://github.com/sveltejs/svelte/pull/5701
 * @param {unknown} value
 * @returns {string}
 */
function escape(value, is_attr = false) {
	const str = String(value);
	const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
	pattern.lastIndex = 0;
	let escaped = '';
	let last = 0;
	while (pattern.test(str)) {
		const i = pattern.lastIndex - 1;
		const ch = str[i];
		escaped += str.substring(last, i) + (ch === '&' ? '&amp;' : ch === '"' ? '&quot;' : '&lt;');
		last = i + 1;
	}
	return escaped + str.substring(last);
}

let on_destroy;

/** @returns {{ render: (props?: {}, { $$slots, context }?: { $$slots?: {}; context?: Map<any, any>; }) => { html: any; css: { code: string; map: any; }; head: string; }; $$render: (result: any, props: any, bindings: any, slots: any, context: any) => any; }} */
function create_ssr_component(fn) {
	function $$render(result, props, bindings, slots, context) {
		const parent_component = current_component;
		const $$ = {
			on_destroy,
			context: new Map(context || (parent_component ? parent_component.$$.context : [])),
			// these will be immediately discarded
			on_mount: [],
			before_update: [],
			after_update: [],
			callbacks: blank_object()
		};
		set_current_component({ $$ });
		const html = fn(result, props, bindings, slots);
		set_current_component(parent_component);
		return html;
	}
	return {
		render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
			on_destroy = [];
			const result = { title: '', head: '', css: new Set() };
			const html = $$render(result, props, {}, $$slots, context);
			run_all(on_destroy);
			return {
				html,
				css: {
					code: Array.from(result.css)
						.map((css) => css.code)
						.join('\n'),
					map: null // TODO
				},
				head: result.title + result.head
			};
		},
		$$render
	};
}

/* src/components/svelte/buttonSvelte.svelte generated by Svelte v4.2.19 */

const css = {
	code: "h3.svelte-1m34aew,button.svelte-1m34aew{font-family:Verdana, Arial, sans-serif}",
	map: "{\"version\":3,\"file\":\"buttonSvelte.svelte\",\"sources\":[\"buttonSvelte.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { onMount } from 'svelte';\\n\\n\\tlet count = 0\\n\\t\\n\\tconst incrementCount = () => {\\n\\t\\tcount++\\n\\t}\\n\\tonMount(async () => {\\n\\t\\tsetTimeout(incrementCount,1000)\\n\\t});\\n</script>\\n\\n<style>\\n\\th3, button {\\n\\t\\tfont-family: Verdana, Arial, sans-serif;\\n\\t}\\n</style>\\n<div class=\\\"border-pink-400 border-solid border-2 p-1 m-3\\\">\\n<h3>\\n\\tSvelte Button was clicked {count} {count === 1 ? 'time' : 'times'}\\n</h3>\\n\\n<button on:click|preventDefault={incrementCount} class=\\\"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded\\\">\\n\\tIncrement count Svelte\\n</button>\\n</div>\"],\"names\":[],\"mappings\":\"AAcC,iBAAE,CAAE,qBAAO,CACV,WAAW,CAAE,OAAO,CAAC,CAAC,KAAK,CAAC,CAAC,UAC9B\"}"
};

const ButtonSvelte = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let count = 0;

	$$result.css.add(css);
	return `<div class="border-pink-400 border-solid border-2 p-1 m-3"><h3 class="svelte-1m34aew">Svelte Button was clicked ${escape(count)} ${escape('times')}</h3> <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded svelte-1m34aew" data-svelte-h="svelte-d0692i">Increment count Svelte</button></div>`;
});

const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

const _sfc_main = {
  __name: 'buttonVue',
  setup(__props, { expose: __expose }) {
  __expose();

const count = ref(0);
onMounted(async () => {
  setTimeout(() => count.value++, 1000);
});

const __returned__ = { count, ref, onMounted };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${
    ssrRenderAttrs(mergeProps({ class: "border-green-400 border-solid border-2 p-1 m-3" }, _attrs))
  }><h3> Vue Button was clicked ${
    ssrInterpolate($setup.count)
  } ${
    ssrInterpolate($setup.count === 1 ? "time" : "times")
  }</h3><button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"> Increment Count Vue </button></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext()
  ;(ssrContext.modules || (ssrContext.modules = new Set())).add("src/components/vue/buttonVue.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : undefined
};
const ButtonVue = /*#__PURE__*/_export_sfc(_sfc_main, [['ssrRender',_sfc_ssrRender]]);

function MyApp({ title = "Increment Count React." }) {
  const [count, setCount] = useState(0);
  const handleClick = () => setCount((count2) => count2 + 1);
  useEffect(() => {
    setTimeout(() => setCount((count2) => count2 + 1), 1e3);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "border-blue-400 border-solid border-2 p-1 m-3", children: [
    /* @__PURE__ */ jsxs("h3", { children: [
      "React Button was clicked ",
      count,
      " ",
      count === 1 ? "time" : "times"
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",
        onClick: handleClick,
        children: title
      }
    )
  ] });
}

const frontmatter = {
  "draft": false,
  "selfHealing": "000010",
  "title": "MDX File in astro as content vs md file",
  "resume": "As I can show you in astro we can have at least 2 ways of make content .md files and .mdx files. The difference between them is that .mdx files can have JSX code and .md files can't.",
  "image": {
    "src": "md_engine",
    "alt": "This is a MDX engine."
  },
  "publishDate": "2024-07-01 16:22",
  "category": "astro",
  "author": "jorge-saud",
  "tags": ["microfrontend", "architecture"]
};
function getHeadings() {
  return [{
    "depth": 1,
    "slug": "title",
    "text": "title"
  }, {
    "depth": 2,
    "slug": "here-is-svelte",
    "text": "Here is Svelte"
  }, {
    "depth": 2,
    "slug": "here-is-react",
    "text": "Here is React"
  }, {
    "depth": 2,
    "slug": "here-is-vue",
    "text": "Here is Vue"
  }];
}
const draft = false;
const title = "MDX File in astro as content vs md file";
const resume = "This is a MDX file";
const image = {
  src: "md_engine",
  alt: "Markdown content in astro"
};
const publishDate = "2023-05-08 11:39";
const category = "architecture";
const author = "Giorgio Saud";
const tags = ["micro-frontend", "architecture"];
const __usesAstroImage = true;
function _createMdxContent(props) {
  const _components = {
    blockquote: "blockquote",
    code: "code",
    h1: "h1",
    h2: "h2",
    p: "p",
    pre: "pre",
    span: "span",
    ...props.components
  };
  return createVNode(Fragment, {
    children: [createVNode(_components.h1, {
      id: "title",
      children: title
    }), "\n", createVNode(_components.p, {
      children: "As I can show you in astro we can have at least 2 ways of make content .md files and .mdx files. The difference between them is that .mdx files can have JSX code and .md files can’t."
    }), "\n", createVNode(_components.p, {
      children: "Like this example in Astro, we can use components from different frameworks in the same page, using Dynamic Island Feature, here is an example:"
    }), "\n", createVNode(_components.h2, {
      id: "here-is-svelte",
      children: "Here is Svelte"
    }), "\n", createVNode(_components.p, {
      children: "A Server side rendered component loaded in client side"
    }), "\n", createVNode(ButtonSvelte, {
      "client:load": true,
      "client:component-path": "@components/svelte/buttonSvelte.svelte",
      "client:component-export": "default",
      "client:component-hydration": true
    }), "\n", createVNode(_components.h2, {
      id: "here-is-react",
      children: "Here is React"
    }), "\n", createVNode(_components.p, {
      children: "A Server side rendered component loaded in when client is idle"
    }), "\n", createVNode(MyApp, {
      "client:idle": true,
      title: "Increment Count React",
      "client:component-path": "@components/react/buttonReact",
      "client:component-export": "default",
      "client:component-hydration": true
    }), "\n", createVNode("div", {
      class: "h-screen"
    }), "\n", createVNode(_components.h2, {
      id: "here-is-vue",
      children: "Here is Vue"
    }), "\n", createVNode(_components.p, {
      children: "A server side redered but component loaded reactivity in when is visible"
    }), "\n", createVNode(ButtonVue, {
      "client:visible": true,
      "client:component-path": "@components/vue/buttonVue.vue",
      "client:component-export": "default",
      "client:component-hydration": true
    }), "\n", createVNode(_components.p, {
      children: "In a md file we cant do this because is more for static content and we can’t use JSX code in it."
    }), "\n", createVNode(_components.p, {
      children: "Even when .md is a great tool because is like create html without complexity mdx is great because mix all in one file only separating a paragraph with a JSX component."
    }), "\n", createVNode(_components.p, {
      children: "Allowing to import components and everithing that you need even using all the md power."
    }), "\n", createVNode(_components.pre, {
      class: "astro-code vitesse-dark",
      style: {
        backgroundColor: "#121212",
        color: "#dbd7caee",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "md",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#666666",
              fontWeight: "bold"
            },
            children: "#"
          }), createVNode(_components.span, {
            style: {
              color: "#4D9375",
              fontWeight: "bold"
            },
            children: " hola mundo en h1"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#666666",
              fontWeight: "bold"
            },
            children: "##"
          }), createVNode(_components.span, {
            style: {
              color: "#4D9375",
              fontWeight: "bold"
            },
            children: " hola mundo en h2"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#DBD7CAEE"
            },
            children: "este es un parrafo"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#666666"
            },
            children: ">"
          }), createVNode(_components.span, {
            style: {
              color: "#5D99A9"
            },
            children: " Blockquote text"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line"
        })]
      })
    }), "\n", createVNode(_components.pre, {
      class: "astro-code vitesse-dark",
      style: {
        backgroundColor: "#121212",
        color: "#dbd7caee",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word"
      },
      tabindex: "0",
      "data-language": "mdx",
      children: createVNode(_components.code, {
        children: [createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#DBD7CAEE"
            },
            children: "import Component from \"component\";"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#666666",
              fontWeight: "bold"
            },
            children: "#"
          }), createVNode(_components.span, {
            style: {
              color: "#4D9375",
              fontWeight: "bold"
            },
            children: " hola mundo en h1"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#666666",
              fontWeight: "bold"
            },
            children: "##"
          }), createVNode(_components.span, {
            style: {
              color: "#4D9375",
              fontWeight: "bold"
            },
            children: " hola mundo en h2"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: createVNode(_components.span, {
            style: {
              color: "#DBD7CAEE"
            },
            children: "este es un parrafo"
          })
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#666666"
            },
            children: ">"
          }), createVNode(_components.span, {
            style: {
              color: "#5D99A9"
            },
            children: " Blockquote text"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line"
        }), "\n", createVNode(_components.span, {
          class: "line",
          children: [createVNode(_components.span, {
            style: {
              color: "#5D99A9"
            },
            children: "<Component /"
          }), createVNode(_components.span, {
            style: {
              color: "#666666"
            },
            children: ">"
          })]
        }), "\n", createVNode(_components.span, {
          class: "line"
        })]
      })
    }), "\n", createVNode(_components.blockquote, {
      children: ["\n", createVNode(_components.p, {
        children: "This is a MDX file 💌"
      }), "\n"]
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = props.components || ({});
  return MDXLayout ? createVNode(MDXLayout, {
    ...props,
    children: createVNode(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}

const url = "src/content/notes/mdx-file-in-astro-as-content-vs-md-file.mdx";
const file = "/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/mdx-file-in-astro-as-content-vs-md-file.mdx";
const Content = (props = {}) => MDXContent({
  ...props,
  components: { Fragment: Fragment, ...props.components, "astro-image":  props.components?.img ?? $$Image },
});
Content[Symbol.for('mdx-component')] = true;
Content[Symbol.for('astro.needsHeadRendering')] = !Boolean(frontmatter.layout);
Content.moduleId = "/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/mdx-file-in-astro-as-content-vs-md-file.mdx";
__astro_tag_component__(Content, 'astro:jsx');

export { Content, __usesAstroImage, author, category, Content as default, draft, file, frontmatter, getHeadings, image, publishDate, resume, tags, title, url };
