import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';

vi.mock('../../src/lib/firebase', () => ({
  auth: null,
}));

function TestConsumer() {
  const { user, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'ready'}</span>
      <span data-testid="user">{user ? user.email : 'anonymous'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  it('renders AuthProvider and exposes context', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await vi.waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('anonymous');
  });

  it('throws when useAuth used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useAuth must be used within AuthProvider');
    consoleSpy.mockRestore();
  });
});
