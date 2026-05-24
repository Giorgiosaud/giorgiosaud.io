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

---

## Por qué este sitio todavía está en modo Report-Only

El CSP está implementado correctamente — pero lo mantengo en Report-Only porque el edge de Cloudflare ocasionalmente inyecta scripts que no controlo. Incluso con Bot Fight Mode deshabilitado, otras features de Cloudflare pueden inyectar scripts inline que cambian por request y no se pueden pre-hashear.

El plan para aplicar cumplimiento:

1. Confirmar que todas las inyecciones de Cloudflare están deshabilitadas
2. Consola del navegador limpia en todos los tipos de página
3. Cambiar la key de `Content-Security-Policy-Report-Only` a `Content-Security-Policy`

La infraestructura está lista — es un cambio de una línea cuando llegue el momento.

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
