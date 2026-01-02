---
draft: true
slug: implementacion-llms-txt
title: "Implementando llms.txt: Haz Tu Sitio Amigable para IA"
description: "Aprende el estándar llms.txt para proporcionar contenido estructurado a crawlers de IA. Implementa llms.txt y endpoints .md por página para acceso de contenido optimizado para LLMs."
publishDate: 2026-01-02
cover: ../../../assets/images/home-notebook.webp
coverAlt: Implementación LLMs.txt
selfHealing: llmstx
lang: es
category: Architecture
author: giorgio-saud
collections:
  - ai
  - architecture
tags:
  - llms
  - ai
  - seo
  - astro
---

## llms.txt: El Nuevo Estándar para Crawlers de IA

A medida que los LLMs se integran en flujos de trabajo de búsqueda y desarrollo, hay una necesidad de que los sitios proporcionen resúmenes de contenido legibles por máquinas. El estándar `llms.txt` (similar a `robots.txt`) da a los sistemas de IA una forma estructurada de entender tu sitio.

## ¿Qué es llms.txt?

Un archivo de texto plano en `/llms.txt` que proporciona:
1. Descripción y propósito del sitio
2. Lista de páginas importantes con resúmenes
3. Enlaces a versiones markdown del contenido

Piénsalo como un sitemap optimizado para comprensión de IA en lugar de rastreo de motores de búsqueda.

## Estructura Básica

```text
# Nombre del Sitio

> Breve descripción de lo que trata este sitio.

## Nombre de Sección
- [Título de Página](/ruta/a/pagina.md): Breve descripción
- [Otra Página](/otra/pagina.md): Descripción

## Otra Sección
- [Recurso](/recurso.md): Qué cubre este recurso
```

## Implementación en Astro

### 1. Crear Endpoint llms.txt

```typescript
// src/pages/llms.txt.ts
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

export const GET: APIRoute = async () => {
  const notes = await getCollection('notes')
  const sorted = notes
    .filter(n => !n.data.draft)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())

  const content = `# Mi Blog de Desarrollador

> Notas técnicas sobre desarrollo web, JavaScript y frameworks modernos.

## Notas Recientes
${sorted.slice(0, 20).map(n =>
  `- [${n.data.title}](/notebook/${n.id}.md): ${n.data.description || ''}`
).join('\n')}

## Categorías
- [Arquitectura](/notebook/categorias/arquitectura.md): Diseño de sistemas y patrones
- [Frontend](/notebook/categorias/frontend.md): CSS, JavaScript, frameworks
- [Astro](/notebook/categorias/astro.md): Guías del framework Astro
`

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
```

### 2. Crear Endpoints Markdown Por Página

Para cada página de contenido, proporciona una versión `.md`:

```typescript
// src/pages/notebook/[slug].md.ts
import type { APIRoute, GetStaticPaths } from 'astro'
import { getCollection } from 'astro:content'

export const getStaticPaths: GetStaticPaths = async () => {
  const notes = await getCollection('notes')
  return notes.map(note => ({
    params: { slug: note.id },
    props: { note }
  }))
}

export const GET: APIRoute = async ({ props }) => {
  const { note } = props
  const { Content } = await note.render()

  // Crear representación markdown
  const markdown = `# ${note.data.title}

> ${note.data.description}

Publicado: ${note.data.publishDate.toISOString().split('T')[0]}
Categoría: ${note.data.category}
Etiquetas: ${note.data.tags?.join(', ') || 'ninguna'}

---

${note.body}
`

  return new Response(markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
  })
}
```

### 3. Soporte Multiidioma

Para sitios multiidioma, crea llms.txt específicos por idioma:

```typescript
// src/pages/es/llms.txt.ts
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

export const GET: APIRoute = async () => {
  const notas = await getCollection('notas') // Colección en español
  const sorted = notas
    .filter(n => !n.data.draft)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())

  const content = `# Mi Blog de Desarrollo

> Notas técnicas sobre desarrollo web, JavaScript y frameworks modernos.

## Notas Recientes
${sorted.slice(0, 20).map(n =>
  `- [${n.data.title}](/es/notebook/${n.id}.md): ${n.data.description || ''}`
).join('\n')}
`

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
```

## Generación Dinámica vs Estática

### Estática (Pre-renderizada)

Para generación en tiempo de build:

```typescript
// src/pages/llms.txt.ts
export const prerender = true

export const GET: APIRoute = async () => {
  // Contenido generado en tiempo de build
}
```

### Dinámica (Lado del Servidor)

Para contenido siempre actualizado:

```typescript
// src/pages/llms.txt.ts
export const prerender = false

export const GET: APIRoute = async () => {
  // Contenido generado en cada petición
}
```

## Mejores Prácticas

### 1. Mantenlo Conciso

```text
# Bien
- [Guía CSS Grid](/css-grid.md): Guía completa de layout CSS Grid

# Mal (muy verboso)
- [Guía CSS Grid](/css-grid.md): Esta guía comprehensiva cubre todo lo que necesitas saber sobre CSS Grid incluyendo filas, columnas, áreas, alineación y patrones responsivos con ejemplos prácticos y mejores prácticas para desarrollo web moderno
```

### 2. Agrupación Lógica

```text
## Tutoriales
- [Comenzando](/tutoriales/inicio.md): Primeros pasos con el framework
- [Patrones Avanzados](/tutoriales/avanzado.md): Casos de uso complejos

## Referencia
- [Referencia API](/referencia/api.md): Documentación completa de la API
- [Configuración](/referencia/config.md): Todas las opciones de configuración
```

### 3. Incluir Metadatos en Endpoints Markdown

```typescript
const markdown = `---
title: ${note.data.title}
description: ${note.data.description}
date: ${note.data.publishDate.toISOString()}
author: ${note.data.author}
---

${note.body}
`
```

## Enlazando desde Páginas HTML

Agrega un enlace en el head de tu HTML para descubrimiento:

```html
<head>
  <link rel="alternate" type="text/plain" href="/llms.txt" title="Índice de Contenido LLM">
  <link rel="alternate" type="text/markdown" href="/notebook/pagina-actual.md" title="Versión Markdown">
</head>
```

## Probando Tu Implementación

```bash
# Verificar llms.txt
curl -s https://tusitio.com/llms.txt

# Verificar endpoint markdown
curl -s https://tusitio.com/notebook/mi-post.md

# Validar estructura
curl -s https://tusitio.com/llms.txt | head -20
```

## Integración con Herramientas de IA

### Claude/ChatGPT

Cuando los usuarios comparten tus URLs con asistentes de IA, la IA puede:
1. Obtener `/llms.txt` para visión general del sitio
2. Navegar a endpoints `.md` específicos
3. Obtener contenido limpio y parseable

### Asistentes de Desarrollo

Herramientas como Cursor, GitHub Copilot y Claude Code pueden usar llms.txt para entender la estructura de documentación del proyecto.

## Ejemplo de Implementación Real

De este sitio:

```typescript
// src/pages/llms.txt.ts
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

export const GET: APIRoute = async () => {
  const notes = await getCollection('notes')
  const sorted = notes
    .filter(n => !n.data.draft)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())

  const content = `# Giorgiosaud.io

> Notebook de desarrollador web con notas sobre Astro, JavaScript, TypeScript y desarrollo web moderno.

## Notas
${sorted.map(n => `- [${n.data.title}](/notebook/${n.id}.md): ${n.data.description || ''}`).join('\n')}
`
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
```

## Puntos Clave

1. **Formato simple** - Texto plano con enlaces estilo markdown
2. **Legible por máquinas** - Estructurado para parsing de IA
3. **Markdown por página** - Proporciona versiones `.md` de páginas
4. **Multiidioma** - Crea archivos específicos por idioma
5. **Mantener actualizado** - Genera dinámicamente o rebuild en cambios de contenido

El estándar llms.txt está emergiendo como una forma de hacer sitios web más accesibles para sistemas de IA. Implementarlo ahora asegura que tu contenido esté listo para la web integrada con IA.
