/* =============================================================================
   CommerceOS — Auth Context
   =============================================================================
   Provides auth state (user, tokens, loading) and actions (login, logout)
   to the entire app via React context.
   ============================================================================= */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  login as apiLogin,
  signUp as apiSignUp,
  logout as apiLogout,
  getCurrentUser,
  type UserResponse,
} from '../api/auth';
import { tokenStore } from '../api/axios';


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

type AuthContextValue = AuthState & AuthActions;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: !!tokenStore.getAccessToken(),
    isLoading: !!tokenStore.getAccessToken(), // only loading if we have a token to verify
    error: null,
  });

  // On mount: verify stored token by fetching current user
  useEffect(() => {
    if (!tokenStore.getAccessToken()) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    getCurrentUser()
      .then((user) => {
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      })
      .catch(() => {
        // Token invalid/expired — clear everything
        tokenStore.clearTokens();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      });
  }, []);

  // Wire up the axios interceptor logout handler (called when refresh fails)
  useEffect(() => {
    tokenStore.onLogout = () => {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired. Please log in again.',
      });
    };
    return () => {
      tokenStore.onLogout = null;
    };
  }, []);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await apiLogin({ email, password });
      const user = await getCurrentUser();
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials.';
      const axiosErr = err as { response?: { data?: { message?: string; detail?: string } } };
      const detail = axiosErr.response?.data?.message ?? axiosErr.response?.data?.detail ?? message;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: detail,
      }));
      throw err;
    }
  }, []);

  const signUp = useCallback(
    async (username: string, email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        await apiSignUp({ username, email, password });
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Registration failed. Please try again.';
        const axiosErr = err as { response?: { data?: { message?: string; detail?: string } } };
        const detail = axiosErr.response?.data?.message ?? axiosErr.response?.data?.detail ?? message;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: detail,
        }));
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      if (refreshToken) {
        await apiLogout(refreshToken);
      }
    } catch {
      // API call failed — still clear local tokens below
    } finally {
      tokenStore.clearTokens();
    }
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // -------------------------------------------------------------------------
  // Value
  // -------------------------------------------------------------------------

  const value = useMemo(
    () => ({
      ...state,
      login,
      signUp,
      logout,
      clearError,
    }),
    [state, login, signUp, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
