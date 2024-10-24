import { expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ContactForm from '@components/contactform.astro';

test('Contact Form works', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ContactForm);
  const document = window.document;
  document.body.innerHTML = result;

  const el=document.querySelector('form')
  expect(el).toBeTruthy();
  expect(el?.method).toBe('POST');
  expect(result).toContain('action="https://api.web3forms.com/submit"');
  expect(result).toContain('name="botcheck"');
});