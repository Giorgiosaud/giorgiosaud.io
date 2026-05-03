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

## El Navegador Se Está Convirtiendo en un Runtime de IA

Durante los últimos años, las funcionalidades de IA significaban llamar a una API externa — OpenAI, Anthropic, Google. Enviabas texto a un servidor, pagabas por token y esperabas que la latencia fuera aceptable. Chrome está cambiando ese modelo. A partir de Chrome 131, un conjunto de APIs de IA integradas ejecuta modelos **directamente en el dispositivo del usuario**, dentro del navegador, sin ninguna petición de red.

La primera que vale la pena integrar hoy es la **API Summarizer**.

> **Pruébalo ahora**: si estás en Chrome con el flag habilitado, el botón 🤖 de esta página usa exactamente esta API para resumir el artículo que estás leyendo.

## ¿Qué Es la API Summarizer?

Es una API nativa del navegador que condensa texto en una forma más corta. El modelo corre localmente usando el motor de inferencia en el dispositivo de Chrome (impulsado por Gemini Nano). Sin clave de API, sin viaje de ida y vuelta al servidor, sin datos que salgan del dispositivo.

```js
// Verificar disponibilidad
const availability = await Summarizer.availability({ expectedOutputLanguage: 'es' })
// → "available" | "downloadable" | "downloading" | "unavailable"

// Crear una sesión
const summarizer = await Summarizer.create({
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
  expectedInputLanguages: ['es'],
  expectedOutputLanguage: 'es',
})

// Resumir
const summary = await summarizer.summarize(document.body.innerText)
console.log(summary)
```

## Salida en Streaming

Para una mejor UX, transmite el resultado mientras se genera — el mismo patrón que cualquier API de LLM en streaming:

```js
const stream = summarizer.summarizeStreaming(text)
let result = ''

for await (const chunk of stream) {
  result += chunk
  outputEl.innerHTML = marked.parse(result) // renderizar markdown de forma incremental
}
```

El usuario ve el resumen construirse palabra por palabra en lugar de esperar el resultado completo.

## Opciones de Configuración

### `type`
Controla qué tipo de resumen obtienes:

| Valor | Resultado |
|-------|-----------|
| `tl;dr` | Una sola oración |
| `teaser` | Párrafo introductorio atractivo |
| `key-points` | Lista de puntos principales |
| `headline` | Un titular |

### `length`
`short`, `medium` o `long` — relativo al tamaño del input.

### `format`
`plain-text` o `markdown`. Usa `markdown` si vas a renderizarlo.

### `sharedContext`
Un prompt que establece el tono y la audiencia:

```js
const summarizer = await Summarizer.create({
  sharedContext: 'Un artículo técnico para desarrolladores frontend. Tono informal pero preciso.',
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
  expectedOutputLanguage: 'es',
})
```

## Verificar Disponibilidad Antes de Usar

El modelo puede necesitar descargarse en el primer uso. Siempre verifica antes de crear una sesión:

```js
const options = {
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
  expectedOutputLanguage: 'es',
}

const availability = await Summarizer.availability(options)

if (availability === 'unavailable') {
  // API no soportada o deshabilitada
  return
}

if (availability === 'downloadable') {
  // El modelo necesita descargarse — puedes crear la sesión,
  // pero habrá un retraso. Opcionalmente muestra "descargando modelo..."
}

const summarizer = await Summarizer.create(options)
```

## Implementación Real: Este Sitio

Aquí una versión condensada del botón 🤖 de esta página:

```js
if ('Summarizer' in self) {
  // Mostrar el botón — la API está disponible
  button.hidden = false

  button.addEventListener('click', async () => {
    modal.classList.add('show')
    content.innerHTML = '<p>Generando resumen...</p>'

    try {
      const options = {
        sharedContext: 'Un artículo de desarrollo frontend. Tono informal pero técnico.',
        type: 'key-points',
        format: 'markdown',
        length: 'medium',
        expectedInputLanguages: ['es'],
        expectedOutputLanguage: 'es',
      }

      const availability = await Summarizer.availability(options)
      if (availability === 'unavailable') {
        content.innerHTML = '<p>No disponible en este navegador.</p>'
        return
      }

      const { marked } = await import('https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js')
      const summarizer = await Summarizer.create(options)
      const stream = summarizer.summarizeStreaming(document.getElementById('content').innerText)

      let result = ''
      for await (const chunk of stream) {
        result += chunk
        content.innerHTML = marked.parse(result)
      }
    } catch (err) {
      content.innerHTML = '<p>Algo salió mal.</p>'
      console.error(err)
    }
  })
}
```

Algunos puntos a destacar:
- `marked` se carga de forma lazy solo cuando el usuario hace clic — sin impacto en la carga inicial
- El truco del script `define:vars` en Astro: `'Summarizer' in self` lo mantiene fuera del grafo de módulos ya que TypeScript aún no conoce esta API
- Pasa `options` a `Summarizer.availability(options)` — la API los necesita para verificar la compatibilidad del modelo con tu configuración específica

## Cómo Habilitarlo

La API está detrás de un flag en Chrome 131+:

1. Abre `chrome://flags`
2. Busca **Summarization API for Gemini Nano**
3. Cambia a **Enabled**
4. Reinicia Chrome

Chrome descargará el modelo Gemini Nano en segundo plano (unos cientos de MB, una sola vez).

## Por Qué Importa

La IA en el dispositivo invierte los tradeoffs habituales:

| | API en la Nube | IA Integrada |
|--|----------------|--------------|
| **Costo** | Por token | Gratis |
| **Latencia** | Round-trip de red | Casi instantáneo |
| **Privacidad** | Datos salen del dispositivo | Se quedan en el dispositivo |
| **Offline** | ❌ | ✅ |
| **Disponibilidad** | Cualquier navegador | Solo Chrome (por ahora) |

Para funcionalidades como resumir documentos privados, apps de notas offline, o agregar IA a herramientas donde enviar datos a un servidor no es aceptable, el procesamiento en el dispositivo es la única opción viable.

## Lo Que Viene

El Summarizer es solo el primero. El roadmap de IA integrada de Chrome incluye:

- **Translator API** — traduce texto entre idiomas en el dispositivo
- **Language Detector API** — identifica en qué idioma está escrito un texto
- **Writer / Rewriter API** — genera y reformula texto
- **Prompt API** — una interfaz de propósito general para Gemini Nano

Todos son experimentales hoy, pero la dirección es clara: el navegador se está convirtiendo en un runtime de IA de primera clase, con APIs diseñadas con estándares web desde el inicio.

## Patrón de Mejora Progresiva

Como esto es solo Chrome por ahora, trátalo siempre como una mejora:

```js
async function agregarFuncionResumen() {
  if (!('Summarizer' in self)) return // no-op sin errores

  const availability = await Summarizer.availability({ expectedOutputLanguage: 'es' })
  if (availability === 'unavailable') return

  // Seguro para continuar — mostrar la funcionalidad de IA
}
```

Los usuarios en Firefox, Safari o Chrome antiguo obtienen la experiencia normal. Los usuarios en Chrome con la funcionalidad disponible obtienen la versión mejorada. Sin estados rotos.

## Conclusiones Clave

1. **Cero costo, cero latencia** — el modelo corre en la GPU del usuario
2. **Pasa opciones a `availability()`** — requerido para que la API verifique compatibilidad
3. **Streaming para mejor UX** — `summarizeStreaming()` + `for await...of`
4. **Carga lazy de dependencias** — no incluyas renderers de markdown en la carga inicial
5. **Mejora progresiva** — `'Summarizer' in self` antes que todo
6. **Vienen más APIs** — Translator, Writer, Prompt API están en el pipeline

La plataforma web se está volviendo más inteligente. Vale la pena seguirle el ritmo.
