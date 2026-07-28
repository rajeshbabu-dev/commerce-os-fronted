/* =============================================================================
   CommerceOS — Admin User Management Page
   =============================================================================
   Admin-only page for creating and managing users.
   Per PRD §16: "As an Admin, I want to invite users with a specific role,
   so access matches responsibility."

   Backend endpoint: POST /api/v1/admin/users (requires ADMIN role)
   ============================================================================= */

import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { createUser, type CreateUserRequest, type UserResponse } from '../api/auth';
import api from '../api/axios';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
  roleName?: string;
}

// ---------------------------------------------------------------------------
// Available roles (matches backend V2 seed)
// ---------------------------------------------------------------------------

const ROLES = [
  { value: 'ADMIN', label: 'Admin', description: 'Full access — invite users, manage settings, approve POs' },
  { value: 'PROCUREMENT_MANAGER', label: 'Procurement Manager', description: 'View everything, manage suppliers, approve/reject POs' },
  { value: 'OPS_EXECUTIVE', label: 'Ops Executive', description: 'Adjust stock, create/submit POs, convert recommendations' },
  { value: 'VIEWER', label: 'Viewer', description: 'Read-only access to all modules' },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminUserManagementPage() {
  const { user: currentUser } = useAuth();

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('VIEWER');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Created users list (session-local for demo)
  const [createdUsers, setCreatedUsers] = useState<UserResponse[]>([]);

  // Fetch existing users on mount
  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data } = await api.get<UserResponse[]>('/admin/users');
        setCreatedUsers(data);
      } catch {
        // Endpoint may not support listing yet — silent fail
      }
    }
    fetchUsers();
  }, []);

  // -----------------------------------------------------------------------
  // Validation
  // -----------------------------------------------------------------------

  function validate(): boolean {
    const errors: FieldErrors = {};

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
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain uppercase, lowercase, and a number';
    }

    if (!roleName) {
      errors.roleName = 'Please select a role';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // -----------------------------------------------------------------------
  // Submit
  // -----------------------------------------------------------------------

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const request: CreateUserRequest = {
        username: username.trim(),
        email: email.trim(),
        password,
        roleName,
      };

      const created = await createUser(request);
      setCreatedUsers((prev) => [created, ...prev]);

      // Reset form
      setUsername('');
      setEmail('');
      setPassword('');
      setRoleName('VIEWER');
      setFieldErrors({});

      setSuccessMessage(`User "${created.username}" created successfully with ${roleName} role.`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const detail = axiosErr.response?.data?.detail ?? 'Failed to create user. Please try again.';
      setApiError(detail);
    } finally {
      setIsSubmitting(false);
    }
  }

  // -----------------------------------------------------------------------
  // Clear field errors on typing
  // -----------------------------------------------------------------------

  function clearFieldError(field: keyof FieldErrors) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  // Guard: must be ADMIN
  if (!currentUser?.roles?.includes('ADMIN')) {
    return (
      <div className="page-container">
        <div className="card text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-500">
            You need Admin privileges to access user management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Invite and manage team members with role-based access
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create User Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Create New User
            </h2>

            {/* Success message */}
            {successMessage && (
              <div className="rounded-md bg-green-50 border border-green-200 p-3 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            )}

            {/* API error */}
            {apiError && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 mb-4">
                <p className="text-sm text-red-700">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. john_doe"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); clearFieldError('username'); }}
                  className={`input-field ${fieldErrors.username ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                />
                {fieldErrors.username && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="new-email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  id="new-email"
                  type="email"
                  autoComplete="email"
                  placeholder="user@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                  className={`input-field ${fieldErrors.email ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                  className={`input-field ${fieldErrors.password ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  Must contain uppercase, lowercase, and a number
                </p>
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={roleName}
                  onChange={(e) => { setRoleName(e.target.value); clearFieldError('roleName'); }}
                  className={`input-field ${fieldErrors.roleName ? 'input-error' : ''}`}
                  disabled={isSubmitting}
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.roleName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.roleName}</p>
                )}
                {/* Role description */}
                <p className="mt-1 text-xs text-slate-500">
                  {ROLES.find((r) => r.value === roleName)?.description}
                </p>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating user...
                    </span>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Role Reference Card */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Role Reference</h2>
            <div className="space-y-4">
              {ROLES.map((role) => (
                <div
                  key={role.value}
                  className={`p-3 rounded-lg border transition-colors duration-150 ${
                    roleName === role.value
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      role.value === 'ADMIN'
                        ? 'bg-red-100 text-red-700'
                        : role.value === 'PROCUREMENT_MANAGER'
                        ? 'bg-amber-100 text-amber-700'
                        : role.value === 'OPS_EXECUTIVE'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {role.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{role.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          {createdUsers.length > 0 && (
            <div className="card mt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Recently Created</h2>
              <div className="space-y-3">
                {createdUsers.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{u.username}</p>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {Array.from(u.roles)[0] ?? 'VIEWER'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
