/**
 * Post-build script: detect newly published posts and broadcast push notifications.
 *
 * Compares current EN+ES posts against .post-manifest.json (committed to repo).
 * For each new pair, sends an EN notification to EN subscribers and an ES one to ES subscribers.
 * Updates the manifest after a successful broadcast.
 *
 * Requires SITE_URL and NOTIFY_SECRET env vars (or BETTER_AUTH_SECRET as fallback).
 * Call via: bun scripts/notifyNewPosts.ts
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { glob } from 'node:fs/promises'

const ROOT = resolve(import.meta.dir, '..')
const MANIFEST_PATH = resolve(ROOT, '.post-manifest.json')
const SITE_URL = process.env.SITE_URL || process.env.BETTER_AUTH_URL || 'https://www.giorgiosaud.io'
const SECRET = process.env.NOTIFY_SECRET || process.env.BETTER_AUTH_SECRET || ''

interface Manifest {
  notified: string[]
}

interface FrontmatterMeta {
  slug: string
  title: string
  excerpt?: string
  draft?: boolean
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const result: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim().replace(/^['"]|['"]$/g, '')
    result[key] = value
  }
  return result
}

async function collectPosts(pattern: string): Promise<FrontmatterMeta[]> {
  const posts: FrontmatterMeta[] = []
  for await (const file of glob(pattern, { cwd: ROOT })) {
    const content = readFileSync(resolve(ROOT, file), 'utf-8')
    const fm = parseFrontmatter(content)
    if (fm.draft === 'true') continue
    const slug = fm.selfHealing || file.replace(/.*\//, '').replace(/\.mdx?$/, '')
    posts.push({
      slug,
      title: fm.title || slug,
      excerpt: fm.description,
    })
  }
  return posts
}

async function main() {
  const manifest: Manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'))
  const notified = new Set(manifest.notified)

  const [enPosts, esPosts] = await Promise.all([
    collectPosts('src/content/notes/en/**/*.{md,mdx}'),
    collectPosts('src/content/notas/es/**/*.{md,mdx}'),
  ])

  const esBySlug = new Map(esPosts.map(p => [p.slug, p]))

  let sent = 0

  for (const en of enPosts) {
    if (notified.has(en.slug)) continue

    const es = esBySlug.get(en.slug)
    if (!es) {
      console.log(`[notify] Skipping ${en.slug} — no ES counterpart found`)
      notified.add(en.slug)
      continue
    }

    console.log(`[notify] Broadcasting new post: ${en.slug}`)

    const res = await fetch(`${SITE_URL}/api/push/broadcast.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-notify-secret': SECRET,
      },
      body: JSON.stringify({
        type: 'new-post',
        postSlug: en.slug,
        postTitle: en.title,
        postExcerpt: en.excerpt,
        postSlugEs: es.slug,
        postTitleEs: es.title,
        postExcerptEs: es.excerpt,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      console.log(`[notify] Sent to ${data.result?.sent ?? 0} subscriber(s)`)
      notified.add(en.slug)
      sent++
    } else {
      const err = await res.text()
      console.error(`[notify] Broadcast failed (${res.status}): ${err}`)
    }
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify({ notified: [...notified] }, null, 2) + '\n')
  console.log(`[notify] Done. ${sent} new post(s) notified.`)
}

main().catch(err => {
  console.error('[notify] Fatal:', err)
  process.exit(1)
})
