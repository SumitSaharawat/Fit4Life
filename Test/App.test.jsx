import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

vi.mock('../src/lib/firebase', () => ({
  auth: null,
  db: null,
  app: null,
}));

function renderApp() {
  return render(<App />);
}

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders Fit4Life brand', () => {
    renderApp();
    expect(screen.getByText('Fit4Life')).toBeInTheDocument();
  });

  it('renders home page hero on /', () => {
    renderApp();
    expect(screen.getByText(/Welcome to Fit4Life/i)).toBeInTheDocument();
  });

  it('shows Login and Sign Up buttons when not logged in', () => {
    renderApp();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('renders feature cards on home page', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: /Workouts/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Create Plans/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Exercises/i })).toBeInTheDocument();
  });

  it('has workouts feature link pointing to /workouts', () => {
    renderApp();
    const link = screen.getByRole('link', { name: /Find the pre-build/i });
    expect(link).toHaveAttribute('href', '/workouts');
  });

  it('shows settings button', () => {
    renderApp();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('opens settings modal when settings button clicked', async () => {
    renderApp();
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });
});
