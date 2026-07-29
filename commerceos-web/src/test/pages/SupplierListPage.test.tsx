import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import SupplierListPage from '../../pages/SupplierListPage';

vi.mock('../../hooks/useSupplierQuery', () => ({
  useSupplierQuery: vi.fn(),
  useSupplierProductsQuery: vi.fn().mockReturnValue({ data: [], refetch: vi.fn() }),
}));

import { useSupplierQuery } from '../../hooks/useSupplierQuery';
const mockUseSupplierQuery = useSupplierQuery as ReturnType<typeof vi.fn>;

function renderWithProviders() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SupplierListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SupplierListPage', () => {
  it('renders loading state', () => {
    mockUseSupplierQuery.mockReturnValue({ data: undefined, isLoading: true, error: null });
    renderWithProviders();
    expect(screen.getByText('Loading suppliers...')).toBeInTheDocument();
  });

  it('renders supplier table with summary cards', () => {
    mockUseSupplierQuery.mockReturnValue({
      data: [
        {
          id: '1',
          name: 'Acme Electronics',
          contactEmail: 'sales@acme.com',
          paymentTerms: 'NET_30',
          active: true,
          performance: { fulfillmentRate: 98.5, avgLeadTimeDays: 5 },
        },
      ],
      isLoading: false,
      error: null,
    });

    renderWithProviders();
    expect(screen.getByText('Acme Electronics')).toBeInTheDocument();
    expect(screen.getByText('sales@acme.com')).toBeInTheDocument();
    expect(screen.getByText('98.5%')).toBeInTheDocument();
  });
});
