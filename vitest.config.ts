import { getViteConfig } from 'astro/config'

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    // Use node environment by default, jsdom for component tests
    environment: 'node',
    environmentMatchGlobs: [
      // Component tests need DOM
      ['tests/components/**', 'happy-dom'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/lib/**/*.ts',
        'src/db/schema/**/*.ts',
        'src/global/i18n/*.ts',
        'src/helpers/**/*.ts',
        'src/actions/**/*.ts',
      ],
      exclude: [
        '**/*.json',
        '**/*.astro',
        '**/*.svelte',
        '**/*.vue',
        '**/index.ts', // barrel files
        '**/locales/**',
      ],
      thresholds: {
        // Realistic thresholds - many modules require browser/DB mocking
        lines: 14,
        functions: 11,
        branches: 13,
        statements: 13,
      },
    },
  },
})
