import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../../src/pages/Home';

describe('Home', () => {
  it('renders hero heading', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /Welcome to Fit4Life/i })).toBeInTheDocument();
  });

  it('renders hero subtitle', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText(/ultimate fitness companion/i)).toBeInTheDocument();
  });

  it('renders Workouts feature card with link', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /Find the pre-build/i });
    expect(link).toHaveAttribute('href', '/workouts');
  });

  it('renders Create Plans feature card with link', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /Build your own/i });
    expect(link).toHaveAttribute('href', '/create-plan');
  });

  it('renders Exercises feature card with link', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /Browse pre-built exercises/i });
    expect(link).toHaveAttribute('href', '/exercises');
  });
});
