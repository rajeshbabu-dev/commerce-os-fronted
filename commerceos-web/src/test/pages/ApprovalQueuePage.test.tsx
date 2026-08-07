import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import ApprovalQueuePage from '../../pages/ApprovalQueuePage';

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock TanStack query hooks
vi.mock('../../hooks/useApprovalQuery', () => ({
  usePendingApprovalsQuery: vi.fn(),
  useDecideApprovalMutation: vi.fn(),
}));

import { useAuth } from '../../context/AuthContext';
import {
  usePendingApprovalsQuery,
  useDecideApprovalMutation,
} from '../../hooks/useApprovalQuery';

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUsePendingApprovalsQuery = usePendingApprovalsQuery as ReturnType<typeof vi.fn>;
const mockUseDecideApprovalMutation = useDecideApprovalMutation as ReturnType<typeof vi.fn>;

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ApprovalQueuePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ApprovalQueuePage', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'user-01', email: 'admin@commerceos.com', roles: ['ADMIN'] },
    });
    mockUseDecideApprovalMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  const sampleApprovals = [
    {
      id: 'apr-001',
      entityType: 'PURCHASE_ORDER',
      entityId: 'po-001',
      status: 'PENDING',
      submittedBy: 'user-02',
      submitterName: 'Jane Doe',
      assignedRole: 'PROCUREMENT_MANAGER',
      thresholdAmount: 1000.0,
      createdAt: '2026-07-30T10:00:00Z',
      updatedAt: '2026-07-30T10:00:00Z',
    },
    {
      id: 'apr-002',
      entityType: 'PURCHASE_ORDER',
      entityId: 'po-002',
      status: 'PENDING',
      submittedBy: 'user-01', // Same as current user (self-approval test)
      submitterName: 'Admin User',
      assignedRole: 'PROCUREMENT_MANAGER',
      thresholdAmount: 500.0,
      createdAt: '2026-07-30T11:00:00Z',
      updatedAt: '2026-07-30T11:00:00Z',
    },
  ];

  const pagedApprovals = {
    content: sampleApprovals,
    page: 0,
    size: 20,
    totalElements: sampleApprovals.length,
    totalPages: 1,
    first: true,
    last: true,
  };

  it('renders loading state', () => {
    mockUsePendingApprovalsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderWithProviders();
    expect(screen.getByText('Loading pending approvals...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUsePendingApprovalsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    });

    renderWithProviders();
    expect(
      screen.getByText('Failed to load approvals. Please try again.'),
    ).toBeInTheDocument();
  });

  it('renders page title and summary cards', () => {
    mockUsePendingApprovalsQuery.mockReturnValue({
      data: pagedApprovals,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    expect(screen.getByText('Approval Queue')).toBeInTheDocument();
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
    expect(screen.getByText('Cannot Self-Approve')).toBeInTheDocument();
    expect(screen.getByText('Ready for Review')).toBeInTheDocument();
  });

  it('renders approval cards', () => {
    mockUsePendingApprovalsQuery.mockReturnValue({
      data: pagedApprovals,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    // Check approval entity types (both cards show PURCHASE ORDER)
    const poTexts = screen.getAllByText('PURCHASE ORDER');
    expect(poTexts.length).toBe(2);

    // Check Review buttons
    const reviewButtons = screen.getAllByRole('button', { name: 'Review' });
    expect(reviewButtons.length).toBe(2);
  });

  it('shows self-approval warning for own submissions', () => {
    mockUsePendingApprovalsQuery.mockReturnValue({
      data: pagedApprovals,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    expect(
      screen.getByText('⚠ Self-approval forbidden. Another manager must review this PO.'),
    ).toBeInTheDocument();
  });

  it('shows empty state when no pending approvals', () => {
    mockUsePendingApprovalsQuery.mockReturnValue({
      data: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, first: true, last: true },
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    expect(screen.getByText('No pending approvals. All caught up! 🎉')).toBeInTheDocument();
  });

  it('opens decision modal when Review is clicked', () => {
    mockUsePendingApprovalsQuery.mockReturnValue({
      data: pagedApprovals,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    const reviewButtons = screen.getAllByRole('button', { name: 'Review' });
    fireEvent.click(reviewButtons[0]);

    // Modal should appear
    expect(screen.getByText('Review Approval')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Request Changes' })).toBeInTheDocument();
  });

  it('calls approve mutation when Approve button is clicked in modal', () => {
    mockUsePendingApprovalsQuery.mockReturnValue({
      data: pagedApprovals,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    // Open modal for first approval (not self-submitted)
    const reviewButtons = screen.getAllByRole('button', { name: 'Review' });
    fireEvent.click(reviewButtons[0]);

    // Click Approve
    const approveBtn = screen.getByRole('button', { name: 'Approve' });
    fireEvent.click(approveBtn);

    // mutate is called with (variables, options) — check the first argument
    expect(mockMutate).toHaveBeenCalledTimes(1);
    const [variables] = mockMutate.mock.calls[0];
    expect(variables.id).toBe('apr-001');
    expect(variables.decision.action).toBe('APPROVE');
  });

  it('calls reject mutation when Reject button is clicked', () => {
    mockUsePendingApprovalsQuery.mockReturnValue({
      data: pagedApprovals,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    const reviewButtons = screen.getAllByRole('button', { name: 'Review' });
    fireEvent.click(reviewButtons[0]);

    const rejectBtn = screen.getByRole('button', { name: 'Reject' });
    fireEvent.click(rejectBtn);

    // mutate is called with (variables, options) — check the first argument
    expect(mockMutate).toHaveBeenCalledTimes(1);
    const [variables] = mockMutate.mock.calls[0];
    expect(variables.id).toBe('apr-001');
    expect(variables.decision.action).toBe('REJECT');
  });

  it('disables Approve button for self-approval in modal', () => {
    mockUsePendingApprovalsQuery.mockReturnValue({
      data: pagedApprovals,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    // Open modal for second approval (self-submitted)
    const reviewButtons = screen.getAllByRole('button', { name: 'Review' });
    fireEvent.click(reviewButtons[1]);

    const approveBtn = screen.getByRole('button', { name: 'Approve' });
    expect(approveBtn).toBeDisabled();
  });
});
