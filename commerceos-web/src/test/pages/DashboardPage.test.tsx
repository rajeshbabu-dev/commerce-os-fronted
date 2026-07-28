/* =============================================================================
   CommerceOS — DashboardPage Tests
   ============================================================================= */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../../pages/DashboardPage';

// Mock the useAuth hook
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

import { useAuth } from '../../context/AuthContext';

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: {
        id: 'user-1',
        username: 'admin',
        email: 'admin@commerceos.com',
        roles: ['ADMIN'],
        permissions: ['users:read', 'inventory:read', 'supplier:read'],
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });
  });

  it('should render welcome message with username', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Welcome back.*admin/i)).toBeInTheDocument();
  });

  it('should render welcome message without username', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(<DashboardPage />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('should render all 4 KPI cards', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Inventory Health')).toBeInTheDocument();
    expect(screen.getByText('Supplier Score')).toBeInTheDocument();
    expect(screen.getByText('Open POs')).toBeInTheDocument();
    expect(screen.getByText('Stockout Risk')).toBeInTheDocument();
  });

  it('should show placeholder values for KPI cards', () => {
    render(<DashboardPage />);

    const placeholders = screen.getAllByText('--');
    expect(placeholders.length).toBeGreaterThanOrEqual(4);
  });

  it('should render Quick Actions with all 4 links', () => {
    render(<DashboardPage />);

    expect(screen.getByText('View Inventory')).toBeInTheDocument();
    expect(screen.getByText('Browse Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  it('should render Account Info section with user details', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Account Info')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByText('admin@commerceos.com')).toBeInTheDocument();
    expect(screen.getByText('3 permissions')).toBeInTheDocument();
  });
});
