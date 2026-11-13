---
draft: false
title: "Una interfaz WebMCP para mi cuaderno: dos herramientas de solo lectura para agentes del navegador"
description: "WebMCP le permite a una página darles a los agentes de IA herramientas reales en vez de obligarlos a raspar el DOM. Así está la API a fines de 2026, así expuse búsqueda y lectura en Markdown en este cuaderno en menos de 300 líneas, y esto es lo que todavía no he verificado."
publishDate: 2026-11-13
cover: ../../../assets/images/llms-txt-implementation.png
coverAlt: Una ventana de navegador que le expone íconos de herramientas a un agente de IA en lugar del markup crudo de la página
selfHealing: wbmcpn
lang: es
category: Development
author: giorgio-saud
collections:
  - ai
  - frontend
tags:
  - webmcp
  - ai
  - agentes
  - astro
  - "2026"
---

Ver a un agente de navegador usar un sitio web hoy es un poco doloroso. Toma un screenshot, lee el árbol de accesibilidad, adivina cuál input es el buscador, escribe, espera, toma otro screenshot y cruza los dedos para que los resultados que está viendo sean los que pidió.

Este cuaderno ya tiene una API de búsqueda. Ya sirve cada nota como Markdown limpio (así es como [funciona llms.txt aquí](https://www.giorgiosaud.io/es/cuaderno/llms-txt-implementation-llmstx)). Un agente no debería tener que *inferir* nada de eso a partir de píxeles.

Esa es la promesa de **WebMCP**: la página le dice al agente, en código, "estas son las cosas que puedes hacer, este es el schema de cada una, llámalas". Agregué dos de esas herramientas a este sitio. Este post cubre en qué estado está la API, el código y, con honestidad, qué pude probar y qué no.

## Qué es WebMCP (y qué no es)

WebMCP es una API de navegador propuesta, incubada en el Web Machine Learning Community Group del W3C. Una página registra **tools**: un nombre, una descripción, un JSON Schema para el input y una función de JavaScript. Un agente que corre en el navegador puede descubrirlas y llamarlas.

Toma el vocabulario de MCP, pero no es un servidor MCP. No hay transporte, ni proceso aparte, ni endpoint que hospedar. Las tools corren como JavaScript *dentro de la página*, con la sesión del usuario y el origen de la página. Se le podría llamar un servidor MCP del lado del cliente, y la spec lo llama así.

### En qué estado está (noviembre de 2026)

Esto se mueve rápido, y la mayoría de los tutoriales de principios de año ya están desactualizados:

- **Estado:** un Draft Community Group Report. No es un estándar del W3C y todavía no está en el standards track.
- **Chrome:** el origin trial empezó en Chrome 149. Para probar en local, activa `chrome://flags/#enable-webmcp-testing`. Edge lo tiene detrás de un flag. Firefox y Safari participan en la discusión, pero no se han comprometido a implementarlo.
- **El punto de entrada se movió.** La primera implementación usaba `navigator.modelContext`. El draft de julio de 2026 lo movió a **`document.modelContext`**, y Chrome 150 deprecó la ubicación anterior, aunque sigue sirviendo ambas durante el trial.
- **Se eliminaron métodos.** `provideContext()` y `clearContext()` salieron en marzo. No existe `unregisterTool()`: pasas un `AbortSignal` al registrar y lo abortas para quitar la tool.
- **Consumidores:** por lo que pude encontrar, todavía ningún agente mainstream llama tools de WebMCP en producción. Google dijo que Gemini en Chrome será el primero. Eso es un anuncio, no un lanzamiento.

¿Entonces por qué construirlo ahora?

## Por qué lo implementé igual

Porque no costó casi nada. Ambas tools son wrappers delgados sobre URLs que el sitio ya servía:

| Tool | Qué llama | Ya existía para |
|---|---|---|
| `search_notes` | `/api/notes/search.json` | La página de búsqueda del cuaderno |
| `read_note` | `/es/cuaderno/<slug>.md` | `llms.txt` y el link alternativo `text/markdown` |

Sin endpoints nuevos, sin datos nuevos, sin auth nueva. Los navegadores sin WebMCP se lo saltan con un solo `if`. Y como las tools llaman a los mismos endpoints que usa la UI, el agente y la página no pueden contradecirse sobre lo que contiene el cuaderno.

## El código

### Encontrar el model context

La detección tiene que contemplar ambas ubicaciones mientras dure el trial:

```ts
export function getModelContext(doc: unknown, nav: unknown) {
  const fromDoc = (doc as { modelContext?: ModelContextLike })?.modelContext
  if (fromDoc && typeof fromDoc.registerTool === 'function') return fromDoc
  const fromNav = (nav as { modelContext?: ModelContextLike })?.modelContext
  if (fromNav && typeof fromNav.registerTool === 'function') return fromNav
  return null
}
```

Prefiere `document.modelContext`, cae a `navigator.modelContext` y verifica que `registerTool` sea de verdad una función, en vez de confiar en que la propiedad existe.

### Definir una tool

Una tool es un objeto plano. Esta es `search_notes`, recortada:

```ts
const searchNotes = {
  name: 'search_notes',
  title: 'Search notebook',
  description:
    "Search Giorgio Saud's web development notebook. Returns matching notes " +
    'with title, description, URL and a slug you can pass to read_note.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Free-text search. Empty lists the latest notes.' },
      lang: { type: 'string', enum: ['en', 'es'] },
      collection: { type: 'string' },
      page: { type: 'integer', minimum: 1 },
    },
  },
  annotations: { readOnlyHint: true },
  async execute(input) {
    const params = new URLSearchParams({ lang: parseLang(input.lang, env.lang) })
    if (typeof input.query === 'string') params.set('q', input.query)

    const res = await env.fetch(`${env.origin}/api/notes/search.json?${params}`)
    if (!res.ok) return error(`Search failed with HTTP ${res.status}`)

    const data = await res.json()
    return text({
      total: data.total,
      results: data.results.map(note => ({
        slug: note.id,
        title: note.title,
        url: `${env.origin}${note.href}`,
      })),
    })
  },
}
```

Hay varias decisiones deliberadas ahí:

- **La descripción está escrita para un modelo.** Dice qué cubre el cuaderno y le indica al agente que el slug va en `read_note`. Esa frase es la que encadena las dos tools. (Las descripciones van en inglés: es el idioma que mejor siguen los modelos, y el parámetro `lang` decide el idioma del contenido.)
- **`readOnlyHint: true`.** La spec define anotaciones para que el agente (o el navegador) decida con cuánto cuidado tratar una llamada. También existe `consequentialHint` para acciones con efectos reales. No tengo ninguna así, a propósito.
- **URLs absolutas hacia afuera.** La API de búsqueda devuelve `href` relativos para la UI. El agente recibe URLs completas que puede citar.
- **Los errores son resultados, no excepciones.** Un 500 se convierte en `{ isError: true, content: [...] }`, con una frase que el modelo puede leer y usar para decidir qué hacer.

`read_note` hace una cosa más que vale la pena copiar: sin argumentos, lee la nota *abierta en la pestaña actual*, usando el `<link rel="alternate" type="text/markdown">` que ya tiene cada página de nota. "Resume este post" funciona sin que el agente conozca ningún slug.

### El input del agente no es confiable

El slug viene de un modelo, que lo sacó de quién sabe dónde. Antes de acercarse a una URL, tiene que parecer una nota:

```ts
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function parseNoteRef(ref: string, fallbackLang: NotebookLang) {
  const trimmed = ref.trim()
  if (SLUG_REGEX.test(trimmed)) return { slug: trimmed, lang: fallbackLang }

  const { pathname } = new URL(trimmed, 'https://placeholder.invalid')
  const match = pathname.match(/^\/(?:(es)\/cuaderno|notebook)\/([a-z0-9-]+?)(?:\.md)?\/?$/)
  if (!match) return null
  return { slug: match[2], lang: match[1] ? 'es' : 'en' }
}
```

Acepta un slug, un path o una URL completa de nota (a los modelos les encanta pegar URLs), y rechaza todo lo demás — `../../secret`, `/dashboard`, texto libre — antes de que salga un solo request. El fetch solo apunta al origen de la propia página.

### Registrar y desregistrar

```ts
export async function registerNotebookTools(ctx, tools) {
  const controller = new AbortController()
  for (const tool of tools) {
    try {
      await ctx.registerTool(tool, { signal: controller.signal })
    } catch (err) {
      console.warn(`[webmcp] could not register ${tool.name}`, err)
    }
  }
  return controller
}
```

El `await` cubre tanto el `registerTool` de la spec, que devuelve una promesa, como builds antiguos síncronos. Si un registro falla (por ejemplo, un nombre duplicado), no tumba a los demás. `controller.abort()` quita todas las tools de una vez. Eso importa en SPAs, donde las tools deberían seguir a la vista actual. Este sitio es una app Astro multipágina, así que las tools simplemente viven lo que vive la página.

### Conectarlo en Astro

Toda la integración es un componente con un `<script>`, renderizado una vez en cada layout:

```astro
<script>
  import { createNotebookTools, getModelContext, registerNotebookTools } from '@global-scripts/webmcp'

  const lang = document.documentElement.lang === 'es' ? 'es' : 'en'
  const currentMarkdownPath = document
    .querySelector('link[rel="alternate"][type="text/markdown"]')
    ?.getAttribute('href') ?? null

  const tools = createNotebookTools({
    fetch: window.fetch.bind(window),
    origin: window.location.origin,
    lang,
    currentMarkdownPath,
  })

  const ctx = getModelContext(document, navigator)
  if (ctx) registerNotebookTools(ctx, tools)
</script>
```

Astro procesa y empaqueta el script como cualquier otro, y las páginas que nunca tienen WebMCP pagan por una sola verificación. Si mandas un header `Permissions-Policy`, ojo: WebMCP está controlado por la feature `tools`, que por defecto es `'self'`. No la pongas como `tools=()` por accidente. También necesita un contexto seguro, y `localhost` cuenta.

## Cómo lo probé, y qué no

Es una lección que [repito seguido](https://www.giorgiosaud.io/es/cuaderno/anchor-scope-position-try-chrome-bug-nchrsc): que los tests pasen no prueba que algo funcione en un navegador real. Así que esto es exactamente lo que está verificado:

- **Tests unitarios** (Vitest, con `fetch` mockeado): orden de detección, parseo y rechazo de slugs, construcción del query, resultados de error, y que cada tool se registre con la señal compartida. 16 tests.
- **En un navegador real, contra el dev server:** un hook solo para desarrollo expone los objetos de las tools, así que llamé ambas desde la consola en una página de nota real. La búsqueda devolvió resultados reales con URLs absolutas, en inglés y en español. `read_note` sin argumentos devolvió el Markdown de la nota abierta. Los slugs desconocidos volvieron como errores limpios.
- **Contra un `modelContext` falso con la forma de la spec:** un `registerTool` que devuelve promesa, rechaza duplicados y quita tools cuando se aborta la señal. Ambas tools se registraron, se ejecutaron a través del registro falso y desaparecieron con `abort()`.

Lo que **todavía no** he hecho es ver a un agente real llamarlas. Para eso hace falta Chrome con el flag de testing más la extensión Model Context Tool Inspector de Google (que pide una API key de Gemini), y el navegador donde probé no trae WebMCP. Cuando lo corra de punta a punta, voy a actualizar esta nota con lo que hizo el agente.

## Lo que no construí

- **Nada de tools de escritura.** Publicar un comentario o enviar el formulario de contacto serían tools naturales, y las dos tienen consecuencias. Necesitarían `consequentialHint` y un paso de confirmación real. Primero, solo lectura.
- **Nada de API declarativa.** La spec tiene prevista una forma, con atributos HTML, de convertir formularios existentes en tools, pero esa sección seguía marcada como TODO cuando la revisé. Mis formularios pueden esperar.
- **Nada de librerías.** Existen paquetes wrapper, pero esto son menos de 300 líneas, schemas incluidos. Para dos tools, depender de un paquete sobre una API que cambió de forma dos veces este año cuesta más de lo que ahorra.

## Si quieres probarlo en tu sitio

1. Haz la lista de lo que un agente realmente querría hacer en tu sitio, y empieza por lo que es solo lectura.
2. Revisa si ya sirves esos datos en algún lado, como un endpoint de búsqueda, un feed o una versión en Markdown. Envuelve eso en vez de construir algo nuevo.
3. Detecta primero `document.modelContext`, después `navigator.modelContext`, y registra con un `AbortSignal`.
4. Escribe las descripciones para un modelo, valida cada input y devuelve los errores como resultados legibles.

Después pruébalo en un navegador real. Y si encuentras un agente que consuma estas tools hoy, quiero saberlo.
