/* =============================================================================
   CommerceOS — AdminUserManagementPage Tests
   ============================================================================= */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import AdminUserManagementPage from '../../pages/AdminUserManagementPage';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock useAuth
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return { ...actual, useAuth: vi.fn() };
});

// Mock auth API
vi.mock('../../api/auth', async () => ({
  createUser: vi.fn(),
}));

// Mock axios
vi.mock('../../api/axios', async () => {
  const actual = await vi.importActual('../../api/axios');
  return {
    ...actual,
    default: { ...actual.default, get: vi.fn().mockResolvedValue({ data: [] }) },
  };
});

import { useAuth } from '../../context/AuthContext';
import { createUser } from '../../api/auth';

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockCreateUser = createUser as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAdminUser() {
  return {
    id: 'user-1',
    username: 'admin',
    email: 'admin@commerceos.com',
    roles: ['ADMIN'],
    permissions: ['users:read', 'users:write'],
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  };
}

function makeViewerUser() {
  return {
    id: 'user-2',
    username: 'viewer',
    email: 'viewer@commerceos.com',
    roles: ['VIEWER'],
    permissions: ['inventory:read'],
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  };
}

function renderAsAdmin() {
  mockUseAuth.mockReturnValue({
    user: makeAdminUser(),
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
  });
  return render(<AdminUserManagementPage />);
}

function renderAsViewer() {
  mockUseAuth.mockReturnValue({
    user: makeViewerUser(),
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
  });
  return render(<AdminUserManagementPage />);
}

function renderWithNoUser() {
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
  });
  return render(<AdminUserManagementPage />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AdminUserManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // ACCESS GUARD
  // =========================================================================

  describe('Access Guard', () => {
    it('should show "Access Denied" for non-admin users', () => {
      renderAsViewer();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText(/You need Admin privileges/)).toBeInTheDocument();
    });

    it('should show "Access Denied" when user is null', () => {
      renderWithNoUser();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should render the form when user has ADMIN role', () => {
      renderAsAdmin();
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Create New User')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('should NOT show "Access Denied" for admin users', () => {
      renderAsAdmin();
      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // FORM VALIDATION
  // =========================================================================

  describe('Form Validation', () => {
    beforeEach(() => {
      renderAsAdmin();
    });

    it('should show error for empty username', () => {
      const submitBtn = screen.getByRole('button', { name: /Create User/i });
      fireEvent.click(submitBtn);
      expect(screen.getByText('Username is required')).toBeInTheDocument();
    });

    it('should show error for username shorter than 3 chars', () => {
      const username = screen.getByLabelText('Username');
      fireEvent.input(username, { target: { value: 'ab' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
    });

    it('should show error for username with invalid characters', () => {
      const username = screen.getByLabelText('Username');
      fireEvent.input(username, { target: { value: 'john doe!' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
      expect(screen.getByText('Username can only contain letters, numbers, and underscores')).toBeInTheDocument();
    });

    it('should show error for empty email', () => {
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    // NOTE: fireEvent.input on type="email" with non-email values doesn't flush
    // React 19 state before submit. Using fireEvent.change + fireEvent.submit(form)
    // instead.
    it('should show error for invalid email format', () => {
      const email = screen.getByLabelText('Email Address');
      const form = screen.getByRole('button', { name: /Create User/i }).closest('form')!;
      fireEvent.change(email, { target: { value: 'not-an-email' } });
      fireEvent.submit(form);
      expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    });

    it('should show error for empty password', () => {
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should show error for password shorter than 8 chars', () => {
      const password = screen.getByLabelText('Password');
      fireEvent.input(password, { target: { value: 'Short1' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });

    it('should show error for password without uppercase, lowercase, and number', () => {
      const password = screen.getByLabelText('Password');
      fireEvent.input(password, { target: { value: 'alllowercase1' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
      expect(screen.getByText('Password must contain uppercase, lowercase, and a number')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // FORM SUBMISSION
  // =========================================================================

  describe('Form Submission', () => {
    beforeEach(() => {
      renderAsAdmin();
    });

    it('should call createUser with correct payload on valid submit', async () => {
      const createdUser = {
        id: 'user-new',
        username: 'john_doe',
        email: 'john@test.com',
        roles: ['VIEWER'],
        permissions: [],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      };
      mockCreateUser.mockResolvedValueOnce(createdUser);

      fireEvent.input(screen.getByLabelText('Username'), { target: { value: 'john_doe' } });
      fireEvent.input(screen.getByLabelText('Email Address'), { target: { value: 'john@test.com' } });
      fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'Password1' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith({
          username: 'john_doe',
          email: 'john@test.com',
          password: 'Password1',
          roleName: 'VIEWER',
        });
      });
    });

    it('should show success message after successful creation', async () => {
      const createdUser = {
        id: 'user-new',
        username: 'john_doe',
        email: 'john@test.com',
        roles: ['VIEWER'],
        permissions: [],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      };
      mockCreateUser.mockResolvedValueOnce(createdUser);

      fireEvent.input(screen.getByLabelText('Username'), { target: { value: 'john_doe' } });
      fireEvent.input(screen.getByLabelText('Email Address'), { target: { value: 'john@test.com' } });
      fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'Password1' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

      await waitFor(() => {
        expect(screen.getByText(/User "john_doe" created successfully/)).toBeInTheDocument();
      });
    });

    it('should reset form after successful creation', async () => {
      const createdUser = {
        id: 'user-new',
        username: 'john_doe',
        email: 'john@test.com',
        roles: ['VIEWER'],
        permissions: [],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      };
      mockCreateUser.mockResolvedValueOnce(createdUser);

      fireEvent.input(screen.getByLabelText('Username'), { target: { value: 'john_doe' } });
      fireEvent.input(screen.getByLabelText('Email Address'), { target: { value: 'john@test.com' } });
      fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'Password1' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

      await waitFor(() => {
        expect(screen.getByLabelText('Username')).toHaveValue('');
        expect(screen.getByLabelText('Email Address')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('VIEWER');
      });
    });

    it('should show API error when createUser fails', async () => {
      mockCreateUser.mockRejectedValueOnce({
        response: { data: { detail: 'Email already registered' } },
      });

      fireEvent.input(screen.getByLabelText('Username'), { target: { value: 'john_doe' } });
      fireEvent.input(screen.getByLabelText('Email Address'), { target: { value: 'john@test.com' } });
      fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'Password1' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

      await waitFor(() => {
        expect(screen.getByText('Email already registered')).toBeInTheDocument();
      });
    });

    it('should show generic error when API returns no detail', async () => {
      mockCreateUser.mockRejectedValueOnce(new Error('Network error'));

      fireEvent.input(screen.getByLabelText('Username'), { target: { value: 'john_doe' } });
      fireEvent.input(screen.getByLabelText('Email Address'), { target: { value: 'john@test.com' } });
      fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'Password1' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

      await waitFor(() => {
        expect(screen.getByText('Failed to create user. Please try again.')).toBeInTheDocument();
      });
    });

    it('should show spinner text while submitting', async () => {
      let resolveCreate!: (value: unknown) => void;
      mockCreateUser.mockReturnValueOnce(new Promise((resolve) => { resolveCreate = resolve; }));

      fireEvent.input(screen.getByLabelText('Username'), { target: { value: 'john_doe' } });
      fireEvent.input(screen.getByLabelText('Email Address'), { target: { value: 'john@test.com' } });
      fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'Password1' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

      await waitFor(() => {
        expect(screen.getByText('Creating user...')).toBeInTheDocument();
      });

      // Resolve to avoid hanging
      resolveCreate({
        id: 'user-new',
        username: 'john_doe',
        email: 'john@test.com',
        roles: ['VIEWER'],
        permissions: [],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      });
    });

    it('should disable submit button while submitting', async () => {
      let resolveCreate!: (value: unknown) => void;
      mockCreateUser.mockReturnValueOnce(new Promise((resolve) => { resolveCreate = resolve; }));

      fireEvent.input(screen.getByLabelText('Username'), { target: { value: 'john_doe' } });
      fireEvent.input(screen.getByLabelText('Email Address'), { target: { value: 'john@test.com' } });
      fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'Password1' } });
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Creating user/i })).toBeDisabled();
      });

      resolveCreate({
        id: 'user-new',
        username: 'john_doe',
        email: 'john@test.com',
        roles: ['VIEWER'],
        permissions: [],
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      });
    });
  });

  // =========================================================================
  // FIELD ERROR CLEARING
  // =========================================================================

  describe('Field Error Clearing', () => {
    beforeEach(() => {
      renderAsAdmin();
    });

    it('should clear username error when user types', () => {
      // Trigger validation error
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
      expect(screen.getByText('Username is required')).toBeInTheDocument();

      // Type into username — error should clear
      fireEvent.input(screen.getByLabelText('Username'), { target: { value: 'a' } });
      expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
    });

    it('should clear email error when user types', () => {
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
      expect(screen.getByText('Email is required')).toBeInTheDocument();

      fireEvent.input(screen.getByLabelText('Email Address'), { target: { value: 'a@' } });
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });

    it('should clear password error when user types', () => {
      fireEvent.click(screen.getByRole('button', { name: /Create User/i }));
      expect(screen.getByText('Password is required')).toBeInTheDocument();

      fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'a' } });
      expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // ROLE REFERENCE & RECENTLY CREATED
  // =========================================================================

  describe('Role Reference & Recently Created', () => {
    beforeEach(() => {
      renderAsAdmin();
    });

    it('should render role reference card with all 4 roles', () => {
      expect(screen.getByText('Role Reference')).toBeInTheDocument();
      // Use getAllByText because role labels appear in both <option> and reference card
      expect(screen.getAllByText('Admin').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Procurement Manager').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Ops Executive').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Viewer').length).toBeGreaterThanOrEqual(1);
    });

    it('should highlight the currently selected role', () => {
      // The Role Reference card shows all roles; default selection is VIEWER
      const roleRefSection = screen.getByText('Role Reference').closest('div')!;
      const viewerCards = roleRefSection.querySelectorAll('div[class*="rounded-lg"]');
      // The last card should be Viewer (the default selected role)
      const viewerCard = Array.from(viewerCards).find(el => el.className.includes('border-primary-300'));
      expect(viewerCard).toBeTruthy();
    });

    it('should not render "Recently Created" section when no users', () => {
      expect(screen.queryByText('Recently Created')).not.toBeInTheDocument();
    });
  });
});
