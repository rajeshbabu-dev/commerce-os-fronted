/* =============================================================================
   CommerceOS — AuthContext Tests
   ============================================================================= */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { tokenStore } from '../../api/axios';

// Mock the auth API
vi.mock('../../api/auth', async () => {
  const actual = await vi.importActual('../../api/auth');
  return {
    ...actual,
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  };
});

import * as authApi from '../../api/auth';

// Helper component to test auth state
function TestConsumer() {
  const { user, isAuthenticated, isLoading, error, login, logout, clearError } =
    useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'authenticated' : 'unauthenticated'}
      </div>
      <div data-testid="loading-status">
        {isLoading ? 'loading' : 'loaded'}
      </div>
      <div data-testid="user-email">{user?.email ?? 'no-user'}</div>
      <div data-testid="error-message">{error ?? 'no-error'}</div>
      <button
        data-testid="login-btn"
        onClick={async () => {
          try {
            await login('admin@test.com', 'password123');
          } catch {
            // Expected: errors are handled by AuthContext internally
          }
        }}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>
        Logout
      </button>
      <button data-testid="clear-error-btn" onClick={() => clearError()}>
        Clear Error
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should start with no authenticated user', () => {
    renderWithProvider();

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'unauthenticated',
    );
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    expect(screen.getByTestId('error-message')).toHaveTextContent('no-error');
  });

  it('should show loading when token exists on mount', async () => {
    tokenStore.setTokens({
      accessToken: 'existing-token',
      refreshToken: 'existing-refresh',
    });

    (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 'user-1',
      username: 'admin',
      email: 'admin@commerceos.com',
      roles: ['ADMIN'],
      permissions: [],
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00',
    });

    renderWithProvider();

    // Initially loading
    expect(screen.getByTestId('loading-status')).toHaveTextContent('loading');

    // After resolving, should be loaded and authenticated
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'authenticated',
      );
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'admin@commerceos.com',
      );
    });
  });

  it('should login successfully and update state', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const mockTokens = {
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    };

    (authApi.login as ReturnType<typeof vi.fn>).mockImplementationOnce(
      async () => {
        tokenStore.setTokens(mockTokens);
        return mockTokens;
      },
    );
    (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 'user-1',
      username: 'admin',
      email: 'admin@commerceos.com',
      roles: ['ADMIN'],
      permissions: [],
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00',
    });

    await user.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'authenticated',
      );
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'admin@commerceos.com',
      );
      expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded');
    });

    // Tokens should be stored
    expect(tokenStore.getAccessToken()).toBe('new-access');
    expect(tokenStore.getRefreshToken()).toBe('new-refresh');
  });

  it('should handle login failure and show error', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const apiError = {
      response: { data: { detail: 'Invalid credentials' } },
    };

    (authApi.login as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      apiError,
    );

    await user.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'unauthenticated',
      );
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Invalid credentials',
      );
    });
  });

  it('should logout and clear state', async () => {
    const user = userEvent.setup();

    // Start with stored tokens
    tokenStore.setTokens({
      accessToken: 'existing-access',
      refreshToken: 'existing-refresh',
    });

    (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 'user-1',
      username: 'admin',
      email: 'admin@commerceos.com',
      roles: ['ADMIN'],
      permissions: [],
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00',
    });

    (authApi.logout as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      undefined,
    );

    renderWithProvider();

    // Wait for initial auth to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'authenticated',
      );
    });

    await user.click(screen.getByTestId('logout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'unauthenticated',
      );
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    });
  });

  it('should clear error when clearError is called', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    // Trigger a login error
    const apiError = {
      response: { data: { detail: 'Something went wrong' } },
    };
    (authApi.login as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      apiError,
    );

    await user.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Something went wrong',
      );
    });

    await user.click(screen.getByTestId('clear-error-btn'));

    expect(screen.getByTestId('error-message')).toHaveTextContent('no-error');
  });

  it('should handle logout when no refresh token exists', async () => {
    const user = userEvent.setup();

    // Start with only access token (simulating edge case)
    localStorage.setItem('commerceos_access_token', 'access-only');

    (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 'user-1',
      username: 'admin',
      email: 'admin@commerceos.com',
      roles: ['ADMIN'],
      permissions: [],
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00',
    });

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'authenticated',
      );
    });

    await user.click(screen.getByTestId('logout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'unauthenticated',
      );
    });
  });

  it('should handle expired token on mount gracefully', async () => {
    tokenStore.setTokens({
      accessToken: 'expired-token',
      refreshToken: 'expired-refresh',
    });

    // getCurrentUser fails (expired token)
    (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Token expired'),
    );

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent(
        'unauthenticated',
      );
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    });

    // Tokens should be cleared
    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });
});
