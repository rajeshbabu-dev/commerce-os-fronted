/* =============================================================================
   CommerceOS — Sign Up Page
   =============================================================================
   Public self-registration page. New users are assigned the VIEWER role
   and are automatically logged in after successful registration.
   ============================================================================= */

import { useState, type FormEvent } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function SignUpPage() {
  const { signUp, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated && !authLoading) {
    return <Navigate to="/home" replace />;
  }

  function validate(): boolean {
    const errors: { username?: string; email?: string; password?: string } = {};

    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least one number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      await signUp(username.trim(), email.trim(), password);
      navigate('/home', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setApiError(message);
    } finally {
      setIsLoading(false);
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
          Create your account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
          Join CommerceOS to automate procurement and supply chain operations
        </p>
      </div>

      {/* SignUp Card */}
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-modal border-slate-200/90">
        {apiError && (
          <div
            className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium"
            role="alert"
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: undefined }));
              }}
              className={`input-field ${fieldErrors.username ? 'input-error' : ''}`}
              placeholder="e.g. alexsmith"
              autoComplete="username"
              autoFocus
            />
            {fieldErrors.username && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.username}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Work Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={`input-field ${fieldErrors.email ? 'input-error' : ''}`}
              placeholder="name@company.com"
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className={`input-field ${fieldErrors.password ? 'input-error' : ''}`}
              placeholder="Min. 8 chars (1 uppercase, 1 number)"
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <p className="text-xs text-rose-600 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-sm font-semibold shadow-xs"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
