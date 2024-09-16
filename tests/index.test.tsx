// tests/index.test.tsx
import { render } from '@testing-library/react';
import Index from '../src/pages/index.astro';
import {expect, test} from 'vitest';
import '@testing-library/jest-dom';  // Add this line to enable jest-dom matchers

test('renders the home page', () => {
    const { getByText } = render(<Index />);
    expect(getByText('Welcome to My Site')).toBeInTheDocument();
    expect(getByText('This is the home page of my site.')).toBeInTheDocument();
  });