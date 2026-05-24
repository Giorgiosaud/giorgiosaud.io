/**
 * Post-build script: scans dist/client HTML files, extracts inline scripts,
 * generates SHA-256 hashes, and injects them into:
 *   - vercel.json (committed, used for header key/value template)
 *   - .vercel/output/config.json (used by Vercel at deploy time)
 *
 * Run after `astro build` — wired into the build script in package.json.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const VERCEL_JSON = join(process.cwd(), 'vercel.json')
const VERCEL_OUTPUT_CONFIG = join(process.cwd(), '.vercel/output/config.json')
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
    if (/\ssrc=/.test(tag)) continue
    if (/type=["']application\/ld\+json["']/.test(tag)) continue
    const content = m[1].trim()
    if (content) scripts.push(content)
  }
  return scripts
}

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('base64')
}

// Collect hashes from built HTML
const htmlFiles = collectHtmlFiles(DIST_DIR)
const hashSet = new Set<string>()
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf-8')
  for (const script of extractInlineScripts(html)) {
    hashSet.add(`'sha256-${sha256(script)}'`)
  }
}
const hashes = [...hashSet].sort()
console.log(`Found ${hashes.length} unique hashes across ${htmlFiles.length} HTML files`)

// Build the script-src value with hashes
const scriptSrc = [
  "'self'",
  ...hashes,
  'https://www.googletagmanager.com',
  'https://cdn.jsdelivr.net',
  'https://challenges.cloudflare.com',
  'https://static.cloudflareinsights.com',
].join(' ')

// Read the base CSP value from vercel.json (source of truth for other directives)
const vercel = JSON.parse(readFileSync(VERCEL_JSON, 'utf-8'))
const cspEntry = vercel.headers[0].headers.find(
  (h: { key: string }) =>
    h.key === 'Content-Security-Policy' ||
    h.key === 'Content-Security-Policy-Report-Only',
)
if (!cspEntry) {
  console.error('No CSP header found in vercel.json')
  process.exit(1)
}

const cspValue = cspEntry.value.replace(/script-src\s+[^;]+;/, `script-src ${scriptSrc};`)

// Update vercel.json (for pre-push reference and local preview)
cspEntry.value = cspValue
writeFileSync(VERCEL_JSON, `${JSON.stringify(vercel, null, 2)}\n`)
console.log('vercel.json updated')

// Patch .vercel/output/config.json so Vercel uses build-time hashes at deploy
if (existsSync(VERCEL_OUTPUT_CONFIG)) {
  const config = JSON.parse(readFileSync(VERCEL_OUTPUT_CONFIG, 'utf-8'))

  // Remove any existing CSP header route we previously injected
  config.routes = config.routes.filter(
    (r: { src?: string }) => r.src !== '^/(.*)$' || !('headers' in r) ||
      !Object.keys((r as { headers: Record<string, string> }).headers).some(k =>
        k.toLowerCase().includes('content-security-policy'),
      ),
  )

  // Prepend a catch-all route that sets the CSP header on every response
  config.routes.unshift({
    src: '^/(.*)',
    headers: { [cspEntry.key]: cspValue },
    continue: true,
  })

  writeFileSync(VERCEL_OUTPUT_CONFIG, `${JSON.stringify(config, null, 2)}\n`)
  console.log('.vercel/output/config.json updated — hashes match this build')
} else {
  console.log('.vercel/output/config.json not found — skipping (run after astro build)')
}
