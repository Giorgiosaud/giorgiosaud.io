import { g as decodeKey } from './chunks/astro/server_ICIjUNoW.mjs';
import './chunks/astro-designed-error-pages_-1HvZkte.mjs';

/**
 * Tokenize input string.
 */
function lexer(str) {
    var tokens = [];
    var i = 0;
    while (i < str.length) {
        var char = str[i];
        if (char === "*" || char === "+" || char === "?") {
            tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
            continue;
        }
        if (char === "\\") {
            tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
            continue;
        }
        if (char === "{") {
            tokens.push({ type: "OPEN", index: i, value: str[i++] });
            continue;
        }
        if (char === "}") {
            tokens.push({ type: "CLOSE", index: i, value: str[i++] });
            continue;
        }
        if (char === ":") {
            var name = "";
            var j = i + 1;
            while (j < str.length) {
                var code = str.charCodeAt(j);
                if (
                // `0-9`
                (code >= 48 && code <= 57) ||
                    // `A-Z`
                    (code >= 65 && code <= 90) ||
                    // `a-z`
                    (code >= 97 && code <= 122) ||
                    // `_`
                    code === 95) {
                    name += str[j++];
                    continue;
                }
                break;
            }
            if (!name)
                throw new TypeError("Missing parameter name at ".concat(i));
            tokens.push({ type: "NAME", index: i, value: name });
            i = j;
            continue;
        }
        if (char === "(") {
            var count = 1;
            var pattern = "";
            var j = i + 1;
            if (str[j] === "?") {
                throw new TypeError("Pattern cannot start with \"?\" at ".concat(j));
            }
            while (j < str.length) {
                if (str[j] === "\\") {
                    pattern += str[j++] + str[j++];
                    continue;
                }
                if (str[j] === ")") {
                    count--;
                    if (count === 0) {
                        j++;
                        break;
                    }
                }
                else if (str[j] === "(") {
                    count++;
                    if (str[j + 1] !== "?") {
                        throw new TypeError("Capturing groups are not allowed at ".concat(j));
                    }
                }
                pattern += str[j++];
            }
            if (count)
                throw new TypeError("Unbalanced pattern at ".concat(i));
            if (!pattern)
                throw new TypeError("Missing pattern at ".concat(i));
            tokens.push({ type: "PATTERN", index: i, value: pattern });
            i = j;
            continue;
        }
        tokens.push({ type: "CHAR", index: i, value: str[i++] });
    }
    tokens.push({ type: "END", index: i, value: "" });
    return tokens;
}
/**
 * Parse a string for the raw tokens.
 */
function parse(str, options) {
    if (options === void 0) { options = {}; }
    var tokens = lexer(str);
    var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
    var defaultPattern = "[^".concat(escapeString(options.delimiter || "/#?"), "]+?");
    var result = [];
    var key = 0;
    var i = 0;
    var path = "";
    var tryConsume = function (type) {
        if (i < tokens.length && tokens[i].type === type)
            return tokens[i++].value;
    };
    var mustConsume = function (type) {
        var value = tryConsume(type);
        if (value !== undefined)
            return value;
        var _a = tokens[i], nextType = _a.type, index = _a.index;
        throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
    };
    var consumeText = function () {
        var result = "";
        var value;
        while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
            result += value;
        }
        return result;
    };
    while (i < tokens.length) {
        var char = tryConsume("CHAR");
        var name = tryConsume("NAME");
        var pattern = tryConsume("PATTERN");
        if (name || pattern) {
            var prefix = char || "";
            if (prefixes.indexOf(prefix) === -1) {
                path += prefix;
                prefix = "";
            }
            if (path) {
                result.push(path);
                path = "";
            }
            result.push({
                name: name || key++,
                prefix: prefix,
                suffix: "",
                pattern: pattern || defaultPattern,
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        var value = char || tryConsume("ESCAPED_CHAR");
        if (value) {
            path += value;
            continue;
        }
        if (path) {
            result.push(path);
            path = "";
        }
        var open = tryConsume("OPEN");
        if (open) {
            var prefix = consumeText();
            var name_1 = tryConsume("NAME") || "";
            var pattern_1 = tryConsume("PATTERN") || "";
            var suffix = consumeText();
            mustConsume("CLOSE");
            result.push({
                name: name_1 || (pattern_1 ? key++ : ""),
                pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
                prefix: prefix,
                suffix: suffix,
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        mustConsume("END");
    }
    return result;
}
/**
 * Compile a string to a template function for the path.
 */
function compile(str, options) {
    return tokensToFunction(parse(str, options), options);
}
/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction(tokens, options) {
    if (options === void 0) { options = {}; }
    var reFlags = flags(options);
    var _a = options.encode, encode = _a === void 0 ? function (x) { return x; } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
    // Compile all the tokens into regexps.
    var matches = tokens.map(function (token) {
        if (typeof token === "object") {
            return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
        }
    });
    return function (data) {
        var path = "";
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (typeof token === "string") {
                path += token;
                continue;
            }
            var value = data ? data[token.name] : undefined;
            var optional = token.modifier === "?" || token.modifier === "*";
            var repeat = token.modifier === "*" || token.modifier === "+";
            if (Array.isArray(value)) {
                if (!repeat) {
                    throw new TypeError("Expected \"".concat(token.name, "\" to not repeat, but got an array"));
                }
                if (value.length === 0) {
                    if (optional)
                        continue;
                    throw new TypeError("Expected \"".concat(token.name, "\" to not be empty"));
                }
                for (var j = 0; j < value.length; j++) {
                    var segment = encode(value[j], token);
                    if (validate && !matches[i].test(segment)) {
                        throw new TypeError("Expected all \"".concat(token.name, "\" to match \"").concat(token.pattern, "\", but got \"").concat(segment, "\""));
                    }
                    path += token.prefix + segment + token.suffix;
                }
                continue;
            }
            if (typeof value === "string" || typeof value === "number") {
                var segment = encode(String(value), token);
                if (validate && !matches[i].test(segment)) {
                    throw new TypeError("Expected \"".concat(token.name, "\" to match \"").concat(token.pattern, "\", but got \"").concat(segment, "\""));
                }
                path += token.prefix + segment + token.suffix;
                continue;
            }
            if (optional)
                continue;
            var typeOfMessage = repeat ? "an array" : "a string";
            throw new TypeError("Expected \"".concat(token.name, "\" to be ").concat(typeOfMessage));
        }
        return path;
    };
}
/**
 * Escape a regular expression string.
 */
function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
/**
 * Get the flags for a regexp from the options.
 */
function flags(options) {
    return options && options.sensitive ? "" : "i";
}

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    const path = toPath(sanitizedParams);
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware(_, next) {
      return next();
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/giorgiosaud/Projects/personal/giorgiosaud.io/","adapterName":"@astrojs/vercel/serverless","routes":[{"file":"404.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"contact/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/contact","isIndex":false,"type":"page","pattern":"^\\/contact\\/?$","segments":[[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contact.astro","pathname":"/contact","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"es/acerca-de-mi/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/es/acerca-de-mi","isIndex":false,"type":"page","pattern":"^\\/es\\/acerca-de-mi\\/?$","segments":[[{"content":"es","dynamic":false,"spread":false}],[{"content":"acerca-de-mi","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/es/acerca-de-mi.astro","pathname":"/es/acerca-de-mi","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"es/contactame/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/es/contactame","isIndex":false,"type":"page","pattern":"^\\/es\\/contactame\\/?$","segments":[[{"content":"es","dynamic":false,"spread":false}],[{"content":"contactame","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/es/contactame.astro","pathname":"/es/contactame","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"es/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/es","isIndex":true,"type":"page","pattern":"^\\/es\\/?$","segments":[[{"content":"es","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/es/index.astro","pathname":"/es","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"manifest.json","links":[],"scripts":[],"styles":[],"routeData":{"route":"/manifest.json","isIndex":false,"type":"endpoint","pattern":"^\\/manifest\\.json\\/?$","segments":[[{"content":"manifest.json","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/manifest.json.ts","pathname":"/manifest.json","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"pricing/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/pricing","isIndex":false,"type":"page","pattern":"^\\/pricing\\/?$","segments":[[{"content":"pricing","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/pricing.astro","pathname":"/pricing","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"robot.txt","links":[],"scripts":[],"styles":[],"routeData":{"route":"/robot.txt","isIndex":false,"type":"endpoint","pattern":"^\\/robot\\.txt\\/?$","segments":[[{"content":"robot.txt","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/robot.txt.ts","pathname":"/robot.txt","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"rss.xml","links":[],"scripts":[],"styles":[],"routeData":{"route":"/rss.xml","isIndex":false,"type":"endpoint","pattern":"^\\/rss\\.xml\\/?$","segments":[[{"content":"rss.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rss.xml.ts","pathname":"/rss.xml","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"team/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/team","isIndex":true,"type":"page","pattern":"^\\/team\\/?$","segments":[[{"content":"team","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/team/index.astro","pathname":"/team","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"stage":"head-inline","children":"if ('serviceWorker' in navigator) {\n  navigator.serviceWorker.register('/service-worker.js');\n}"},{"stage":"head-inline","children":"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };\n\t\tvar script = document.createElement('script');\n\t\tscript.defer = true;\n\t\tscript.src = '/_vercel/insights/script.js';\n\t\tvar head = document.querySelector('head');\n\t\thead.appendChild(script);\n\t"}],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/.pnpm/astro@4.15.4_@types+node@22.4.0_rollup@2.79.1_terser@5.31.6_typescript@5.6.2/node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"stage":"head-inline","children":"if ('serviceWorker' in navigator) {\n  navigator.serviceWorker.register('/service-worker.js');\n}"},{"stage":"head-inline","children":"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };\n\t\tvar script = document.createElement('script');\n\t\tscript.defer = true;\n\t\tscript.src = '/_vercel/insights/script.js';\n\t\tvar head = document.querySelector('head');\n\t\thead.appendChild(script);\n\t"}],"styles":[{"type":"external","src":"/_astro/about.B06uz7-b.css"}],"routeData":{"route":"/es/cuaderno/[redirect]","isIndex":false,"type":"page","pattern":"^\\/es\\/cuaderno\\/([^/]+?)\\/?$","segments":[[{"content":"es","dynamic":false,"spread":false}],[{"content":"cuaderno","dynamic":false,"spread":false}],[{"content":"redirect","dynamic":true,"spread":false}]],"params":["redirect"],"component":"src/pages/es/cuaderno/[redirect].astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"stage":"head-inline","children":"if ('serviceWorker' in navigator) {\n  navigator.serviceWorker.register('/service-worker.js');\n}"},{"stage":"head-inline","children":"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };\n\t\tvar script = document.createElement('script');\n\t\tscript.defer = true;\n\t\tscript.src = '/_vercel/insights/script.js';\n\t\tvar head = document.querySelector('head');\n\t\thead.appendChild(script);\n\t"}],"styles":[{"type":"external","src":"/_astro/about.B06uz7-b.css"}],"routeData":{"route":"/notebook/[redirect]","isIndex":false,"type":"page","pattern":"^\\/notebook\\/([^/]+?)\\/?$","segments":[[{"content":"notebook","dynamic":false,"spread":false}],[{"content":"redirect","dynamic":true,"spread":false}]],"params":["redirect"],"component":"src/pages/notebook/[redirect].astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"stage":"head-inline","children":"if ('serviceWorker' in navigator) {\n  navigator.serviceWorker.register('/service-worker.js');\n}"},{"stage":"head-inline","children":"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };\n\t\tvar script = document.createElement('script');\n\t\tscript.defer = true;\n\t\tscript.src = '/_vercel/insights/script.js';\n\t\tvar head = document.querySelector('head');\n\t\thead.appendChild(script);\n\t"}],"styles":[{"type":"external","src":"/_astro/about.B06uz7-b.css"}],"routeData":{"route":"/portfolio/[redirect]","isIndex":false,"type":"page","pattern":"^\\/portfolio\\/([^/]+?)\\/?$","segments":[[{"content":"portfolio","dynamic":false,"spread":false}],[{"content":"redirect","dynamic":true,"spread":false}]],"params":["redirect"],"component":"src/pages/portfolio/[redirect].astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"stage":"head-inline","children":"if ('serviceWorker' in navigator) {\n  navigator.serviceWorker.register('/service-worker.js');\n}"},{"stage":"head-inline","children":"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };\n\t\tvar script = document.createElement('script');\n\t\tscript.defer = true;\n\t\tscript.src = '/_vercel/insights/script.js';\n\t\tvar head = document.querySelector('head');\n\t\thead.appendChild(script);\n\t"}],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/arquitectura-de-micro-frontend","pattern":"^\\/arquitectura-de-micro-frontend\\/?$","segments":[[{"content":"arquitectura-de-micro-frontend","dynamic":false,"spread":false}]],"params":[],"component":"arquitectura-de-micro-frontend","pathname":"/arquitectura-de-micro-frontend","prerender":false,"redirect":{"status":302,"destination":"/notebook/microfrontend"},"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"stage":"head-inline","children":"if ('serviceWorker' in navigator) {\n  navigator.serviceWorker.register('/service-worker.js');\n}"},{"stage":"head-inline","children":"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };\n\t\tvar script = document.createElement('script');\n\t\tscript.defer = true;\n\t\tscript.src = '/_vercel/insights/script.js';\n\t\tvar head = document.querySelector('head');\n\t\thead.appendChild(script);\n\t"}],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/atributos-srcset-y-sizes-en-un-tag-de-imagen-img","pattern":"^\\/atributos-srcset-y-sizes-en-un-tag-de-imagen-img\\/?$","segments":[[{"content":"atributos-srcset-y-sizes-en-un-tag-de-imagen-img","dynamic":false,"spread":false}]],"params":[],"component":"/atributos-srcset-y-sizes-en-un-tag-de-imagen-img","pathname":"/atributos-srcset-y-sizes-en-un-tag-de-imagen-img","prerender":false,"redirect":{"status":302,"destination":"/notebook/tag-link"},"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"stage":"head-inline","children":"if ('serviceWorker' in navigator) {\n  navigator.serviceWorker.register('/service-worker.js');\n}"},{"stage":"head-inline","children":"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };\n\t\tvar script = document.createElement('script');\n\t\tscript.defer = true;\n\t\tscript.src = '/_vercel/insights/script.js';\n\t\tvar head = document.querySelector('head');\n\t\thead.appendChild(script);\n\t"}],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/problemas-comunes-de-integracion-front-end","pattern":"^\\/problemas-comunes-de-integracion-front-end\\/?$","segments":[[{"content":"problemas-comunes-de-integracion-front-end","dynamic":false,"spread":false}]],"params":[],"component":"/problemas-comunes-de-integracion-front-end","pathname":"/problemas-comunes-de-integracion-front-end","prerender":false,"redirect":{"status":302,"destination":"/notebook/really-common-issues-integrating-from-front-end"},"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"stage":"head-inline","children":"if ('serviceWorker' in navigator) {\n  navigator.serviceWorker.register('/service-worker.js');\n}"},{"stage":"head-inline","children":"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };\n\t\tvar script = document.createElement('script');\n\t\tscript.defer = true;\n\t\tscript.src = '/_vercel/insights/script.js';\n\t\tvar head = document.querySelector('head');\n\t\thead.appendChild(script);\n\t"}],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/tag/*","pattern":"^\\/tag\\/\\*\\/?$","segments":[[{"content":"tag","dynamic":false,"spread":false}],[{"content":"*","dynamic":false,"spread":false}]],"params":[],"component":"/tag/*","pathname":"/tag/*","prerender":false,"redirect":{"status":302,"destination":"/notebook"},"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"https://giorgiosaud.io","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/es/cuaderno/[slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/es/cuaderno/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/es/cuaderno/[...page]/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/es/cuaderno/[...page]/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/notebook/[slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/notebook/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/notebook/[...page]/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/notebook/[...page]/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/portfolio/[slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/portfolio/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/portfolio/[...page]/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/portfolio/[...page]/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/team/[slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/team/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/about.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/about@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/es/acerca-de-mi.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/es/acerca-de-mi@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/es/cuaderno/[redirect].astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/es/cuaderno/[redirect]@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/notebook/[redirect].astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/notebook/[redirect]@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/portfolio/[redirect].astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/portfolio/[redirect]@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/rss.xml.ts",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/rss.xml@_@ts",{"propagation":"in-tree","containsHead":false}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/404.astro",{"propagation":"none","containsHead":true}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/contact.astro",{"propagation":"none","containsHead":true}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/es/contactame.astro",{"propagation":"none","containsHead":true}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/es/index.astro",{"propagation":"none","containsHead":true}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/pages/pricing.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astro-page:src/pages/404@_@astro":"pages/404.astro.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/contact@_@astro":"pages/contact.astro.mjs","\u0000@astro-page:src/pages/es/acerca-de-mi@_@astro":"pages/es/acerca-de-mi.astro.mjs","\u0000@astro-page:src/pages/es/contactame@_@astro":"pages/es/contactame.astro.mjs","\u0000@astro-page:src/pages/es/cuaderno/[redirect]@_@astro":"pages/es/cuaderno/_redirect_.astro.mjs","\u0000@astro-page:src/pages/es/cuaderno/[slug]@_@astro":"pages/es/cuaderno/_slug_.astro.mjs","\u0000@astro-page:src/pages/es/cuaderno/[...page]/index@_@astro":"pages/es/cuaderno/_---page_.astro.mjs","\u0000@astro-page:src/pages/es/index@_@astro":"pages/es.astro.mjs","\u0000@astro-page:src/pages/manifest.json@_@ts":"pages/manifest.json.astro.mjs","\u0000@astro-page:src/pages/notebook/[redirect]@_@astro":"pages/notebook/_redirect_.astro.mjs","\u0000@astro-page:src/pages/notebook/[slug]@_@astro":"pages/notebook/_slug_.astro.mjs","\u0000@astro-page:src/pages/notebook/[...page]/index@_@astro":"pages/notebook/_---page_.astro.mjs","\u0000@astro-page:src/pages/portfolio/[redirect]@_@astro":"pages/portfolio/_redirect_.astro.mjs","\u0000@astro-page:src/pages/portfolio/[slug]@_@astro":"pages/portfolio/_slug_.astro.mjs","\u0000@astro-page:src/pages/portfolio/[...page]/index@_@astro":"pages/portfolio/_---page_.astro.mjs","\u0000@astro-page:src/pages/robot.txt@_@ts":"pages/robot.txt.astro.mjs","\u0000@astro-page:src/pages/rss.xml@_@ts":"pages/rss.xml.astro.mjs","\u0000@astro-page:src/pages/team/[slug]@_@astro":"pages/team/_slug_.astro.mjs","\u0000@astro-page:src/pages/team/index@_@astro":"pages/team.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-page:node_modules/.pnpm/astro@4.15.4_@types+node@22.4.0_rollup@2.79.1_terser@5.31.6_typescript@5.6.2/node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/pricing@_@astro":"pages/pricing.astro.mjs","\u0000@astro-renderers":"renderers.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/node_modules/.pnpm/astro@4.15.4_@types+node@22.4.0_rollup@2.79.1_terser@5.31.6_typescript@5.6.2/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/000013.md?astroContentCollectionEntry=true":"chunks/000013_DGlaLO_h.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/efficient-and-effective-use-of-the-img-tag-with-srcset-and-sizes-attributes.md?astroContentCollectionEntry=true":"chunks/efficient-and-effective-use-of-the-img-tag-with-srcset-and-sizes-attributes_DTXRpGPd.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/mdx-file-in-astro-as-content-vs-md-file.mdx?astroContentCollectionEntry=true":"chunks/mdx-file-in-astro-as-content-vs-md-file_CApw_Fwk.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/microfrontend-architecture-not-decoupled-resilient.md?astroContentCollectionEntry=true":"chunks/microfrontend-architecture-not-decoupled-resilient_CJoWIfBy.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/microfrontend.md?astroContentCollectionEntry=true":"chunks/microfrontend_C6Ac1r8p.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/microfrontends-is-not-decoupled-is-resilient.md?astroContentCollectionEntry=true":"chunks/microfrontends-is-not-decoupled-is-resilient_CfsdxH73.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/paginator-in-astro.md?astroContentCollectionEntry=true":"chunks/paginator-in-astro_Auxe-nw6.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/prefllight-request-and-cors.md?astroContentCollectionEntry=true":"chunks/prefllight-request-and-cors_jk5iwGLt.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/really-common-issues-integrating-from-front-end.md?astroContentCollectionEntry=true":"chunks/really-common-issues-integrating-from-front-end_DzViFKX5.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/repository-pattern-revisited.md?astroContentCollectionEntry=true":"chunks/repository-pattern-revisited_KTjPx0ZC.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/repository-pattern.md?astroContentCollectionEntry=true":"chunks/repository-pattern_gSJRvNZy.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/self-healing-url-in-astro.md?astroContentCollectionEntry=true":"chunks/self-healing-url-in-astro_C2hVgwaI.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/simplified-explanation-of-the-singleton-design-pattern.md?astroContentCollectionEntry=true":"chunks/simplified-explanation-of-the-singleton-design-pattern_ZOqD-87x.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/tag-link.md?astroContentCollectionEntry=true":"chunks/tag-link_BOXQNtzU.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/workbox-integration.md?astroContentCollectionEntry=true":"chunks/workbox-integration_Bpst20-o.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/portfolio/full-copec.md?astroContentCollectionEntry=true":"chunks/full-copec_Cc2SfB8Z.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/portfolio/fundacion-de-la-mujer.md?astroContentCollectionEntry=true":"chunks/fundacion-de-la-mujer_BCSz78wW.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/portfolio/larrainvial.md?astroContentCollectionEntry=true":"chunks/larrainvial_DOBcjGLr.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/team/jorge-saud.md?astroContentCollectionEntry=true":"chunks/jorge-saud_B43_c3DA.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/000013.md?astroPropagatedAssets":"chunks/000013_CuRcWH2K.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/efficient-and-effective-use-of-the-img-tag-with-srcset-and-sizes-attributes.md?astroPropagatedAssets":"chunks/efficient-and-effective-use-of-the-img-tag-with-srcset-and-sizes-attributes_BBhQzHO3.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/mdx-file-in-astro-as-content-vs-md-file.mdx?astroPropagatedAssets":"chunks/mdx-file-in-astro-as-content-vs-md-file_fToHwJ7u.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/microfrontend-architecture-not-decoupled-resilient.md?astroPropagatedAssets":"chunks/microfrontend-architecture-not-decoupled-resilient_DBw7i2iv.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/microfrontend.md?astroPropagatedAssets":"chunks/microfrontend_BEzm1iy-.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/microfrontends-is-not-decoupled-is-resilient.md?astroPropagatedAssets":"chunks/microfrontends-is-not-decoupled-is-resilient_ZX9aUMgA.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/paginator-in-astro.md?astroPropagatedAssets":"chunks/paginator-in-astro_BsNl4WBu.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/prefllight-request-and-cors.md?astroPropagatedAssets":"chunks/prefllight-request-and-cors_DBwM8wYe.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/really-common-issues-integrating-from-front-end.md?astroPropagatedAssets":"chunks/really-common-issues-integrating-from-front-end_BhIAPD7E.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/repository-pattern-revisited.md?astroPropagatedAssets":"chunks/repository-pattern-revisited_AYCn1ong.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/repository-pattern.md?astroPropagatedAssets":"chunks/repository-pattern_Cv0Rw-_i.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/self-healing-url-in-astro.md?astroPropagatedAssets":"chunks/self-healing-url-in-astro_BOVC0mcb.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/simplified-explanation-of-the-singleton-design-pattern.md?astroPropagatedAssets":"chunks/simplified-explanation-of-the-singleton-design-pattern_jeU_KR1m.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/tag-link.md?astroPropagatedAssets":"chunks/tag-link_CMb-5iYK.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/workbox-integration.md?astroPropagatedAssets":"chunks/workbox-integration_DZPplgGi.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/portfolio/full-copec.md?astroPropagatedAssets":"chunks/full-copec_MHXrBnpE.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/portfolio/fundacion-de-la-mujer.md?astroPropagatedAssets":"chunks/fundacion-de-la-mujer_DD2LOc4m.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/portfolio/larrainvial.md?astroPropagatedAssets":"chunks/larrainvial_BMoGCHTa.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/team/jorge-saud.md?astroPropagatedAssets":"chunks/jorge-saud_1WQkaUrh.mjs","\u0000astro:asset-imports":"chunks/_astro_asset-imports_D9aVaOQr.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_BcEe_9wP.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/000013.md":"chunks/000013_BjXpFzwP.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/efficient-and-effective-use-of-the-img-tag-with-srcset-and-sizes-attributes.md":"chunks/efficient-and-effective-use-of-the-img-tag-with-srcset-and-sizes-attributes_C0eabdlH.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/microfrontend-architecture-not-decoupled-resilient.md":"chunks/microfrontend-architecture-not-decoupled-resilient_cai5N8nR.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/microfrontend.md":"chunks/microfrontend_C9lx2XwO.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/microfrontends-is-not-decoupled-is-resilient.md":"chunks/microfrontends-is-not-decoupled-is-resilient_DfKf426l.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/paginator-in-astro.md":"chunks/paginator-in-astro_BiZIS0eI.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/prefllight-request-and-cors.md":"chunks/prefllight-request-and-cors_CK2DS7Kz.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/really-common-issues-integrating-from-front-end.md":"chunks/really-common-issues-integrating-from-front-end_DIiXzupz.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/repository-pattern-revisited.md":"chunks/repository-pattern-revisited_BcLHKaKI.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/repository-pattern.md":"chunks/repository-pattern_sDwQfRwP.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/self-healing-url-in-astro.md":"chunks/self-healing-url-in-astro_BRXDug4q.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/simplified-explanation-of-the-singleton-design-pattern.md":"chunks/simplified-explanation-of-the-singleton-design-pattern_CNa5Emrh.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/tag-link.md":"chunks/tag-link_BPrHDUmf.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/workbox-integration.md":"chunks/workbox-integration_CdgXXUDJ.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/portfolio/full-copec.md":"chunks/full-copec_BVjaV7LT.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/portfolio/fundacion-de-la-mujer.md":"chunks/fundacion-de-la-mujer_D_JE670M.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/portfolio/larrainvial.md":"chunks/larrainvial_C-k365JI.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/team/jorge-saud.md":"chunks/jorge-saud_D5UpZc92.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/node_modules/.pnpm/@astrojs+react@3.6.2_@types+react-dom@18.3.0_@types+react@18.3.6_react-dom@18.3.1_react@18.3._va7asj2lww6akuuoy6jzcbpjgm/node_modules/@astrojs/react/vnode-children.js":"chunks/vnode-children_C1YIWAGb.mjs","\u0000@astrojs-manifest":"manifest_CuyN0Jj5.mjs","/Users/giorgiosaud/Projects/personal/giorgiosaud.io/src/content/notes/mdx-file-in-astro-as-content-vs-md-file.mdx":"chunks/mdx-file-in-astro-as-content-vs-md-file_DUGyX4f7.mjs","/astro/hoisted.js?q=3":"_astro/hoisted.DGEl8VfG.js","/astro/hoisted.js?q=1":"_astro/hoisted.D5yi81l-.js","/astro/hoisted.js?q=0":"_astro/hoisted.BRub0mnn.js","/astro/hoisted.js?q=2":"_astro/hoisted._jMj994K.js","@astrojs/svelte/client.js":"_astro/client.Cx1FBVJX.js","@components/vue/buttonVue.vue":"_astro/buttonVue.Bdvtv1oh.js","@components/react/buttonReact":"_astro/buttonReact.GJSRk6Fo.js","/astro/hoisted.js?q=4":"_astro/hoisted.B_st5uWx.js","@components/svelte/buttonSvelte.svelte":"_astro/buttonSvelte.DCw3AWYn.js","@astrojs/vue/client.js":"_astro/client.BPutk8UT.js","@astrojs/react/client.js":"_astro/client.BIGLHmRd.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/inter-greek-wght-normal.CaVNZxsx.woff2","/_astro/inter-greek-ext-wght-normal.CGAr0uHJ.woff2","/_astro/inter-cyrillic-ext-wght-normal.B2xhLi22.woff2","/_astro/inter-cyrillic-wght-normal.CMZtQduZ.woff2","/_astro/inter-latin-wght-normal.C2S99t-D.woff2","/_astro/inter-latin-ext-wght-normal.CFHvXkgd.woff2","/_astro/inter-vietnamese-wght-normal.CBcvBZtf.woff2","/_astro/about.B06uz7-b.css","/Innovation-amico.png","/android-icon-144x144.png","/android-icon-192x192.png","/android-icon-36x36.png","/android-icon-48x48.png","/android-icon-72x72.png","/android-icon-96x96.png","/apple-icon-114x114.png","/apple-icon-120x120.png","/apple-icon-144x144.png","/apple-icon-152x152.png","/apple-icon-180x180.png","/apple-icon-57x57.png","/apple-icon-60x60.png","/apple-icon-72x72.png","/apple-icon-76x76.png","/apple-icon-precomposed.png","/apple-icon.png","/browserconfig.xml","/favicon-16x16.png","/favicon-32x32.png","/favicon-96x96.png","/favicon.ico","/favicon.png","/favicon.svg","/ms-icon-144x144.png","/ms-icon-150x150.png","/ms-icon-310x310.png","/ms-icon-70x70.png","/robots.txt","/_astro/buttonReact.GJSRk6Fo.js","/_astro/buttonSvelte.DCw3AWYn.js","/_astro/buttonSvelte_svelte_svelte_type_style_lang.BxMhsgL9.css","/_astro/buttonVue.Bdvtv1oh.js","/_astro/buttonVue_vue_vue_type_style_index_0_lang.Cfi3dTHE.css","/_astro/client.BIGLHmRd.js","/_astro/client.BPutk8UT.js","/_astro/client.Cx1FBVJX.js","/_astro/hoisted.BRub0mnn.js","/_astro/hoisted.B_st5uWx.js","/_astro/hoisted.D5yi81l-.js","/_astro/hoisted.DGEl8VfG.js","/_astro/hoisted._jMj994K.js","/_astro/index.DhYZZe0J.js","/_astro/runtime-core.esm-bundler.DWCCFpFs.js","/404.html","/about/index.html","/contact/index.html","/es/acerca-de-mi/index.html","/es/contactame/index.html","/es/index.html","/manifest.json","/pricing/index.html","/robot.txt","/rss.xml","/team/index.html","/index.html"],"i18n":{"fallbackType":"redirect","strategy":"pathname-prefix-other-locales","locales":["en","es"],"defaultLocale":"en","domainLookupTable":{}},"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"TahH9cd0xQK9RvcJEXN4j41rz1PPR99kcibNwpwYSrI=","experimentalEnvGetSecretEnabled":false});

export { manifest };
