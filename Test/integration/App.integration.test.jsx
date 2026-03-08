import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

vi.mock('../../src/lib/firebase', () => ({
  auth: null,
  db: null,
  app: null,
}));

describe('App (integration)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('feature links point to correct routes', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /Find the pre-build/i })).toHaveAttribute('href', '/workouts');
    expect(screen.getByRole('link', { name: /Build your own/i })).toHaveAttribute('href', '/create-plan');
    expect(screen.getByRole('link', { name: /Browse pre-built exercises/i })).toHaveAttribute('href', '/exercises');
  });

  it('full navigation: workouts link navigates on click', async () => {
    render(<App />);
    const workoutsLink = screen.getByRole('link', { name: /Find the pre-build/i });
    await userEvent.click(workoutsLink);
    expect(workoutsLink).toHaveAttribute('href', '/workouts');
  });

  it('full flow: settings modal open -> change option -> close', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    const kgOption = screen.getByLabelText(/kg \(kilograms\)/i);
    await userEvent.click(kgOption);
    expect(kgOption).toBeChecked();
    const closeBtn = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeBtn);
    expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
  });
});
