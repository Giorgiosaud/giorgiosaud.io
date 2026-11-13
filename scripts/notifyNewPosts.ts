/**
 * Post-build script: detect newly published posts and broadcast push notifications.
 *
 * A post is announced at most once. Candidates are EN posts with an ES counterpart
 * (same selfHealing code) that are not in .post-manifest.json. Each candidate is
 * checked against the live site before sending:
 *   - 404 → not deployed yet → new → broadcast
 *   - 200 → already live, so an earlier deploy announced it → record it, skip
 *   - anything else → unknown → skip without recording (retried next run)
 * The live check is what keeps CI from re-announcing on every deploy: the manifest
 * written on a CI runner is never committed, so it cannot be the only record.
 *
 * Broadcasting only happens when NOTIFY_SECRET is set explicitly (the deploy
 * workflow sets it). Without it, or with --dry-run, the script only reports what
 * it would send and leaves the manifest untouched, so local builds never push.
 *
 * Usage: bun scripts/notifyNewPosts.ts [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const MANIFEST_PATH = resolve(ROOT, '.post-manifest.json')

export interface PostMeta {
  slug: string
  title: string
  excerpt?: string
}

export type Decision =
  | { action: 'broadcast'; en: PostMeta; es: PostMeta }
  | { action: 'record'; slug: string; reason: string }
  | { action: 'skip'; slug: string; reason: string }

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const result: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    const value = line
      .slice(colon + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
    result[key] = value
  }
  return result
}

async function collectPosts(pattern: string): Promise<PostMeta[]> {
  const posts: PostMeta[] = []
  for await (const file of glob(pattern, { cwd: ROOT })) {
    const fm = parseFrontmatter(readFileSync(resolve(ROOT, file), 'utf-8'))
    if (fm.draft === 'true') continue
    const slug =
      fm.selfHealing ||
      file
        .replace(/.*\//, '')
        .replace(/\.mdx?$/, '')
    posts.push({ slug, title: fm.title || slug, excerpt: fm.description })
  }
  return posts
}

/** Decides what to do with each post. Pure apart from the injected fetch. */
export async function planNotifications(
  enPosts: PostMeta[],
  esPosts: PostMeta[],
  notified: Set<string>,
  siteUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Decision[]> {
  const esBySlug = new Map(esPosts.map(p => [p.slug, p]))
  const decisions: Decision[] = []

  for (const en of enPosts) {
    if (notified.has(en.slug)) continue

    const es = esBySlug.get(en.slug)
    if (!es) {
      // Not recorded: once the ES version lands, the pair is announced.
      decisions.push({
        action: 'skip',
        slug: en.slug,
        reason: 'no ES counterpart yet',
      })
      continue
    }

    let status: number
    try {
      const res = await fetchImpl(`${siteUrl}/notebook/${en.slug}/`, {
        method: 'HEAD',
        redirect: 'follow',
      })
      status = res.status
    } catch (err) {
      decisions.push({
        action: 'skip',
        slug: en.slug,
        reason: `live check failed: ${err instanceof Error ? err.message : String(err)}`,
      })
      continue
    }

    if (status === 404) decisions.push({ action: 'broadcast', en, es })
    else if (status === 200)
      decisions.push({
        action: 'record',
        slug: en.slug,
        reason: 'already live on the site',
      })
    else
      decisions.push({
        action: 'skip',
        slug: en.slug,
        reason: `live check returned HTTP ${status}`,
      })
  }

  return decisions
}

async function main() {
  const siteUrl = process.env.SITE_URL || 'https://www.giorgiosaud.io'
  const secret = process.env.NOTIFY_SECRET || ''
  const dryRun = process.argv.includes('--dry-run') || secret === ''
  if (dryRun)
    console.log(
      `[notify] Dry run (${secret ? '--dry-run' : 'NOTIFY_SECRET not set'}): nothing will be sent or recorded.`,
    )

  const manifest: { notified: string[] } = JSON.parse(
    readFileSync(MANIFEST_PATH, 'utf-8'),
  )
  const notified = new Set(manifest.notified)

  const [enPosts, esPosts] = await Promise.all([
    collectPosts('src/content/notes/en/**/*.{md,mdx}'),
    collectPosts('src/content/notes/es/**/*.{md,mdx}'),
  ])

  const decisions = await planNotifications(
    enPosts,
    esPosts,
    notified,
    siteUrl,
  )

  let sent = 0
  for (const decision of decisions) {
    if (decision.action === 'skip') {
      console.log(`[notify] Skipping ${decision.slug}: ${decision.reason}`)
      continue
    }
    if (decision.action === 'record') {
      console.log(
        `[notify] Recording ${decision.slug} without sending: ${decision.reason}`,
      )
      notified.add(decision.slug)
      continue
    }

    const { en, es } = decision
    if (dryRun) {
      console.log(`[notify] Would broadcast: ${en.slug} (${en.title})`)
      continue
    }

    console.log(`[notify] Broadcasting new post: ${en.slug}`)
    const res = await fetch(`${siteUrl}/api/push/broadcast.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-notify-secret': secret,
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
      console.error(
        `[notify] Broadcast failed (${res.status}): ${await res.text()}`,
      )
    }
  }

  if (!dryRun)
    writeFileSync(
      MANIFEST_PATH,
      `${JSON.stringify({ notified: [...notified] }, null, 2)}\n`,
    )
  console.log(`[notify] Done. ${sent} new post(s) notified.`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]))
  main().catch(err => {
    console.error('[notify] Fatal:', err)
    process.exit(1)
  })
