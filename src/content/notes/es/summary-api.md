---
title: Introducing the New Summary API in Browsers
description: Learn about the new Summary API, which enables browsers to generate AI-powered summaries of web content.
publishDate: 2025-09-25T13:15:32.449Z
cover: ../../../assets/images/summary_api.png
coverAlt: Summary API illustration
selfHealing: SMMPPN
draft: false
lang: en
slug: introduccion-a-api-summary
collections:
  - ai
tags:
  - AI
  - frontent
keywords:
  - Summary api
  - generate AI-powered summaries
author: giorgio-saud
category: IA
---

## ¿Qué es la API de Summary?

La nueva API de Summary es una función del navegador que permite a desarrolladores y usuarios generar resúmenes inteligentes de contenido web directamente en el navegador. Utiliza modelos de lenguaje avanzados para crear resúmenes concisos y relevantes de artículos, documentación y más.

### Características principales
- **Resúmenes en tiempo real:** Los resúmenes se generan de forma continua, fragmento a fragmento, para una experiencia fluida.
- **Contexto personalizable:** Los desarrolladores pueden proporcionar contexto para guiar la generación del resumen.
- **Soporte de Markdown:** El resultado puede estar en formato markdown para facilitar la integración.

### Ejemplo de uso
```js
const summarizer = await Summarizer.create({
      sharedContext: 'Este es un artículo para desarrolladores FrontEnd, el tono es menos formal pero técnico',
      type: 'teaser',
      format: 'markdown',
      length: "medium",
      expectedInputLanguages: ["es-ES"],
      outputLanguage: 'es-ES',
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`Downloaded ${e.loaded * 100}%`);
        });
      }
});
const summary = await summarizer.summarizeStreaming(document.body.innerText);
for await (const chunk of summary.values()) {
  console.log(chunk);
}
```


### Casos de uso
- **Lectura rápida de artículos:** Ideal para usuarios que quieren obtener la esencia de un texto largo sin leerlo completo.
- **Accesibilidad:** Personas con dificultades de lectura pueden beneficiarse de resúmenes claros y directos.
- **Documentación técnica:** Los desarrolladores pueden integrar resúmenes automáticos en portales de documentación para facilitar la navegación.
- **Educación:** Estudiantes pueden usar la API para obtener resúmenes de materiales de estudio y enfocarse en los puntos clave.
- **Productividad:** Herramientas de gestión de información pueden mostrar resúmenes automáticos en dashboards o sistemas de búsqueda.

### Limitaciones y soporte actual
Actualmente, el soporte para la API de Summary es limitado y solo está disponible en algunos navegadores experimentales o versiones específicas. Es posible que la funcionalidad no esté disponible para todos los usuarios, y su integración puede requerir pruebas adicionales. Se recomienda consultar la documentación oficial y verificar la disponibilidad antes de depender de esta API en producción.

> **Consejo:** Puedes probar la API de Summary ahora mismo si tu navegador la soporta—solo haz clic en el botón flotante en la esquina inferior derecha de esta página.