/* =============================================================================
   CommerceOS — Admin User Management Page
   =============================================================================
   Admin-only page for creating and managing users.
   Backend endpoint: POST /api/v1/admin/users (requires ADMIN role)
   ============================================================================= */

import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { createUser, type CreateUserRequest, type UserResponse } from '../api/auth';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { UserPlus, Users, CheckCircle2, AlertCircle } from 'lucide-react';

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
  roleName?: string;
}

const ROLES = [
  { value: 'ADMIN', label: 'Admin', description: 'Full access — invite users, manage settings, approve POs' },
  { value: 'PROCUREMENT_MANAGER', label: 'Procurement Manager', description: 'View everything, manage suppliers, approve/reject POs' },
  { value: 'OPS_EXECUTIVE', label: 'Ops Executive', description: 'Adjust stock, create/submit POs, convert recommendations' },
  { value: 'VIEWER', label: 'Viewer', description: 'Read-only access to all modules' },
] as const;

export default function AdminUserManagementPage() {
  const { user } = useAuth();

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('VIEWER');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Created users list
  const [createdUsers, setCreatedUsers] = useState<UserResponse[]>([]);

  // RBAC Guard
  if (!user || !user.roles?.includes('ADMIN')) {
    return (
      <div className="page-container">
        <div className="card text-center py-12">
          <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
          <p className="text-slate-500 mt-2">
            You need Admin privileges to view this page.
          </p>
        </div>
      </div>
    );
  }

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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain uppercase, lowercase, and a number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const request: CreateUserRequest = {
        username: username.trim(),
        email: email.trim(),
        password,
        roleName,
      };
      const newUser = await createUser(request);

      setSuccessMessage(`User "${newUser.username}" created successfully with role ${newUser.roles?.join(', ')}`);
      setCreatedUsers((prev) => [newUser, ...prev]);

      // Reset form
      setUsername('');
      setEmail('');
      setPassword('');
      setRoleName('VIEWER');
      setFieldErrors({});
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string; message?: string } } };
      const message =
        axiosError?.response?.data?.detail ??
        axiosError?.response?.data?.message ??
        'Failed to create user. Please try again.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <PageHeader
        title="User Management"
        subtitle="Invite team members, assign operational roles, and enforce separation of duties"
        badge={<Badge variant="ai">Admin Portal</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create User Form */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
            <UserPlus className="w-5 h-5 text-primary-600" />
            <h2 className="text-base font-bold text-slate-900">Create New User</h2>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md mb-4 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {apiError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md mb-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-700 mb-1">
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
                placeholder="e.g. jdoe"
              />
              {fieldErrors.username && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
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
                placeholder="jdoe@company.com"
              />
              {fieldErrors.email && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
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
                placeholder="Min. 8 characters"
              />
              {fieldErrors.password && (
                <p className="text-xs text-rose-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="roleName" className="block text-xs font-semibold text-slate-700 mb-1">
                Role
              </label>
              <select
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="input-field"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full text-sm font-semibold h-10 px-4 rounded-md"
              >
                {isSubmitting ? 'Creating user...' : 'Create User'}
              </button>
            </div>
          </form>
        </Card>

        {/* Role Reference Section */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Role Reference</h3>
            <div className="space-y-3">
              {ROLES.map((r) => {
                const isSelected = roleName === r.value;
                return (
                  <div
                    key={r.value}
                    className={`rounded-lg p-3 border transition-colors ${
                      isSelected
                        ? 'border-primary-300 bg-primary-50/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{r.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recently Created Section */}
          {createdUsers.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-600" /> Recently Created
              </h3>
              <div className="space-y-2">
                {createdUsers.map((u) => (
                  <div key={u.id} className="p-2.5 rounded-md bg-slate-50 border border-slate-100 text-xs">
                    <p className="font-semibold text-slate-900">{u.username}</p>
                    <p className="text-slate-500 font-mono text-[11px]">{u.email}</p>
                    <div className="mt-1 flex gap-1">
                      {u.roles?.map((r) => (
                        <Badge key={r} variant="ai">{r}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
