import { expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Container from '@components/container.astro';

test('Container with slots', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Container, {
    slots: {
      default: 'Hola',
    },
  });
  const document=new DOMParser().parseFromString(result, 'text/html');
  const el=document.querySelector('.max-w-4xl')
  expect(el?.classList).toContain('mx-auto');
  expect(el?.classList).toContain('max-w-4xl');
  expect(el?.classList).toContain('px-5');
});