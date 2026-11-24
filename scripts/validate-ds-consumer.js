#!/usr/bin/env node
/**
 * BPL DS consumer validation (rules E1–E3 from https://ds.bepartnerlabs.com/CfRs.md).
 * Based on https://ds.bepartnerlabs.com/validate-consumer-template.md, adapted to
 * this project: CSS also lives in <style> blocks of .astro/.svelte/.vue files, and
 * templates use Astro/Svelte attribute syntax (style={…}).
 *
 * Run: node scripts/validate-ds-consumer.js
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SRC = 'src'
const SKIP_DIRS = new Set(['content', 'icons', 'example-components'])
const CSS_EXT = ['.css']
const COMPONENT_EXT = ['.astro', '.svelte', '.vue', '.tsx', '.jsx', '.html']
// :root may hold Level 1 tokens: the DS surface (--bp-*) and this site's own
// brand namespace (--site-*), per the "prefix override" pattern in AGENTS.md.
const ROOT_TOKEN_PREFIXES = ['--bp-', '--site-']

let violations = 0

function report(rule, file, line, detail) {
  console.error(`[${rule}] ${relative(ROOT, file)}:${line} — ${detail}`)
  violations++
}

function walk(dir) {
  let files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) files = files.concat(walk(full))
    } else {
      files.push(full)
    }
  }
  return files
}

/** Returns [lineNumber, text] pairs that are CSS (whole file, or inside <style>). */
function cssLines(file, lines) {
  if (CSS_EXT.some(ext => file.endsWith(ext))) return lines.map((l, i) => [i + 1, l])
  const out = []
  let inStyle = false
  lines.forEach((l, i) => {
    if (/<style[\s>]/.test(l)) inStyle = true
    if (inStyle) out.push([i + 1, l])
    if (/<\/style>/.test(l)) inStyle = false
  })
  return out
}

// E1 — never modify .bp-* classes directly (any selector whose last compound targets .bp-*)
function checkE1(file, css) {
  for (const [n, l] of css) {
    if (!l.includes('{') || l.trim().startsWith('/*') || l.trim().startsWith('*')) continue
    const selector = l.split('{')[0]
    for (const part of selector.split(',')) {
      const last = part.trim().split(/\s+|>|\+|~/).pop() ?? ''
      if (/\.bp-[a-z]/.test(last) || /:global\([^)]*\.bp-/.test(part)) {
        report('E1', file, n, `.bp-* class styled directly — use a wrapper class + component tokens: ${l.trim()}`)
        break
      }
    }
  }
}

// E2 — no Level 2 (component) tokens on :root
function checkE2(file, css) {
  let inRoot = false
  for (const [n, l] of css) {
    if (/(^|\s|:global\()\:root\b[^{]*\{/.test(l)) inRoot = true
    if (inRoot) {
      for (const [, name] of l.matchAll(/(--[a-z][\w-]*)\s*:/g)) {
        if (!ROOT_TOKEN_PREFIXES.some(p => name.startsWith(p))) {
          report('E2', file, n, `Component token ${name} set on :root — use a scoped selector`)
        }
      }
    }
    if (inRoot && l.includes('}')) inRoot = false
  }
}

// E3 — no inline style on DS elements (style="…" or style={…} on a tag with a bp- class).
// Scans whole tags, so multi-line opening tags are covered.
function checkE3(file, text) {
  const tagRe = /<[a-zA-Z][\w-]*\b(?:[^>"'{]|"[^"]*"|'[^']*'|\{[^}]*\})*>/g
  for (const match of text.matchAll(tagRe)) {
    const tag = match[0]
    if (/\bclass(Name)?=["'{][^"'}]*\bbp-[a-z]/.test(tag) && /\sstyle=["'{]/.test(tag)) {
      const line = text.slice(0, match.index).split('\n').length
      report('E3', file, line, `Inline style on a DS element — use a BEM modifier or component token: ${tag.split('\n')[0].trim()}`)
    }
  }
}

for (const file of walk(join(ROOT, SRC))) {
  const isCss = CSS_EXT.some(ext => file.endsWith(ext))
  const isComponent = COMPONENT_EXT.some(ext => file.endsWith(ext))
  if (!isCss && !isComponent) continue
  const text = readFileSync(file, 'utf8')
  const lines = text.split('\n')
  const css = cssLines(file, lines)
  checkE1(file, css)
  checkE2(file, css)
  if (isComponent) checkE3(file, text)
}

if (violations === 0) {
  console.log('✓ validate-ds-consumer: all checks passed')
  process.exit(0)
} else {
  console.error(`\n✗ validate-ds-consumer: ${violations} violation(s) found`)
  process.exit(1)
}
