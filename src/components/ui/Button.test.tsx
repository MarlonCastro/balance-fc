import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    const { container } = render(<Button>Test</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-indigo-600');
  });

  it('applies danger variant', () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-red-600');
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    const { container } = render(<Button isLoading>Test</Button>);
    const button = container.querySelector('button');
    expect(button?.disabled).toBe(true);
  });
});

