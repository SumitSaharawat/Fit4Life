import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../../src/pages/Signup';

const mockSignup = vi.fn();
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signup: mockSignup,
  }),
}));

function renderSignup() {
  return render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );
}

describe('Signup', () => {
  beforeEach(() => {
    mockSignup.mockClear();
  });

  it('renders create account heading', () => {
    renderSignup();
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
  });

  it('renders email, password, and confirm inputs', () => {
    renderSignup();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows passwords do not match error when passwords differ', async () => {
    renderSignup();
    await userEvent.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('submits form when passwords match', async () => {
    mockSignup.mockResolvedValue();
    renderSignup();
    await userEvent.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
