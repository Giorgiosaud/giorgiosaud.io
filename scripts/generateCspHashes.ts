/**
 * Post-build script: scans dist/client HTML files, extracts inline scripts,
 * generates SHA-256 hashes, and updates vercel.json CSP script-src.
 *
 * Run after `bun run build` — added to the build script in package.json.
 */
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
  // Match <script> or <script type="speculationrules"> — anything without src=
  const scripts: string[] = []
  const re = /<script(?:\s[^>]*)?>([^<]+)<\/script>/gs
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const tag = m[0]
    // Skip scripts with src= attribute (external) and JSON-LD (data, not executable)
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

const htmlFiles = collectHtmlFiles(DIST_DIR)
const hashSet = new Set<string>()

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf-8')
  for (const script of extractInlineScripts(html)) {
    hashSet.add(`'sha256-${sha256(script)}'`)
  }
}

const hashes = [...hashSet].sort()
console.log(`Found ${hashes.length} unique inline script hashes across ${htmlFiles.length} HTML files`)

const vercel = JSON.parse(readFileSync(VERCEL_JSON, 'utf-8'))

const cspHeader = vercel.headers[0].headers.find(
  (h: { key: string }) =>
    h.key === 'Content-Security-Policy' ||
    h.key === 'Content-Security-Policy-Report-Only',
)

if (!cspHeader) {
  console.error('No CSP header found in vercel.json')
  process.exit(1)
}

// Replace script-src directive — remove 'unsafe-inline', inject hashes
const updated = cspHeader.value.replace(
  /script-src\s+[^;]+;/,
  `script-src 'self' ${hashes.join(' ')} https://www.googletagmanager.com https://cdn.jsdelivr.net https://challenges.cloudflare.com https://static.cloudflareinsights.com;`,
)

cspHeader.value = updated
writeFileSync(VERCEL_JSON, JSON.stringify(vercel, null, 2) + '\n')
console.log('vercel.json CSP updated — unsafe-inline removed, hashes injected')
