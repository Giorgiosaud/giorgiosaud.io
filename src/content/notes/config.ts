import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { noteSchema } from '../schemas/noteSchema'

export const notes = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.(md|mdx)',
    base: './src/content/notes/en',
  }),
  schema: noteSchema,
})

export const notas = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.(md|mdx)',
    base: './src/content/notes/es',
  }),
  schema: noteSchema,
})

export default {
  notas,
  notes,
}
