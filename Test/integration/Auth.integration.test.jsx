import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../src/pages/Login';
import Signup from '../../src/pages/Signup';

const mockLogin = vi.fn();
const mockSignup = vi.fn();
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: mockLogin,
    signup: mockSignup,
  }),
}));

describe('Auth (integration)', () => {
  beforeEach(() => {
    mockLogin.mockClear();
    mockSignup.mockClear();
  });

  it('Login: full form submit flow calls auth and validates input', async () => {
    mockLogin.mockResolvedValue();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'secret123');
  });

  it('Login: signup link has correct href', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const signupLink = screen.getByRole('link', { name: /sign up/i });
    expect(signupLink).toHaveAttribute('href', '/signup');
  });

  it('Signup: full flow with validation - password mismatch shows error', async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    await userEvent.type(screen.getByLabelText(/^email$/i), 'new@test.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('Signup: full flow - matching passwords calls signup', async () => {
    mockSignup.mockResolvedValue();
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    await userEvent.type(screen.getByLabelText(/^email$/i), 'new@test.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(mockSignup).toHaveBeenCalledWith('new@test.com', 'password123');
  });
});
