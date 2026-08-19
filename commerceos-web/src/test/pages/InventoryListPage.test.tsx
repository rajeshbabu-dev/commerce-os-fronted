import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import InventoryListPage from '../../pages/InventoryListPage';

// Mock the useInventoryQuery hook
vi.mock('../../hooks/useInventoryQuery', () => ({
  useInventoryQuery: vi.fn(),
}));

import { useInventoryQuery } from '../../hooks/useInventoryQuery';
const mockUseInventoryQuery = useInventoryQuery as ReturnType<typeof vi.fn>;

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <InventoryListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const mockPagedData = {
  content: [
    {
      id: '1',
      product: {
        id: 'p1',
        name: 'Wireless Headphones',
        sku: 'SKU-WBH-001',
        description: 'Test description',
        unitOfMeasure: 'UNIT',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      quantityOnHand: 150,
      quantityReserved: 10,
      reorderPoint: 25,
      safetyStock: 10,
      status: 'HEALTHY',
      version: 0,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: '2',
      product: {
        id: 'p2',
        name: 'Monitor Stand',
        sku: 'SKU-MSA-005',
        description: null,
        unitOfMeasure: 'UNIT',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      quantityOnHand: 0,
      quantityReserved: 0,
      reorderPoint: 10,
      safetyStock: 5,
      status: 'OUT_OF_STOCK',
      version: 0,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ],
  page: 0,
  size: 20,
  totalElements: 2,
  totalPages: 1,
  first: true,
  last: true,
};

describe('InventoryListPage', () => {
  it('renders loading state', () => {
    mockUseInventoryQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderWithProviders();
    expect(screen.getByText('Loading inventory...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseInventoryQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    });

    renderWithProviders();
    expect(
      screen.getByText('Failed to load inventory data. Please try again.'),
    ).toBeInTheDocument();
  });

  it('renders inventory table with stock items', () => {
    mockUseInventoryQuery.mockReturnValue({
      data: mockPagedData,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    // Check table data
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('SKU-WBH-001')).toBeInTheDocument();
    expect(screen.getByText('Monitor Stand')).toBeInTheDocument();
    expect(screen.getByText('SKU-MSA-005')).toBeInTheDocument();

    // Check status badges (summary card + badge both contain 'Healthy')
    expect(screen.getAllByText('Healthy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Out of Stock').length).toBeGreaterThanOrEqual(1);

    // Check summary cards
    expect(screen.getByText('Total SKUs')).toBeInTheDocument();
  });

  it('renders empty state when no items', () => {
    mockUseInventoryQuery.mockReturnValue({
      data: { ...mockPagedData, content: [], totalElements: 0 },
      isLoading: false,
      error: null,
    });

    renderWithProviders();
    expect(screen.getByText('No inventory items found.')).toBeInTheDocument();
  });
});
