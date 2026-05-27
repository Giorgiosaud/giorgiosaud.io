import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const sub = await getMarkdownFiles(join(dir, entry.name))
        files.push(...sub)
      } else if (entry.name.match(/\.(md|mdx)$/)) {
        files.push(join(dir, entry.name))
      }
    }
  } catch {
    // dir doesn't exist
  }
  return files
}

function extractSelfHealing(raw: string): string | undefined {
  const match = raw.match(/^selfHealing:\s*["']?([^"'\s]+)["']?/m)
  return match?.[1]
}

const map: Record<string, string> = {}

const enDir = join(root, 'src/content/notes/en')
const esDir = join(root, 'src/content/notes/es')

const [enFiles, esFiles] = await Promise.all([
  getMarkdownFiles(enDir),
  getMarkdownFiles(esDir),
])

for (const filePath of enFiles) {
  const raw = await readFile(filePath, 'utf-8')
  const code = extractSelfHealing(raw)
  if (code) {
    const slug = filePath.replace(enDir + '/', '').replace(/\.(md|mdx)$/, '')
    map[code] = `/notebook/${slug}`
  }
}

for (const filePath of esFiles) {
  const raw = await readFile(filePath, 'utf-8')
  const code = extractSelfHealing(raw)
  if (code) {
    const slug = filePath.replace(esDir + '/', '').replace(/\.(md|mdx)$/, '')
    map[`es:${code}`] = `/es/cuaderno/${slug}`
  }
}

const outDir = join(root, 'src/generated')
await mkdir(outDir, { recursive: true })
await writeFile(join(outDir, 'selfheal-map.json'), JSON.stringify(map, null, 2))

console.log(`[selfheal-map] wrote ${Object.keys(map).length} entries`)
