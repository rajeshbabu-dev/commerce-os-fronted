import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import PurchaseOrderListPage from '../../pages/PurchaseOrderListPage';

// Mock TanStack query hooks
vi.mock('../../hooks/useProcurementQuery', () => ({
  usePurchaseOrderListQuery: vi.fn(),
  useSubmitPurchaseOrderMutation: vi.fn(),
}));

import {
  usePurchaseOrderListQuery,
  useSubmitPurchaseOrderMutation,
} from '../../hooks/useProcurementQuery';

const mockUsePurchaseOrderListQuery = usePurchaseOrderListQuery as ReturnType<typeof vi.fn>;
const mockUseSubmitPurchaseOrderMutation = useSubmitPurchaseOrderMutation as ReturnType<typeof vi.fn>;

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PurchaseOrderListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PurchaseOrderListPage', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSubmitPurchaseOrderMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  const sampleOrders = [
    {
      id: 'po-001',
      supplierId: 'sup-001',
      createdBy: 'user-01',
      recommendationId: null,
      totalAmount: 1500.0,
      status: 'DRAFT',
      items: [{ id: 'item-1', productId: 'prod-01', quantity: 10, unitPrice: 150.0, subtotal: 1500.0 }],
      createdAt: '2026-07-30T10:00:00Z',
      updatedAt: '2026-07-30T10:00:00Z',
    },
    {
      id: 'po-002',
      supplierId: 'sup-002',
      createdBy: 'user-01',
      recommendationId: 'rec-001',
      totalAmount: 570.0,
      status: 'PENDING_APPROVAL',
      items: [{ id: 'item-2', productId: 'prod-02', quantity: 15, unitPrice: 38.0, subtotal: 570.0 }],
      createdAt: '2026-07-30T11:00:00Z',
      updatedAt: '2026-07-30T11:00:00Z',
    },
  ];

  const pagedOrders = {
    content: sampleOrders,
    page: 0,
    size: 20,
    totalElements: sampleOrders.length,
    totalPages: 1,
    first: true,
    last: true,
  };

  it('renders loading state', () => {
    mockUsePurchaseOrderListQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderWithProviders();
    expect(screen.getByText('Loading purchase orders...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUsePurchaseOrderListQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    });

    renderWithProviders();
    expect(
      screen.getByText('Failed to load purchase orders. Please try again.'),
    ).toBeInTheDocument();
  });

  it('renders page title and summary cards', () => {
    mockUsePurchaseOrderListQuery.mockReturnValue({
      data: pagedOrders,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    expect(screen.getByText('Purchase Orders')).toBeInTheDocument();
    expect(screen.getByText('Total POs')).toBeInTheDocument();
    expect(screen.getByText('Pending Value')).toBeInTheDocument();
    expect(screen.getByText('Active Drafts')).toBeInTheDocument();
  });

  it('renders status filter tabs', () => {
    mockUsePurchaseOrderListQuery.mockReturnValue({
      data: pagedOrders,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    expect(screen.getByRole('button', { name: 'All Orders' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Draft' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pending' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approved' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rejected' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sent' })).toBeInTheDocument();
  });

  it('renders order table with data', () => {
    mockUsePurchaseOrderListQuery.mockReturnValue({
      data: pagedOrders,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    // Check table headers
    expect(screen.getByText('PO ID')).toBeInTheDocument();
    expect(screen.getByText('Supplier')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    // Check status badges
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.getByText('PENDING APPROVAL')).toBeInTheDocument();
  });

  it('shows empty state when no orders', () => {
    mockUsePurchaseOrderListQuery.mockReturnValue({
      data: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, first: true, last: true },
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    expect(screen.getByText(/No purchase orders found/)).toBeInTheDocument();
  });

  it('calls submit mutation when Submit button is clicked', () => {
    mockUsePurchaseOrderListQuery.mockReturnValue({
      data: pagedOrders,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitBtn);

    expect(mockMutate).toHaveBeenCalledWith({ id: 'po-001' });
  });

  it('hides Submit button for non-DRAFT orders', () => {
    mockUsePurchaseOrderListQuery.mockReturnValue({
      data: { content: [sampleOrders[1]], page: 0, size: 20, totalElements: 1, totalPages: 1, first: true, last: true },
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    expect(screen.queryByRole('button', { name: 'Submit' })).toBeNull();
  });
});
