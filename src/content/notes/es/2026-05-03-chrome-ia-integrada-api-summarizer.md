---
draft: false
title: "Chrome IA Integrada: La API Summarizer"
description: "Chrome incluye una API Summarizer nativa impulsada por IA en el dispositivo. Sin claves de API, sin costos de servidor, sin preocupaciones de privacidad — el modelo corre completamente en tu navegador."
publishDate: 2026-05-03
cover: ../../../assets/images/chrome-built-in-ai-summarizer.png
coverAlt: Navegador Chrome con un robot resumiendo texto en pantalla
selfHealing: chrmbl
lang: es
category: Development
author: giorgio-saud
collections:
  - ai
  - frontend
tags:
  - ai
  - chrome
  - browser-api
  - summarizer
  - built-in-ai
---

Si estás en Chrome con el flag habilitado, habrás notado el botón 🤖 flotando en esta página. Eso es la API Summarizer integrada de Chrome funcionando — sin servidor, sin clave de API, el modelo corre completamente en tu dispositivo. Me pareció que valía la pena escribir sobre esto porque cambia la forma en que pensamos en agregar IA a la web.

## ¿Qué está pasando acá?

Chrome 131 lanzó un conjunto de APIs de IA experimentales que corren modelos localmente usando Gemini Nano. Sin petición de red, sin costo por token, sin datos saliendo del dispositivo. El Summarizer fue el primero que me pareció lo suficientemente práctico como para usarlo de verdad.

El uso básico es bastante directo:

```js
if ('Summarizer' in self) {
  const summarizer = await Summarizer.create({
    type: 'key-points',
    format: 'markdown',
    length: 'medium',
    expectedInputLanguages: ['es'],
    expectedOutputLanguage: 'es',
  })

  const summary = await summarizer.summarize(document.body.innerText)
}
```

Eso es todo. Sin imports, sin auth, solo una API nativa del navegador.

## La versión en streaming es mejor

Esperar a que se genere el resumen completo antes de mostrar algo se siente mal. La API de streaming lo soluciona — el mismo patrón `for await...of` que usarías con cualquier stream de LLM:

```js
const stream = summarizer.summarizeStreaming(text)
let result = ''

for await (const chunk of stream) {
  result += chunk
  outputEl.innerHTML = marked.parse(result) // renderizar mientras llega
}
```

El usuario lo ve construirse palabra por palabra. Mucho mejor experiencia.

## Cosas que aprendí por las malas

**Pasá las opciones a `availability()` también.** La API no solo verifica si el modelo existe — verifica si soporta tu configuración específica. Si omitís las opciones, Chrome lanza una advertencia y el chequeo no es preciso:

```js
const options = {
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
  expectedOutputLanguage: 'es',
}

// Pasá las mismas opciones acá, no solo a create()
const availability = await Summarizer.availability(options)

if (availability === 'unavailable') return
// "downloadable" significa descarga por primera vez — igual funciona, solo más lento

const summarizer = await Summarizer.create(options)
```

**`sharedContext` es donde definís el tono.** Básicamente es tu system prompt — usalo para decirle al modelo qué tipo de contenido está resumiendo y cómo responder:

```js
const summarizer = await Summarizer.create({
  sharedContext: 'Un blog de desarrollo frontend. Tono informal pero técnicamente preciso.',
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
  expectedOutputLanguage: 'es',
})
```

**Cargá el renderer de markdown de forma lazy.** No incluyas `marked` en el bundle de la página — la mayoría de usuarios no van a hacer clic en el botón. Solo importalo cuando lo hagan:

```js
button.addEventListener('click', async () => {
  const { marked } = await import('https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js')
  // usarlo acá
})
```

## Cómo habilitarlo

La API está detrás de un flag por ahora:

1. Abrí `chrome://flags`
2. Buscá **Summarization API for Gemini Nano**
3. Habilitalo y reiniciá Chrome

Chrome va a descargar Gemini Nano en segundo plano — unos cientos de MB, una sola vez. Después es instantáneo.

## Por qué importa

La historia habitual de integración de IA es: elegir un proveedor, configurar facturación, manejar claves de API, lidiar con la latencia, preocuparse por qué datos estás enviando. Esto se salta todo eso.

Para casos donde la privacidad importa — resumir un documento privado, procesar notas que no querés en un servidor — el procesamiento en el dispositivo es la única opción real. Y para los demás, gratis e instantáneo es difícil de discutir.

El tradeoff es obvio: solo Chrome, flag requerido por ahora. Así que siempre tratalo como mejora progresiva:

```js
async function agregarFuncionResumen() {
  if (!('Summarizer' in self)) return // no-op silencioso en Firefox, Safari, etc.

  const availability = await Summarizer.availability({ expectedOutputLanguage: 'es' })
  if (availability === 'unavailable') return

  // seguro para continuar
}
```

Los usuarios sin el flag obtienen la experiencia normal. Los que lo tienen obtienen algo extra.

## Qué viene después

El Summarizer es solo el primero. El roadmap de IA integrada de Chrome también incluye una Translator API, Language Detector, Writer/Rewriter, y una Prompt API de propósito general para acceso directo a Gemini Nano. Todo experimental, todo vale la pena seguir.

El navegador convirtiéndose en un runtime de IA es un cambio más grande de lo que parece. Vale la pena tenerlo en el radar.

> **Probalo en acción**: si estás en Chrome con el flag habilitado, hacé clic en el botón 🤖 de esta página y dejá que resuma este artículo.
