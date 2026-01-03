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
  },
})
