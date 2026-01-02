#!/usr/bin/env bun
/**
 * Self-Healing Code Generator CLI
 *
 * Generates valid 6-character consonant-only codes for notes frontmatter.
 * These codes enable URL stability when slugs change.
 *
 * Usage:
 *   bun run generate:selfheal "My Post Title"
 *   bun run generate:selfheal --validate "rhythm"
 */

const SELF_HEALING_REGEX = /^[^aeiouAEIOU-]{6}$/

/**
 * Generate a self-healing code from a title.
 * Extracts consonants and pads with 'x' if needed.
 */
export function generateSelfHealingCode(title: string): string {
  // Remove vowels, spaces, dashes, and special characters
  const consonants = title
    .toLowerCase()
    .replace(/[aeiou\s\-_.,!?'"()[\]{}]/g, '')
    .replace(/[^a-z0-9]/g, '')

  // Take first 6 characters, pad with 'x' if needed
  const code = consonants.slice(0, 6).padEnd(6, 'x')

  return code
}

/**
 * Validate if a code is a valid self-healing code.
 */
export function isValidSelfHealingCode(code: string): boolean {
  return SELF_HEALING_REGEX.test(code)
}

/**
 * Generate multiple unique codes from a title.
 * Useful when the default code is already taken.
 */
export function generateAlternativeCodes(title: string, count = 5): string[] {
  const codes: string[] = []
  const baseConsonants = title
    .toLowerCase()
    .replace(/[aeiou\s\-_.,!?'"()[\]{}]/g, '')
    .replace(/[^a-z0-9]/g, '')

  // Add the primary code
  const primary = baseConsonants.slice(0, 6).padEnd(6, 'x')
  codes.push(primary)

  // Generate alternatives by using different parts of the consonants
  for (let i = 1; i < count && codes.length < count; i++) {
    const offset = i
    const alt = baseConsonants.slice(offset, offset + 6).padEnd(6, 'x')
    if (!codes.includes(alt)) {
      codes.push(alt)
    }
  }

  // Add random suffix variations if needed
  const suffixes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  for (const suffix of suffixes) {
    if (codes.length >= count) break
    const withSuffix = primary.slice(0, 5) + suffix
    if (!codes.includes(withSuffix) && isValidSelfHealingCode(withSuffix)) {
      codes.push(withSuffix)
    }
  }

  return codes.slice(0, count)
}

// CLI handling
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
Self-Healing Code Generator

Usage:
  bun run generate:selfheal "My Post Title"     Generate code from title
  bun run generate:selfheal --validate "code"   Validate a code
  bun run generate:selfheal --alts "Title"      Generate alternative codes

Examples:
  bun run generate:selfheal "Understanding React Hooks"
  → Output: ndrstd

  bun run generate:selfheal --validate "rhythm"
  → Output: ✓ Valid self-healing code
`)
    process.exit(0)
  }

  if (args[0] === '--validate' && args[1]) {
    const code = args[1]
    const isValid = isValidSelfHealingCode(code)
    if (isValid) {
      console.log(`✓ "${code}" is a valid self-healing code`)
    } else {
      console.log(`✗ "${code}" is NOT valid`)
      console.log('  Requirements: 6 characters, no vowels (aeiouAEIOU), no dashes')
    }
    process.exit(isValid ? 0 : 1)
  }

  if (args[0] === '--alts' && args[1]) {
    const title = args[1]
    const codes = generateAlternativeCodes(title)
    console.log(`Alternative codes for "${title}":`)
    codes.forEach((code, i) => {
      console.log(`  ${i + 1}. ${code}`)
    })
    process.exit(0)
  }

  // Default: generate code from title
  const title = args.join(' ')
  const code = generateSelfHealingCode(title)
  const isValid = isValidSelfHealingCode(code)

  console.log(`Title: "${title}"`)
  console.log(`Code:  ${code}`)
  console.log(`Valid: ${isValid ? '✓' : '✗'}`)

  if (!isValid) {
    console.log('\nNote: Generated code is not valid. Try a different title or use --alts for alternatives.')
    const alts = generateAlternativeCodes(title)
    console.log('Alternatives:', alts.join(', '))
  }

  console.log(`\nFrontmatter:`)
  console.log(`selfHealing: "${code}"`)
}

main()
