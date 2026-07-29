/* =============================================================================
   CommerceOS — RequireAuth Route Guard Tests
   ============================================================================= */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import RequireAuth from '../../components/RequireAuth';
import { tokenStore } from '../../api/axios';

// Mock the auth API for token verification
vi.mock('../../api/auth', async () => {
  const actual = await vi.importActual('../../api/auth');
  return {
    ...actual,
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  };
});

import * as authApi from '../../api/auth';

function renderWithRouter(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <div data-testid="protected-content">Dashboard Content</div>
              </RequireAuth>
            }
          />
          <Route path="/inventory" element={
            <RequireAuth>
              <div data-testid="inventory-content">Inventory Content</div>
            </RequireAuth>
          } />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should redirect to /login when not authenticated', async () => {
    renderWithRouter('/dashboard');

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render children when authenticated', async () => {
    // Set up authenticated state
    tokenStore.setTokens({
      accessToken: 'valid-token',
      refreshToken: 'valid-refresh',
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

    renderWithRouter('/dashboard');

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('should protect all wrapped routes', async () => {
    renderWithRouter('/inventory');

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId('inventory-content'),
    ).not.toBeInTheDocument();
  });

  it('should show loading spinner while verifying token', async () => {
    tokenStore.setTokens({
      accessToken: 'pending-token',
      refreshToken: 'pending-refresh',
    });

    // Use a deferred promise so we can control when it resolves
    let resolvePromise!: (value: unknown) => void;
    const deferred = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      deferred,
    );

    renderWithRouter('/dashboard');

    // Should show loading state (not redirecting yet)
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();

    // Resolve the deferred promise to avoid hanging
    resolvePromise(null);
    // Small wait to flush React updates
    await new Promise((r) => setTimeout(r, 10));
  });

  it('should redirect to login when token verification fails', async () => {
    tokenStore.setTokens({
      accessToken: 'invalid-token',
      refreshToken: 'invalid-refresh',
    });

    (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Invalid token'),
    );

    renderWithRouter('/dashboard');

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
