import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

vi.mock('../../src/lib/firebase', () => ({
  auth: null,
  db: null,
  app: null,
}));

describe('Settings (integration)', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined' && localStorage.clear) {
      localStorage.clear();
    }
    vi.useFakeTimers();
  });

  it('full flow: open settings -> change weight unit -> persist to localStorage', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    const kgOption = screen.getByLabelText(/kg \(kilograms\)/i);
    await userEvent.click(kgOption);
    const raw = localStorage.getItem('fit4life-settings');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed.weightUnit).toBe('kg');
  });

  it('full flow: open settings -> change distance unit', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    const kmOption = screen.getByLabelText(/kilometers/i);
    await userEvent.click(kmOption);
    const raw = localStorage.getItem('fit4life-settings');
    expect(JSON.parse(raw).distanceUnit).toBe('km');
  });

  it('full flow: open settings -> change rest timer', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    const restInput = screen.getByLabelText(/default rest timer/i);
    await userEvent.clear(restInput);
    await userEvent.type(restInput, '90');
    const raw = localStorage.getItem('fit4life-settings');
    expect(JSON.parse(raw).restTimerSeconds).toBe(90);
  });
});
