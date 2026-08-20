/* =============================================================================
   CommerceOS — Login Page
   =============================================================================
   Per FRONTEND-SPEC.md §1 design system:
   - Indigo primary button, slate border inputs
   - Validation errors shown inline
   - Generic error message for invalid credentials (never reveals which field)
   ============================================================================= */

import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Redirect if already authenticated
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';
  if (isAuthenticated && !isLoading) {
    return <Navigate to={from} replace />;
  }

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // AuthContext handles setting error state
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center px-4 sm:px-6 py-12 antialiased">
      {/* Brand Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 text-white font-bold text-base shadow-md mb-2">
          C
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          CommerceOS
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
          Sign in to your account
        </p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-modal border-slate-200/90">
        {/* Global error banner */}
        {error && (
          <div
            className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Email address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                disabled={isLoading}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`input-field ${fieldErrors.email ? 'input-error' : ''}`}
                placeholder="you@company.com"
                autoComplete="email"
                autoFocus
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                disabled={isLoading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={`input-field ${fieldErrors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-sm font-semibold shadow-xs"
              isLoading={isLoading}
              rightIcon={!isLoading ? <ArrowRight className="w-4 h-4" /> : undefined}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-primary-600 font-semibold hover:text-primary-700">
            Create an account
          </Link>
        </div>
      </Card>

      {/* Footer info */}
      <div className="mt-8 text-center text-xs text-slate-400">
        <span>Protected by CommerceOS IAM &middot; SOC2 Compliance Ready</span>
      </div>
    </div>
  );
}
