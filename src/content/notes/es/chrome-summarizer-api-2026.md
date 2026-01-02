---
draft: true
slug: api-summarizer-chrome-2026
title: "API Summarizer de Chrome 2026: La IA del Navegador Se Vuelve Mainstream"
description: "La API Summarizer integrada en Chrome ahora está disponible para todos los usuarios. Aprende las últimas capacidades, detección de disponibilidad y patrones de producción para resumen con IA en el dispositivo."
publishDate: 2026-01-02
cover: ../../../assets/images/summary_api.png
coverAlt: Chrome Summarizer API 2026
selfHealing: chrmsm
lang: es
category: Development
author: giorgio-saud
collections:
  - ai
  - frontend
tags:
  - chrome-api
  - ai
  - summarization
  - "2026"
---

## API Summarizer de Chrome: De Experimental a Producción

Lo que comenzó como un origin trial en 2024 ahora es una característica estándar de Chrome en 2026. La API Summarizer trae resumen de texto impulsado por IA directamente al navegador - sin claves de API, sin costos de servidor, sin datos saliendo del dispositivo.

## Estado de Disponibilidad (2026)

| Navegador | Estado | Notas |
|-----------|--------|-------|
| Chrome 131+ | Disponible | Desktop y Android |
| Edge 131+ | Disponible | Basado en Chromium |
| Firefox | No disponible | Sin implementación planeada |
| Safari | No disponible | Enfoque de IA diferente |

**Cambio clave en 2026**: Ya no requiere flags ni origin trials. La API está disponible para todos los usuarios de Chrome con hardware suficiente.

## Requisitos de Hardware

La API Summarizer requiere:
- ~2GB de almacenamiento libre para el modelo
- 4GB+ RAM recomendado
- El modelo se descarga automáticamente en el primer uso

## Detección de Características (Patrón 2026)

```javascript
async function checkSummarizerAvailability() {
  // Verificar si la API existe
  if (!('ai' in self) || !('summarizer' in self.ai)) {
    return { available: false, reason: 'API no soportada' }
  }

  // Verificar estado de capacidad
  const capabilities = await self.ai.summarizer.capabilities()

  switch (capabilities.available) {
    case 'readily':
      return { available: true, reason: 'Listo para usar' }

    case 'after-download':
      return {
        available: true,
        reason: 'Descarga de modelo requerida',
        needsDownload: true
      }

    case 'no':
      return {
        available: false,
        reason: capabilities.reason || 'No disponible en este dispositivo'
      }

    default:
      return { available: false, reason: 'Estado desconocido' }
  }
}
```

## Uso Básico

```javascript
// Crear instancia del summarizer
const summarizer = await self.ai.summarizer.create({
  type: 'key-points',    // 'key-points' | 'tl;dr' | 'teaser' | 'headline'
  format: 'markdown',    // 'markdown' | 'plain-text'
  length: 'medium',      // 'short' | 'medium' | 'long'
  sharedContext: 'Artículo técnico sobre desarrollo web'
})

// Resumir texto
const summary = await summarizer.summarize(articleText)
console.log(summary)

// Limpiar cuando termines
summarizer.destroy()
```

## Tipos de Resumen Explicados

### key-points
Extrae puntos principales como lista con viñetas:
```javascript
const summarizer = await self.ai.summarizer.create({
  type: 'key-points',
  format: 'markdown'
})
// Salida: "- Punto uno\n- Punto dos\n- Punto tres"
```

### tl;dr
Resumen condensado en párrafo:
```javascript
const summarizer = await self.ai.summarizer.create({
  type: 'tl;dr',
  length: 'short'
})
// Salida: "Párrafo breve resumiendo el contenido..."
```

### teaser
Vista previa atractiva para incentivar lectura:
```javascript
const summarizer = await self.ai.summarizer.create({
  type: 'teaser'
})
// Salida: "Descubre cómo... Aprende por qué..."
```

### headline
Título de una línea:
```javascript
const summarizer = await self.ai.summarizer.create({
  type: 'headline'
})
// Salida: "Nuevas Características CSS Transforman el Desarrollo Web"
```

## Respuestas en Streaming

Para contenido largo, usa streaming:

```javascript
const summarizer = await self.ai.summarizer.create({
  type: 'key-points',
  format: 'markdown'
})

const stream = await summarizer.summarizeStreaming(longArticle)

for await (const chunk of stream) {
  // Actualizar UI progresivamente
  outputElement.textContent += chunk
}
```

## Contexto Compartido para Mejores Resultados

La opción `sharedContext` mejora la calidad del resumen:

```javascript
// Para un blog de cocina
const summarizer = await self.ai.summarizer.create({
  type: 'key-points',
  sharedContext: 'Instrucciones de receta para cocineros caseros'
})

// Para documentación técnica
const summarizer = await self.ai.summarizer.create({
  type: 'tl;dr',
  sharedContext: 'Documentación técnica para desarrolladores React'
})

// Para artículos de noticias
const summarizer = await self.ai.summarizer.create({
  type: 'headline',
  sharedContext: 'Artículo de noticias de última hora'
})
```

## Patrón de Producción: Lazy Loading

No cargues el summarizer hasta que sea necesario:

```javascript
let summarizerInstance = null

async function getSummarizer() {
  if (summarizerInstance) return summarizerInstance

  const { available } = await checkSummarizerAvailability()
  if (!available) return null

  summarizerInstance = await self.ai.summarizer.create({
    type: 'key-points',
    format: 'markdown',
    length: 'medium'
  })

  return summarizerInstance
}

// Uso
document.querySelector('#summarize-btn').addEventListener('click', async () => {
  const summarizer = await getSummarizer()
  if (!summarizer) {
    showFallbackUI()
    return
  }

  const summary = await summarizer.summarize(getArticleText())
  displaySummary(summary)
})
```

## Manejando Descarga del Modelo

Para usuarios primerizos:

```javascript
async function initializeSummarizer(onProgress) {
  const capabilities = await self.ai.summarizer.capabilities()

  if (capabilities.available === 'no') {
    throw new Error('Summarizer no disponible')
  }

  const summarizer = await self.ai.summarizer.create({
    type: 'key-points',
    format: 'markdown'
  })

  // Monitorear progreso de descarga si es necesario
  if (capabilities.available === 'after-download') {
    summarizer.addEventListener('downloadprogress', (e) => {
      const percent = Math.round((e.loaded / e.total) * 100)
      onProgress?.(percent)
    })

    // Esperar a que el modelo esté listo
    await summarizer.ready
  }

  return summarizer
}

// Uso con UI de progreso
const summarizer = await initializeSummarizer((percent) => {
  progressBar.style.width = `${percent}%`
  progressText.textContent = `Descargando modelo de IA: ${percent}%`
})
```

## Soporte Multiidioma

La API maneja múltiples idiomas:

```javascript
// El summarizer detecta el idioma automáticamente
const summarizer = await self.ai.summarizer.create({
  type: 'key-points',
  sharedContext: 'Artículo técnico sobre desarrollo web' // Contexto en español
})

const spanishSummary = await summarizer.summarize(spanishArticle)
```

## Manejo de Errores

```javascript
async function safeSummarize(text) {
  try {
    const summarizer = await getSummarizer()
    if (!summarizer) {
      return { success: false, error: 'Summarizer no disponible' }
    }

    const summary = await summarizer.summarize(text)
    return { success: true, summary }

  } catch (error) {
    if (error.name === 'NotSupportedError') {
      return { success: false, error: 'Característica no soportada' }
    }
    if (error.name === 'QuotaExceededError') {
      return { success: false, error: 'Cuota de almacenamiento excedida' }
    }
    return { success: false, error: error.message }
  }
}
```

## Degradación Elegante

Siempre proporciona un fallback:

```javascript
async function getArticleSummary(text) {
  // Intentar IA del navegador primero
  const summarizer = await getSummarizer()
  if (summarizer) {
    return await summarizer.summarize(text)
  }

  // Fallback a resumen del lado del servidor
  const response = await fetch('/api/summarize', {
    method: 'POST',
    body: JSON.stringify({ text })
  })
  const { summary } = await response.json()
  return summary
}
```

## Ejemplo de Implementación Real

Del summarizer de IA de este sitio:

```javascript
class ArticleSummarizer {
  #summarizer = null
  #isReady = false

  async initialize() {
    if (!('ai' in self) || !('summarizer' in self.ai)) {
      return false
    }

    const caps = await self.ai.summarizer.capabilities()
    if (caps.available === 'no') return false

    this.#summarizer = await self.ai.summarizer.create({
      type: 'key-points',
      format: 'markdown',
      length: 'medium',
      sharedContext: 'Artículo de blog sobre desarrollo web'
    })

    if (caps.available === 'after-download') {
      await this.#summarizer.ready
    }

    this.#isReady = true
    return true
  }

  async summarize(text) {
    if (!this.#isReady) {
      throw new Error('Summarizer no inicializado')
    }
    return await this.#summarizer.summarize(text)
  }

  destroy() {
    this.#summarizer?.destroy()
    this.#summarizer = null
    this.#isReady = false
  }
}
```

## Puntos Clave

1. **Sin costos de API** - IA en dispositivo, sin servidor requerido
2. **Privacidad primero** - Los datos nunca salen del navegador
3. **Cuatro tipos de resumen** - key-points, tl;dr, teaser, headline
4. **Soporte de streaming** - Salida progresiva para contenido largo
5. **Siempre fallback** - No todos los usuarios tienen hardware compatible

La API Summarizer de Chrome representa un cambio hacia IA en el dispositivo. En 2026, está lo suficientemente madura para uso en producción - solo recuerda siempre proporcionar fallbacks para usuarios sin soporte.
