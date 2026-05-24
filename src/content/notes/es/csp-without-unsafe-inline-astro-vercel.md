---
draft: false
selfHealing: "cspwth"
starred: false
title: "CSP sin unsafe-inline en Astro + Vercel"
description: "Cómo eliminar unsafe-inline del Content Security Policy en un sitio Astro desplegado en Vercel, usando hashes SHA-256 generados automáticamente en build time — y los problemas que encontramos en el camino."
publishDate: 2026-05-24T00:00:00.000Z
category: security
author: giorgio-saud
collections:
  - security
  - frontend
tags:
  - security
  - csp
  - astro
  - vercel
cover: ../../../assets/images/csp-unsafe-inline-astro-vercel.png
coverAlt: "CSP sin unsafe-inline en Astro y Vercel"
lang: es
---

Estaba auditando los headers de seguridad de giorgiosaud.io y me di cuenta de que mi CSP tenía `'unsafe-inline'` en `script-src`. Esa es la directiva que hace inútil casi toda la protección contra XSS — cualquier script inline corre, incluidos los que un atacante haya inyectado. El problema: Astro genera scripts inline en todas partes y no quería agregar middleware solo para manejar nonces.

Los hashes resultaron ser la solución correcta para un sitio mayormente estático. Pero llegar ahí no fue un camino recto.

## Qué genera Astro inline y por qué es un problema

Astro genera varios tipos de etiquetas `<script>` inline en el HTML final:

- **Island hydration stubs** — scripts pequeños que cargan de forma diferida componentes `client:idle`, `client:visible`
- **Bloques `define:vars`** — scripts inline que pasan variables del servidor al cliente (slugs de posts, títulos, feature flags)
- **Speculation Rules** — `<script type="speculationrules">` para hints de prerenderizado
- **Tus propios scripts inline** — todo lo que escribas directamente en un archivo `.astro`

No se pueden hardcodear los hashes de `define:vars` manualmente porque el contenido cambia por página — cada post tiene un slug y título distinto incorporado. Habría que mantener cientos de hashes a mano.

La solución es generarlos automáticamente desde el output del build.

## El enfoque

Después de que `astro build` corre, cada página ya está renderizada en `dist/client`. Los scripts inline están ahí en el HTML. Escanea todos los archivos, extrae cada script inline, calcula su SHA-256, y escribe los hashes en `vercel.json`. Luego elimina `'unsafe-inline'`.

### El script

Crea `scripts/generateCspHashes.ts`:

```typescript
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const VERCEL_JSON = join(process.cwd(), 'vercel.json')
const DIST_DIR = join(process.cwd(), 'dist/client')

function collectHtmlFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...collectHtmlFiles(full))
    } else if (entry.endsWith('.html')) {
      files.push(full)
    }
  }
  return files
}

function extractInlineScripts(html: string): string[] {
  const scripts: string[] = []
  const re = /<script(?:\s[^>]*)?>([^<]+)<\/script>/gs
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const tag = m[0]
    if (/\ssrc=/.test(tag)) continue                           // omitir externos
    if (/type=["']application\/ld\+json["']/.test(tag)) continue // omitir JSON-LD
    const content = m[1].trim()
    if (content) scripts.push(content)
  }
  return scripts
}

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('base64')
}

const htmlFiles = collectHtmlFiles(DIST_DIR)
const hashSet = new Set<string>()

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf-8')
  for (const script of extractInlineScripts(html)) {
    hashSet.add(`'sha256-${sha256(script)}'`)
  }
}

const hashes = [...hashSet].sort()
console.log(`${hashes.length} hashes únicos en ${htmlFiles.length} archivos HTML`)

const vercel = JSON.parse(readFileSync(VERCEL_JSON, 'utf-8'))
const cspHeader = vercel.headers[0].headers.find(
  (h: { key: string }) =>
    h.key === 'Content-Security-Policy' ||
    h.key === 'Content-Security-Policy-Report-Only',
)

cspHeader.value = cspHeader.value.replace(
  /script-src\s+[^;]+;/,
  `script-src 'self' ${hashes.join(' ')} https://www.googletagmanager.com https://cdn.jsdelivr.net;`,
)

writeFileSync(VERCEL_JSON, JSON.stringify(vercel, null, 2) + '\n')
console.log('vercel.json actualizado — unsafe-inline eliminado')
```

### Integrarlo en el build

```json
{
  "scripts": {
    "build": "astro build && bun scripts/generateCspHashes.ts",
    "csp:hashes": "bun scripts/generateCspHashes.ts"
  }
}
```

### Hook pre-push para que nunca quede desactualizado

Agrega esto en `.husky/pre-push` para que los hashes se regeneren siempre antes de que el código llegue a Vercel:

```bash
bun run test
bun run build
bun run csp:hashes
git diff --exit-code vercel.json || (git add vercel.json && git commit -m "chore(security): update CSP hashes [pre-push]")
```

Si `vercel.json` cambió después del build (páginas nuevas, scripts modificados), el hook hace commit automáticamente con los hashes actualizados antes del push. Nunca llegan hashes viejos al servidor.

## Empezar en modo Report-Only

No apliques el CSP de inmediato. Usa primero `Content-Security-Policy-Report-Only` y observa las violaciones en la consola del navegador:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy-Report-Only",
          "value": "default-src 'self'; script-src 'self' 'sha256-...' ...;"
        }
      ]
    }
  ]
}
```

Navega el sitio, visita cada tipo de página, y revisa las violaciones. Una vez que la consola esté limpia, cambia la clave a `Content-Security-Policy` y aplica.

## Lo que salió mal en el camino

Aquí el post se pone honesto. Me topé con tres problemas distintos después de que la implementación inicial parecía funcionar.

### Problema 1: Dos headers CSP, toda la protección destruida

Mi primer intento parchaba dos archivos: `vercel.json` para la configuración del header, y `.vercel/output/config.json` (el archivo que el adaptador de Astro genera en build time) para inyectar los hashes ahí también.

Fue un error.

Cuando los dos archivos definen un header `Content-Security-Policy-Report-Only`, Vercel sirve **ambos**. Los navegadores no eligen uno — **intersectan** múltiples headers CSP: solo se permiten las directivas que satisfacen *todas* las políticas. El resultado fue un `script-src` que se redujo a `'unsafe-inline' 'unsafe-eval'` (la intersección de mi lista de hashes con el default del adaptador), y un `connect-src 'none'` que bloqueó todos los fetch de la página.

```
Refused to execute a script: 'unsafe-inline' appears in both policies
connect-src 'none' — no outbound connections allowed
```

La solución: **solo parchear `vercel.json`**. Nunca tocar `.vercel/output/config.json` — ese archivo le pertenece al adaptador y se regenera en cada build. Si escribís en él, vas a perder la carrera contra el adaptador.

### Problema 2: El proxy de Cloudflare inyectando su propio CSP

Antes de desactivar el proxy de Cloudflare (nube naranja → nube gris, enrutando el tráfico directamente a Vercel), la página de challenge de bots de Cloudflare inyectaba su propio CSP estricto en ciertas requests. Esto se manifestaba como violaciones de scripts que no eran míos.

Si usás Cloudflare delante de Vercel y ves errores de CSP que no podés explicar, verificá si el proxy está envolviendo las respuestas con sus propios headers. La challenge page (`/cdn-cgi/challenge-platform/`) opera bajo una política más estricta que entra en conflicto con cualquier CSP personalizado.

Solución: enrutar el tráfico directamente a Vercel, o configurar el nivel de seguridad de Cloudflare para evitar challenge pages en el contenido principal.

### Problema 3: Las páginas ISR producen hashes que no fueron pre-computados

Este es comportamiento esperado, pero vale entenderlo. El hook pre-push calcula hashes desde el output del build al momento del push. Las páginas generadas estáticamente (SSG) están completamente cocinadas — sus hashes son estables.

Las páginas ISR son distintas. Vercel las regenera según un schedule o on-demand después del deploy. Si el HTML regenerado contiene bloques `define:vars` con contenido diferente (un nuevo slug de post, metadata actualizada), esos hashes no van a estar en `vercel.json`.

En modo Report-Only vas a ver violaciones para esas páginas:

```
Refused to execute a script because its hash ... does not appear in the script-src directive
```

Esto no es un bug — es la limitación fundamental de los hashes pre-computados en contenido generado dinámicamente. Las opciones son:

1. **Aceptarlo en report-only** — las violaciones se registran pero nada se bloquea. Está bien mientras auditás.
2. **Convertir las páginas ISR a SSG** — regenerar el build estático completo en cada deploy. Deploys más lentos, pero CSP limpio.
3. **Usar nonces para las rutas ISR** — agregar middleware de Astro que genere un nonce por request para esas rutas específicas.

Para un sitio que es principalmente un blog, la opción 1 está bien. Los scripts inline en páginas ISR los genera Astro, no el usuario, así que el riesgo real de XSS es bajo.

## Algunas cosas a tener en cuenta

**La lista de hashes se hace larga.** Cada combinación única de `define:vars` produce un hash distinto. Un sitio con 100 posts puede terminar con más de 150 hashes en `script-src`. Está bien — el header se cachea y los navegadores lo manejan sin problemas.

**Las Speculation Rules también necesitan hash.** La etiqueta `<script type="speculationrules">` es tratada como ejecutable por la spec de CSP. El script de arriba lo maneja automáticamente ya que no filtra por `type`.

**Los service workers cachean los headers de respuesta.** Si un deploy anterior sirvió un CSP roto (como la situación de doble header de arriba), el service worker puede haber cacheado esas respuestas. Cambiar el nombre del cache del service worker fuerza un cache bust en la próxima carga.

**Esto solo cubre páginas SSG e ISR.** Si tenés páginas verdaderamente server-rendered que producen contenido de scripts inline diferente en cada request, sus hashes no se pueden pre-computar — necesitarías nonces desde middleware de Astro para esas rutas. Para páginas renderizadas estáticamente (que es la mayoría en Astro), los hashes funcionan perfecto.

## El resultado

Antes:

```
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com
```

Después:

```
script-src 'self' 'sha256-+78eXcH...' 'sha256-Ab3kpQ...' ... https://www.googletagmanager.com
```

Sin `'unsafe-inline'`, sin infraestructura de nonces, sin middleware. Solo un script que mantiene el allowlist honesto en cada push — y tres lecciones difíciles sobre qué se rompe cuando pensás que todo funciona.
