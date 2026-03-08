import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsProvider, useSettings } from '../../src/contexts/SettingsContext';

function TestConsumer() {
  const { weightUnit, setSetting } = useSettings();
  return (
    <div>
      <span data-testid="weight">{weightUnit}</span>
      <button onClick={() => setSetting('weightUnit', 'kg')}>Set kg</button>
      <button onClick={() => setSetting('weightUnit', 'lbs')}>Set lbs</button>
    </div>
  );
}

describe('SettingsContext', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined' && localStorage.clear) {
      localStorage.clear();
    }
  });

  it('provides default weightUnit', () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );
    expect(screen.getByTestId('weight')).toHaveTextContent('lbs');
  });

  it('updates weightUnit when setSetting called', async () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Set kg' }));
    expect(screen.getByTestId('weight')).toHaveTextContent('kg');
  });

  it('persists settings to localStorage', async () => {
    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Set kg' }));
    const raw = localStorage.getItem('fit4life-settings');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed.weightUnit).toBe('kg');
  });
});
