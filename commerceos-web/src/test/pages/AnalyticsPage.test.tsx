/* =============================================================================
   CommerceOS — AnalyticsPage Tests
   ============================================================================= */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AnalyticsPage from '../../pages/AnalyticsPage';
import type { DashboardResponse } from '../../api/analytics';

vi.mock('../../hooks/useAnalyticsQuery', () => ({
  useDashboardQuery: vi.fn(),
}));

import { useDashboardQuery } from '../../hooks/useAnalyticsQuery';

const mockUseDashboardQuery = useDashboardQuery as ReturnType<typeof vi.fn>;

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AnalyticsPage />
    </QueryClientProvider>,
  );
}

const sampleDashboard: DashboardResponse = {
  inventoryHealth: { key: 'inventoryHealth', label: 'Inventory Health', value: 66.67, unit: '%', description: 'd' },
  supplierScore: { key: 'supplierScore', label: 'Supplier Score', value: 85, unit: '%', description: 'd' },
  procurementCost: { key: 'procurementCost', label: 'Procurement Cost', value: 5000, unit: 'INR', description: 'd' },
  inventoryTurnover: { key: 'inventoryTurnover', label: 'Inventory Turnover', value: 1.5, unit: 'events/SKU', description: 'd' },
  stockoutRisk: { key: 'stockoutRisk', label: 'Stockout Risk', value: 50, unit: '%', description: 'd' },
  deadStock: { key: 'deadStock', label: 'Dead Stock', value: 1, unit: 'SKUs', description: 'd' },
  funnel: { lowStockAlerts: 3, recommendations: 1, poCreated: 1, approvals: 1 },
  activeUsers: 2,
  trends: [
    { date: '2026-08-06', lowStockAlerts: 3, recommendations: 1, poCreated: 1, approvals: 1 },
  ],
  computedAt: '2026-08-07T10:00:00',
};

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state while fetching', () => {
    mockUseDashboardQuery.mockReturnValue({ data: undefined, isLoading: true, error: null });
    renderWithProviders();
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('shows an error card when the query fails', () => {
    mockUseDashboardQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
    });
    renderWithProviders();
    expect(screen.getByText(/Failed to load analytics/i)).toBeInTheDocument();
  });

  it('renders all 6 KPI cards with values', () => {
    mockUseDashboardQuery.mockReturnValue({ data: sampleDashboard, isLoading: false, error: null });
    renderWithProviders();

    expect(screen.getByText('Inventory Health')).toBeInTheDocument();
    expect(screen.getByText('Supplier Score')).toBeInTheDocument();
    expect(screen.getByText('Procurement Cost')).toBeInTheDocument();
    expect(screen.getByText('Inventory Turnover')).toBeInTheDocument();
    expect(screen.getByText('Stockout Risk')).toBeInTheDocument();
    expect(screen.getByText('Dead Stock')).toBeInTheDocument();

    expect(screen.getByText('₹5,000')).toBeInTheDocument();
    expect(screen.getByText('1 SKUs')).toBeInTheDocument();
    expect(screen.getByTestId('active-users')).toHaveTextContent('2');
  });

  it('renders both chart sections (trends and funnel)', () => {
    mockUseDashboardQuery.mockReturnValue({ data: sampleDashboard, isLoading: false, error: null });
    renderWithProviders();

    expect(screen.getByText('Event Trends (14 days)')).toBeInTheDocument();
    expect(screen.getByText('Procurement Funnel')).toBeInTheDocument();
  });
});
