/* =============================================================================
   CommerceOS — LoginPage Tests
   ============================================================================= */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';

// Mock the auth context's login function
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Mock only useNavigate — let useLocation work via MemoryRouter
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { useAuth } from '../../context/AuthContext';

// Helper to render LoginPage with MemoryRouter
function renderLoginPage(locationState?: { from?: { pathname: string } }) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: '/login', state: locationState ?? null },
      ]}
    >
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Default mock auth state
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: mockLogin,
      logout: vi.fn(),
      clearError: mockClearError,
    });
  });

  // -----------------------------------------------------------------------
  // Navigation tests (login → dashboard redirect)
  // -----------------------------------------------------------------------

  it('should navigate to /dashboard after successful login (default)', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText('you@company.com');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitBtn = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.input(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });

    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('should navigate to the "from" location after successful login', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderLoginPage({ from: { pathname: '/admin/users' } });

    const emailInput = screen.getByPlaceholderText('you@company.com');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitBtn = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.input(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });

    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/users', { replace: true });
    });
  });

  it('should NOT navigate on login failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText('you@company.com');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitBtn = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.input(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });

    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should NOT navigate when validation fails', async () => {
    renderLoginPage();

    const form = screen.getByRole('button', { name: 'Sign in' }).closest('form')!;
    fireEvent.submit(form);

    // Login should not have been called
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should render login form with email and password fields', () => {
    renderLoginPage();

    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText('CommerceOS')).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    renderLoginPage();

    const form = screen.getByRole('button', { name: 'Sign in' }).closest('form')!;
    fireEvent.submit(form);

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('should show validation error for invalid email format', async () => {
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText('you@company.com');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitBtn = screen.getByRole('button', { name: 'Sign in' });

    // Use fireEvent.input() to trigger React's onChange for controlled inputs
    fireEvent.input(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });

    // Submit the form directly
    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);

    await screen.findByText(/Email is required|Enter a valid email/);
  });

  it('should show validation error for missing @ symbol', async () => {
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText('you@company.com');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitBtn = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.input(emailInput, { target: { value: 'testatdomain.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });

    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);

    await screen.findByText(/Email is required|Enter a valid email/);
  });

  it('should show validation error for short password', async () => {
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText('you@company.com');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitBtn = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.input(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.input(passwordInput, { target: { value: 'short' } });

    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);

    await screen.findByText(/Password must be at least 8/);
  });

  it('should call login with email and password on valid submit', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText('you@company.com');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitBtn = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.input(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password123' } });

    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@test.com', 'password123');
    });
  });

  it('should show loading state while authenticating', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      login: mockLogin,
      logout: vi.fn(),
      clearError: mockClearError,
    });

    renderLoginPage();

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('should display API error message', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Invalid email or password',
      login: mockLogin,
      logout: vi.fn(),
      clearError: mockClearError,
    });

    renderLoginPage();

    expect(
      screen.getByText('Invalid email or password'),
    ).toBeInTheDocument();
  });

  it('should clear field errors when user types', async () => {
    renderLoginPage();

    const submitBtn = screen.getByRole('button', { name: 'Sign in' });
    const emailInput = screen.getByPlaceholderText('you@company.com');
    const form = submitBtn.closest('form')!;

    // Submit with empty fields to trigger validation
    fireEvent.submit(form);
    expect(await screen.findByText('Email is required')).toBeInTheDocument();

    // Start typing in email field — errors should clear on keystroke
    fireEvent.input(emailInput, { target: { value: 'a' } });
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  it('should disable form fields while loading', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      login: mockLogin,
      logout: vi.fn(),
      clearError: mockClearError,
    });

    renderLoginPage();

    expect(screen.getByLabelText('Email address')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
  });

  it('should clear API error on form submit attempt', async () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Previous error',
      login: mockLogin,
      logout: vi.fn(),
      clearError: mockClearError,
    });

    renderLoginPage();

    const submitBtn = screen.getByRole('button', { name: 'Sign in' });
    const form = submitBtn.closest('form')!;
    fireEvent.submit(form);

    expect(mockClearError).toHaveBeenCalled();
  });
});
