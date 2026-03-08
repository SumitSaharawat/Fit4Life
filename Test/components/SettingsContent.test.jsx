import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsProvider } from '../../src/contexts/SettingsContext';
import SettingsContent from '../../src/components/SettingsContent';

function renderSettings() {
  return render(
    <SettingsProvider>
      <SettingsContent />
    </SettingsProvider>
  );
}

describe('SettingsContent', () => {
  it('renders Units section', () => {
    renderSettings();
    expect(screen.getByText('Units')).toBeInTheDocument();
  });

  it('renders Weight options', () => {
    renderSettings();
    expect(screen.getByLabelText(/lbs \(pounds\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kg \(kilograms\)/i)).toBeInTheDocument();
  });

  it('renders rest timer input', () => {
    renderSettings();
    expect(screen.getByLabelText(/default rest timer/i)).toBeInTheDocument();
  });
});
