
import path from 'path'
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'happy-dom',
    alias: {
      '@': path.resolve(__dirname, './src'),
      "@lib": path.resolve(__dirname, './src/lib'),
      "@i18n": path.resolve(__dirname, './src/i18n'),
      "@utils": path.resolve(__dirname, './src/utils'),
      "@components": path.resolve(__dirname, './src/components'),
      "@layouts": path.resolve(__dirname, './src/layouts'),
      "@assets": path.resolve(__dirname, './src/assets'),
      "@pages": path.resolve(__dirname, './src/pages'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      "@lib": path.resolve(__dirname, './src/lib'),
      "@i18n": path.resolve(__dirname, './src/i18n'),
      "@utils": path.resolve(__dirname, './src/utils'),
      "@components": path.resolve(__dirname, './src/components'),
      "@layouts": path.resolve(__dirname, './src/layouts'),
      "@assets": path.resolve(__dirname, './src/assets'),
      "@pages": path.resolve(__dirname, './src/pages'),
    },
  },
});