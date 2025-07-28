import { getCollection } from 'astro:content';
import type { AstroGlobal } from 'astro';

export async function selfHeal(Astro: AstroGlobal, collectionName: 'notes' | 'notas') {
  const notes = await getCollection(collectionName);
  const selfhealPath = Astro.params.selfheal;
  const selfHealRegex = /(?<=^|-)[^aeiouAEIOU-]{6}(?=-|$)/g;
  const selfHealing = selfhealPath?.match(selfHealRegex) || [];

  if (selfHealing.length) {
    for (const sh of selfHealing) {
      const note = notes.find((note) => note.data.selfHealing === sh);
      if (note) {
        const basePath = collectionName === 'notes' ? '/notebook' : '/es/cuaderno';
        return Astro.redirect(`${basePath}/${note.id}`, 301);
      }
    }
  }
  return null;
}