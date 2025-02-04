import { expect, test,vi } from 'vitest';
import { getByLabelText, getByText } from '@testing-library/dom';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ContactForm from '@components/contactform.astro';

test('Contact Form works', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(ContactForm);
  const document = window.document;
  document.body.innerHTML = result;
// Mock the form submit event
    const mockSubmit = vi.fn((e) => {
      e.preventDefault(); // Prevent actual form submission
      const formData = new FormData(e.target); // Capture the form data
      const payload = Object.fromEntries(formData.entries());
      expect(payload).toEqual({
        "name": "jorge",
        "email": "jorge@gmail.com",
        "message": "hola"
      });

    });

  const el=document.querySelector<HTMLFormElement>('form')
el?.addEventListener('submit', mockSubmit);

  expect(el).toBeTruthy();
  expect(el?.method).toBe('POST');
  expect(el?.action).toBe("http://localhost:3000/?_action=sendEmail");
  expect(result).toContain('name="botcheck"');
  const nameInput = getByLabelText<HTMLInputElement>(document.body, 'Full Name')
  const emailInput = getByLabelText<HTMLInputElement>(document.body, 'Email Address')
  const messageInput = getByLabelText<HTMLInputElement>(document.body, 'Your Message')
  nameInput.value='jorge';
  emailInput.value='jorge@gmail.com';
  messageInput.value='hola';
  getByText(document.body, 'Send Message').click()
  expect(mockSubmit).toHaveBeenCalledTimes(1);
});