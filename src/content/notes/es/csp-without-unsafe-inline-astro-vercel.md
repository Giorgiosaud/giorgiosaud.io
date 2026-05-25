---
draft: false
selfHealing: "cspwth"
starred: false
title: "CSP Sin unsafe-inline en Astro + Vercel"
description: "Cómo eliminar unsafe-inline de tu Content Security Policy en un sitio Astro desplegado en Vercel, usando hashes SHA-256 generados automáticamente en el build — y todos los errores que cometí en el camino."
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

Estaba auditando los headers de seguridad de este sitio y me di cuenta de que mi `script-src` tenía `'unsafe-inline'`. Esa directiva hace inútil casi toda la protección contra XSS — cualquier script inline se ejecuta, incluidos los que un atacante inyectó. El problema: Astro genera scripts inline por todos lados y no quería agregar middleware solo para manejar nonces.

Los hashes resultaron ser el enfoque correcto para un sitio mayormente estático. Pero llegar ahí no fue camino recto. Este post cubre la implementación completa *y* cada error que cometí en producción.

## Qué inlinea Astro y por qué es molesto

Astro genera varios tipos de tags `<script>` inline en el HTML final:

- **Stubs de hidratación de islands** — scripts pequeños que cargan lazy `client:idle`, `client:visible`
- **Bloques `define:vars`** — scripts inline que pasan variables del servidor al cliente
- **Speculation Rules** — `<script type="speculationrules">` para hints de prerender
- **Tus propios scripts inline** — cualquier cosa escrita directamente en un archivo `.astro`

No podés hardcodear hashes manualmente porque el contenido de `define:vars` cambia por página. La solución es generarlos desde el output del build automáticamente.

## La arquitectura

Dos piezas: un archivo de configuración que es la fuente de verdad para todas las directivas CSP, y un script de build que escanea el HTML output, computa hashes, y escribe la política final en `vercel.json`.

### 1. Archivo de config: `src/config/csp.ts`

Acá van todas las directivas editables por humanos. Agregar un dominio en este archivo se refleja automáticamente en el próximo push — sin ediciones manuales de `vercel.json`.

```typescript
export const cspPolicy = {
  'default-src': ["'self'"],
  'script-src': {
    static: ["'self'"],
    externalDomains: [
      'https://www.googletagmanager.com',
      'https://cdn.jsdelivr.net',
      'https://challenges.cloudflare.com',
      'https://static.cloudflareinsights.com',
    ],
    // hashes inyectados en build time
  },
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:',
    'https://platform.linkedin.com',
    'https://developers.google.com',
  ],
  'connect-src': ["'self'",
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
  ],
  'worker-src': ["'self'", 'blob:'],
  'frame-src': ['https://challenges.cloudflare.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
} as const
```

### 2. Generador de hashes: `scripts/generateCspHashes.ts`

Se ejecuta después de `astro build`. Escanea cada archivo HTML, extrae scripts inline, computa hashes SHA-256, y construye el string CSP completo desde el config. El script itera dinámicamente sobre todas las claves de `cspPolicy` — agregar una nueva directiva al config la incluye automáticamente en el CSP sin cambiar el script.

### 3. Conectarlo al build

```json
{
  "scripts": {
    "build": "astro build && bun scripts/generateCspHashes.ts"
  }
}
```

### 4. Hook pre-push para que los hashes nunca queden desactualizados

`.husky/pre-push`:

```bash
bun run test
bun run build
git diff --exit-code vercel.json || (git add vercel.json && git commit -m "chore(security): update CSP hashes [pre-push]")
```

Si `vercel.json` cambió después del build, el hook hace commit automático de los hashes actualizados antes del push.

### 5. Empezar en modo Report-Only

```json
{
  "key": "Content-Security-Policy-Report-Only",
  "value": "default-src 'self'; script-src 'self' 'sha256-...' ...;"
}
```

Navegá por todos los tipos de página, revisá la consola buscando violations. Una vez limpio, cambiá la key a `Content-Security-Policy` para hacer cumplir.

---

## Errores que cometí

### Error 1: Dos headers CSP — toda la protección desaparece

Mi primer intento modificaba tanto `vercel.json` como `.vercel/output/config.json`. Cuando dos respuestas incluyen el mismo header CSP, los navegadores **intersectan** todas las políticas. La intersección de mi lista de hashes con el default del adapter (`'unsafe-inline' 'unsafe-eval'`) produjo un `script-src` inútil y un `connect-src 'none'` que bloqueó todo.

**Fix**: Solo modificar `vercel.json`. Nunca tocar `.vercel/output/config.json`.

### Error 2: Hacer trim del contenido antes de hashear

```typescript
const content = m[1].trim()  // ❌ incorrecto
```

El navegador computa el hash sobre los **bytes raw** del contenido — incluyendo whitespace y newlines. Hacer trim produce un hash que nunca coincide. Esto rompió `<script type="speculationrules">`.

```typescript
const raw = m[1]             // ✅ correcto
if (raw.trim()) scripts.push(raw)
```

### Error 3: `'strict-dynamic'` rompe los scripts externos en sitios estáticos

`'strict-dynamic'` hace irrelevantes las listas de hosts. `'self'` deja de funcionar. Los scripts cargados via `<script src="...">` en el HTML ya no son confiables a menos que tengan un nonce o hash. En un sitio estático sin nonces, esto bloquea todos tus scripts externos — incluyendo todos los `/_astro/*.js`.

`'strict-dynamic'` está diseñado para CSP basado en nonces con un servidor que genera nonces por request. No funciona con el enfoque de hashes + lista de hosts.

**Fix**: No usar `'strict-dynamic'` en sitios estáticos.

### Error 4: `require-trusted-types-for 'script'` rompe GTM

GTM usa `innerHTML` y otros DOM sinks internamente y no soporta Trusted Types. Si se aplica esta directiva, el analytics se rompe.

**Fix**: No usar `require-trusted-types-for` a menos que todos los scripts de terceros soporten Trusted Types.

### Error 5: Cloudflare Bot Fight Mode inyecta scripts no hasheables

Con Bot Fight Mode habilitado, Cloudflare inyecta un script de challenge con un token dinámico por request. El hash cambia en cada request — nunca podés pre-computarlo.

**Fix**: Deshabilitar Bot Fight Mode en Cloudflare (Security → Bots → Bot Fight Mode → Off).

### Error 6: El "monitoreo continuo de scripts" de Cloudflare inyecta un segundo header CSP

Después de deshabilitar Bot Fight Mode, seguía con una pared de violations CSP en la consola. Cada una era un falso positivo — scripts que ya había permitido. La causa fue una feature completamente diferente de Cloudflare: **Continuous script monitoring** (en Security → Detection).

Cuando está habilitado, Cloudflare inyecta su propio header `Content-Security-Policy-Report-Only` a nivel del edge:

```
Content-Security-Policy-Report-Only: script-src 'unsafe-inline' 'unsafe-eval';
  connect-src 'none';
  report-uri https://csp-reporting.cloudflare.com/cdn-cgi/script_monitor/report
```

Esto es separado de Page Shield y de Bot Fight Mode. Dos headers `Content-Security-Policy-Report-Only` en la misma respuesta hacen que el navegador evalúe cada política de forma independiente y reporte violations contra *cada una*. La política inyectada por Cloudflare tiene `connect-src 'none'` — entonces cada llamada a analytics, cada request a una API, cada carga de fuente parece una violation. La consola se llena de cientos de falsos positivos que no tienen nada que ver con tu CSP real.

**Fix**: Deshabilitar Continuous script monitoring en Cloudflare → Security → Detection. No está en la sección Bots — buscalo bajo el tab Detection. Después de deshabilitarlo, las violations de esta política dejan de aparecer de inmediato.

Vale la pena saber esto porque "Bot Fight Mode deshabilitado → igual aparecen violations CSP" es un estado confuso. Las dos features son completamente independientes y hay que deshabilitarlas por separado.

### Error 7: El entorno de build de Vercel produce hashes de scripts diferentes a los del build local

Después de eliminar todo el ruido de Cloudflare, seguía viendo 2–4 hashes de violation en producción que mi `generateCspHashes.ts` local nunca producía. Ejemplo:

```
Refused to execute inline script because it violates the following Content Security Policy directive:
sha256-JlDKC/qsFRwOsca2/SKFPusSqV57tl1xIM6pb8K9mXI= was not found in script-src
```

La causa: el code-splitting de Vite produce diferentes límites de chunk en el entorno CI de Vercel que localmente. Cuando se agregan nuevas páginas, el grafo de chunks cambia, lo que cambia los hashes en algunos scripts inline generados. El build local refleja los hashes de chunks locales; el CI de Vercel refleja los suyos propios.

La solución es un array `buildEnvHashes` en `csp.ts` para fijar los hashes conocidos que solo Vercel produce:

```typescript
'script-src': {
  static: ["'self'"],
  buildEnvHashes: [
    "'sha256-BrDhGE1lwa85arfXcrBxSo+n37uVSX5CAROXnIM6Q+g='",
    "'sha256-kq+o1kpk7kk0Qt8m8OePmXS/+PA6WWL4ICxEtJomMro='",
    "'sha256-JlDKC/qsFRwOsca2/SKFPusSqV57tl1xIM6pb8K9mXI='",
    "'sha256-/M4Ej0rZL/4nqdav6qiQeduhvnTBq3GSJC+qCWeIoV4='",
  ],
  externalDomains: [...],
},
```

Y en `generateCspHashes.ts`, incluirlos en el string final:

```typescript
const scriptSrc = [
  ...cspPolicy['script-src'].static,
  ...hashes,                               // hashes del build local
  ...cspPolicy['script-src'].buildEnvHashes, // hashes del CI de Vercel
  ...cspPolicy['script-src'].externalDomains,
].join(' ')
```

**¿Cuándo cambian estos hashes?** Cuando agregás o eliminás páginas, o cambiás significativamente la composición del bundle JS, Vite re-divide los chunks y produce nuevos hashes. Verás nuevos hashes de violation aparecer en la consola del navegador después del deploy. El flujo de trabajo es:

1. Ver nuevos hashes de violation en la consola de producción
2. Agregar esos hashes a `buildEnvHashes` en `csp.ts`
3. Push — el hook pre-push regenera `vercel.json` automáticamente
4. Los hashes se estabilizan hasta el próximo cambio significativo de bundle

Es un poco manual, pero solo ocurre cuando el grafo de chunks cambia de forma significativa — no en cada push.

---

## Por qué este sitio ya está listo para enforcement

Después de todos los fixes, el CSP está completamente implementado y la consola está limpia. Lo que bloqueaba el enforcement:

- **Bot Fight Mode** ✅ deshabilitado
- **Continuous script monitoring** ✅ deshabilitado
- **Divergencia de hashes del entorno de build de Vercel** ✅ manejada via `buildEnvHashes`

El camino al enforcement ahora está despejado:

1. Deployar y verificar cero violations en todos los tipos de página
2. Cambiar `Content-Security-Policy-Report-Only` a `Content-Security-Policy` en `vercel.json`
3. Push

Ese último paso es un cambio de una línea. La infraestructura está lista.

## El resultado

Antes:
```
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com
```

Después:
```
script-src 'self' 'sha256-ncBTDHd...' [~150 hashes] https://www.googletagmanager.com ...;
```

Sin `'unsafe-inline'`, sin infraestructura de nonces, sin middleware. Los hashes se actualizan automáticamente en cada push.

---

## Comparación de estrategias con nonces

Cuando alguien dice "usá un nonce en vez de hashes" hay en realidad tres cosas distintas que puede significar — cada una con un perfil de seguridad diferente.

### Nonce por request (el estándar de oro)

El servidor genera un valor criptográficamente aleatorio en cada request HTTP y lo estampa en cada tag `<script>`. El header CSP incluye `'nonce-{valor}'`. El nonce es de uso único — es inútil después de que se envía la respuesta.

Es el enfoque más seguro pero requiere que el servidor renderice cada página en cada request. No es compatible con generación de sitios estáticos.

### Nonce rotativo por deploy (atajo tentador)

Se genera un único nonce aleatorio en build time y se hornea en todos los archivos HTML del sitio. Permanece válido hasta el próximo deploy, luego se genera uno nuevo.

Suena atractivo para sitios estáticos — más simple que escanear cada archivo HTML en busca de hashes. Pero tiene una debilidad fundamental: **el nonce es visible en el source HTML de cada página**. Cualquiera puede abrir view-source, leer el valor del nonce, e incluirlo en un script inyectado. Dentro de una ventana de deploy, el nonce no provee ninguna protección contra XSS — solo evita reutilizar nonces de deploys *anteriores*.

```html
<!-- el atacante lee esto de view-source -->
<script nonce="abc123">código legítimo</script>

<!-- el atacante inyecta esto en cualquier parte de la página -->
<script nonce="abc123">robar(document.cookie)</script>
```

### Hashes por script (lo que usa este sitio)

El contenido exacto de cada script inline se hashea en build time. Solo los scripts cuyo SHA-256 coincide con un hash en `script-src` pueden ejecutarse. Los hashes rotan en cada deploy automáticamente.

Un atacante que lee tus hashes del header CSP no gana nada — conocer `sha256-ncBTDHd...` no ayuda a inyectar un script diferente, porque el hash de un script diferente es un valor diferente.

### Comparación

| Estrategia | Rota | Visible para el atacante | Protege contra XSS | Funciona en sitios estáticos |
|---|---|---|---|---|
| Nonce por request | Cada request | Sí (en HTML) | ✅ Sí | ❌ No |
| Nonce por deploy | Cada deploy | Sí (en HTML) | ❌ No | ✅ Sí |
| Hashes por script | Cada deploy | Sí (en header CSP) | ✅ Sí | ✅ Sí |
| `'unsafe-inline'` | Nunca | — | ❌ No | ✅ Sí |

El nonce por deploy es lo peor de ambos mundos: tiene la complejidad operativa de un nonce (hay que estampar cada tag de script en build time) sin el beneficio de seguridad. Los hashes por script son estrictamente mejores para sitios estáticos — mismo ritmo de deploy, misma automatización, protección XSS real.

---

## Cuándo desistir del CSP

No todos los sitios deberían implementar un CSP estricto. Una evaluación honesta de cuándo parar y por qué.

**Desistir si dependés fuertemente de scripts de terceros que inyectan código inline.** GTM, Intercom, Hotjar, Drift, Zendesk — estas herramientas rutinariamente escriben tags `<script>` e `innerHTML` en runtime. No podés hashear scripts inyectados en runtime. Tendrías que whitelist dominios enteros con `'unsafe-inline'`, lo que anula el propósito.

**Desistir si tu CDN o proxy inyecta scripts que no podés deshabilitar.** Cloudflare Bot Fight Mode, Rocket Loader, ciertas reglas WAF — todas inyectan scripts inline en tu HTML a nivel del edge. Si tu contrato o requerimientos de seguridad impiden deshabilitarlos, los hashes pre-computados no funcionarán.

**Desistir si tu sitio usa SSR pesado con scripts inline verdaderamente dinámicos.** Si cada página renderiza contenido de script inline diferente por request (no solo `define:vars` con valores estables, sino datos dinámicos por usuario), necesitarías nonces — lo que requiere un middleware de Astro que genere un nonce en cada request y lo estampe en cada tag `<script>`. Es un cambio de arquitectura significativo.

**Desistir si tu equipo no controla el pipeline de deployment completo.** CSP enforcement en un sitio que no controlás totalmente (hosting compartido, CMS con ecosistema de plugins, equipo de marketing que agrega tags de GTM sin revisión) va a romper cosas en momentos impredecibles.

**No desistir solo porque es complejo.** Si controlás tu stack, no usás terceros que inyecten inline, y tenés un pipeline de build limpio, el enfoque de hashes funciona y el overhead de mantenimiento es esencialmente cero — está completamente automatizado después de la configuración inicial.

La prueba: si podés hacer que `Content-Security-Policy-Report-Only` muestre cero violations en todos tus tipos de página con un perfil de navegador limpio (sin extensiones), podés aplicar cumplimiento. Si las violations siguen apareciendo desde fuentes fuera de tu control, mantenelo en report-only o eliminalo y enfocate en otras capas de seguridad.
