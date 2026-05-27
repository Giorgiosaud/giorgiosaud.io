import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const configPath = join(root, '.vercel/output/config.json')

const config = JSON.parse(await readFile(configPath, 'utf-8'))

const selfhealRoutes = [
  { src: '^/notebook/[^/]+-[b-df-hj-np-tv-z]{6}/?$', dest: '_render' },
  { src: '^/es/cuaderno/[^/]+-[b-df-hj-np-tv-z]{6}/?$', dest: '_render' },
]

// Insert after handle:filesystem but before the status:404 catch-all
const catchAllIndex = config.routes.findIndex(
  (r: { src?: string; status?: number }) => r.status === 404 && r.src?.includes('.*'),
)

if (catchAllIndex === -1) {
  console.log('[patch-vercel-routes] catch-all not found, appending routes')
  config.routes.push(...selfhealRoutes)
} else {
  config.routes.splice(catchAllIndex, 0, ...selfhealRoutes)
  console.log(`[patch-vercel-routes] inserted ${selfhealRoutes.length} routes before catch-all (index ${catchAllIndex})`)
}

await writeFile(configPath, JSON.stringify(config, null, 2))
