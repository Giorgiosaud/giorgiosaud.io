---
draft: false
title: "IA Nativa del Navegador: API Summarizer de Chrome"
description: "Aprende a usar la API Summarizer integrada en Chrome para generar resúmenes con IA sin costos de API, incluyendo lazy loading, streaming y soporte multiidioma."
publishDate: 2026-01-02
cover: ../../../assets/images/summary_api.png
coverAlt: Ilustración de Chrome Summarizer API
selfHealing: brwsrn
lang: es
category: Development
author: giorgio-saud
collections:
  - ai
  - frontend
tags:
  - ai
  - chrome-api
  - lazy-loading
  - performance
  - javascript
---

## Por Qué Importa la IA Nativa del Navegador

Imagina generar resúmenes con IA sin pagar por llamadas API, sin enviar datos de usuarios a servidores externos, y con cero latencia por viajes de red. Eso es exactamente lo que ofrece la API Summarizer de Chrome - capacidades de IA ejecutándose directamente en el navegador.

En esta nota, te mostraré cómo implementé esto en mi propio sitio (¡sí, el botón flotante del robot que ves en esta página!), incluyendo patrones para lazy loading, respuestas en streaming y soporte multiidioma.

## Detección de Características Primero

La API Summarizer todavía está en despliegue, así que siempre verifica la disponibilidad:

```javascript
if ("Summarizer" in self) {
  // API está disponible
  const availability = await Summarizer.availability();

  if (availability === "available") {
    // Listo para usar inmediatamente
  } else if (availability === "downloadable") {
    // El modelo necesita descargarse primero
  } else {
    // No soportado en este dispositivo
  }
}
```

Esta verificación de disponibilidad en tres niveles es crucial - incluso si la API existe, el modelo podría necesitar descargarse o el dispositivo podría no soportarlo.

## Lazy Loading de Dependencias

Un patrón del que estoy particularmente orgulloso es el lazy loading de la librería `marked` solo cuando el usuario realmente hace clic en el botón de resumir:

```javascript
// Cache para la librería marked cargada dinámicamente
let markedModule = null;

async function getMarked() {
  if (!markedModule) {
    const module = await import(
      "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js"
    );
    markedModule = module.marked;
  }
  return markedModule;
}
```

Esto ahorra ~30KB en la carga inicial de la página. La librería solo se carga cuando alguien realmente quiere un resumen - lo cual podría ser nunca para la mayoría de los visitantes.

## Creando el Summarizer con Contexto

El verdadero poder viene de las opciones de configuración:

```javascript
const summarizer = await Summarizer.create({
  sharedContext:
    "Este es un artículo técnico para desarrolladores frontend. " +
    "Usa el mismo idioma que el texto de entrada. " +
    "El tono debe ser menos formal pero técnico.",
  type: "teaser",        // "teaser", "key-points", "headline", o "tl;dr"
  format: "markdown",    // Formato de salida
  length: "medium",      // "short", "medium", o "long"
  expectedInputLanguages: ["es"],
  outputLanguage: "es",
  monitor(m) {
    m.addEventListener("downloadprogress", (e) => {
      console.log(`Descargado ${e.loaded * 100}%`);
    });
  },
});
```

El `sharedContext` es poderoso - guía a la IA para entender qué tipo de contenido está resumiendo y cómo responder.

## Streaming para Mejor UX

En lugar de esperar el resumen completo, transmítelo fragmento por fragmento:

```javascript
const text = document.getElementById("content").innerText;
const summary = await summarizer.summarizeStreaming(text);

let result = "";
for await (const chunk of summary.values()) {
  result += chunk;
  // Parsear y mostrar incrementalmente
  summaryContent.innerHTML = marked.parse(result);
}
```

Esto crea un efecto de máquina de escribir donde los usuarios ven el resumen construyéndose en tiempo real, en lugar de quedarse mirando un spinner de carga.

## Soporte Multiidioma

Para sitios bilingües, maneja la detección de idioma dinámicamente:

```javascript
const i18n = {
  en: {
    buttonTitle: "Generate summary",
    loading: "Generating Summary...",
    unavailable: "The summarization API is not available in this browser.",
    inputLang: "en",
    outputLang: "en",
  },
  es: {
    buttonTitle: "Generar resumen",
    loading: "Generando resumen...",
    unavailable: "La API de resumen no está disponible en este navegador.",
    inputLang: "es",
    outputLang: "es",
  },
};

// Pasar contexto de idioma al summarizer
const options = {
  expectedInputLanguages: [t.inputLang],
  outputLanguage: t.outputLang,
  // ...
};
```

## CSS Anchor Positioning para el Modal

El posicionamiento del modal usa CSS Anchor Positioning para un enfoque limpio, sin JS:

```css
.summary-bubble {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  anchor-name: --summary-bot;
}

.summary-modal {
  position: fixed;
  position-anchor: --summary-bot;
  position-area: top left;
  max-width: 400px;
}
```

El modal se posiciona automáticamente relativo al botón sin ningún cálculo de JavaScript.

## Patrón de Implementación Completo

Así es como todo se une en un componente Astro:

```astro
---
interface Props {
  lang?: "en" | "es";
}
const { lang = "en" } = Astro.props;
---

<button id="summary-btn" class="summary-bubble" hidden>
  <span>🤖</span>
</button>

<div id="summary-modal" class="summary-modal" hidden>
  <button id="close-modal">&times;</button>
  <div id="summary-content"></div>
</div>

<script define:vars={{ lang }}>
  if ("Summarizer" in self) {
    const btn = document.getElementById("summary-btn");
    btn.hidden = false; // Solo mostrar si API disponible

    btn.addEventListener("click", async () => {
      // Lazy load, crear summarizer, transmitir resultados...
    });
  }
</script>
```

## Soporte de Navegadores (2026)

A principios de 2026:
- **Chrome 131+**: Soporte completo con modelos descargables
- **Edge 131+**: Igual que Chrome (basado en Chromium)
- **Firefox**: Aún no soportado
- **Safari**: Aún no soportado

Siempre implementa degradación elegante - oculta la característica completamente si no está disponible en lugar de mostrar estados de error.

## Puntos Clave

1. **Cero costos de API** - La IA se ejecuta localmente en el navegador
2. **Privacidad primero** - No se envían datos a servidores externos
3. **Lazy load de todo** - No cargar dependencias hasta que se necesiten
4. **Respuestas en streaming** - Mejor UX que esperar resultados completos
5. **Detección de características** - Ocultar la característica si no está disponible, no mostrar errores

La API Summarizer representa un cambio hacia capacidades de IA nativas del navegador. Aunque el soporte todavía es limitado, implementarla ahora con fallbacks apropiados prepara tu sitio para cuando esté ampliamente disponible.

> **¡Pruébalo ahora!** Si estás en un navegador compatible, haz clic en el botón flotante del robot en la esquina inferior derecha de esta página para verlo en acción.
