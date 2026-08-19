import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PurchaseOrderDetailPage from '../../pages/PurchaseOrderDetailPage';

// Mock TanStack query hooks
vi.mock('../../hooks/useProcurementQuery', () => ({
  usePurchaseOrderQuery: vi.fn(),
  useSubmitPurchaseOrderMutation: vi.fn(),
}));

import {
  usePurchaseOrderQuery,
  useSubmitPurchaseOrderMutation,
} from '../../hooks/useProcurementQuery';

const mockUsePurchaseOrderQuery = usePurchaseOrderQuery as ReturnType<typeof vi.fn>;
const mockUseSubmitPurchaseOrderMutation = useSubmitPurchaseOrderMutation as ReturnType<typeof vi.fn>;

function renderWithProviders(poId = 'po-001') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/purchase-orders/${poId}`]}>
        <Routes>
          <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PurchaseOrderDetailPage', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSubmitPurchaseOrderMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  const sampleOrder = {
    id: 'po-001',
    supplierId: 'sup-001',
    createdBy: 'user-01',
    recommendationId: null,
    totalAmount: 1500.0,
    status: 'DRAFT',
    items: [
      { id: 'item-1', productId: 'prod-01', quantity: 10, unitPrice: 150.0, subtotal: 1500.0 },
      { id: 'item-2', productId: 'prod-02', quantity: 5, unitPrice: 100.0, subtotal: 500.0 },
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-07-30T10:00:00Z',
  };

  it('renders loading state', () => {
    mockUsePurchaseOrderQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderWithProviders();
    expect(screen.getByText('Loading purchase order...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUsePurchaseOrderQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    });

    renderWithProviders();
    expect(screen.getByText('Failed to load purchase order. Please try again.')).toBeInTheDocument();
  });

  it('renders PO details with items', () => {
    mockUsePurchaseOrderQuery.mockReturnValue({
      data: sampleOrder,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    // Page title
    expect(screen.getByText('Purchase Order')).toBeInTheDocument();

    // Status badge
    expect(screen.getByText('DRAFT')).toBeInTheDocument();

    // Items table headers
    expect(screen.getByText('Product ID')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Unit Price')).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();

    // Product IDs visible
    expect(screen.getByText(/prod-01/)).toBeInTheDocument();
    expect(screen.getByText(/prod-02/)).toBeInTheDocument();
  });

  it('shows submit button for DRAFT status', () => {
    mockUsePurchaseOrderQuery.mockReturnValue({
      data: sampleOrder,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    expect(screen.getByRole('button', { name: 'Submit for Approval' })).toBeInTheDocument();
  });

  it('hides submit button for non-DRAFT status', () => {
    mockUsePurchaseOrderQuery.mockReturnValue({
      data: { ...sampleOrder, status: 'APPROVED' },
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    expect(screen.queryByRole('button', { name: 'Submit for Approval' })).toBeNull();
  });

  it('calls submit mutation when Submit button is clicked', () => {
    mockUsePurchaseOrderQuery.mockReturnValue({
      data: sampleOrder,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    const submitBtn = screen.getByRole('button', { name: 'Submit for Approval' });
    fireEvent.click(submitBtn);

    expect(mockMutate).toHaveBeenCalledWith({ id: 'po-001' });
  });
});
