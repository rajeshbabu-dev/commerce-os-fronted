/* =============================================================================
   CommerceOS — EventLogPage Tests
   ============================================================================= */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EventLogPage from '../../pages/EventLogPage';
import type { PagedResponse, EventLogEntry } from '../../api/analytics';

vi.mock('../../hooks/useAnalyticsQuery', () => ({
  useDomainEventsQuery: vi.fn(),
}));

vi.mock('../../api/analytics', () => ({
  exportDomainEvents: vi.fn(),
}));

import { useDomainEventsQuery } from '../../hooks/useAnalyticsQuery';
import { exportDomainEvents } from '../../api/analytics';

const mockUseDomainEventsQuery = useDomainEventsQuery as ReturnType<typeof vi.fn>;
const mockExportDomainEvents = exportDomainEvents as ReturnType<typeof vi.fn>;

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <EventLogPage />
    </QueryClientProvider>,
  );
}

const samplePage: PagedResponse<EventLogEntry> = {
  content: [
    {
      id: 'evt-001',
      eventType: 'inventory.low-stock-detected',
      sourceExchange: 'inventory.events',
      correlationId: 'corr-1',
      productId: '11111111-1111-1111-1111-111111111111',
      entityId: null,
      actorId: null,
      amount: null,
      confidenceScore: null,
      decision: null,
      payload: '{}',
      occurredAt: '2026-08-06T10:00:00',
    },
    {
      id: 'evt-002',
      eventType: 'procurement.po-created',
      sourceExchange: 'procurement.events',
      correlationId: 'corr-2',
      productId: null,
      entityId: '22222222-2222-2222-2222-222222222222',
      actorId: '33333333-3333-3333-3333-333333333333',
      amount: 5000,
      confidenceScore: null,
      decision: null,
      payload: '{}',
      occurredAt: '2026-08-06T09:00:00',
    },
  ],
  page: 0,
  size: 20,
  totalElements: 2,
  totalPages: 1,
  first: true,
  last: true,
};

describe('EventLogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state while fetching', () => {
    mockUseDomainEventsQuery.mockReturnValue({ data: undefined, isLoading: true, error: null });
    renderWithProviders();
    expect(screen.getByText('Loading events...')).toBeInTheDocument();
  });

  it('renders one row per event with type and timestamp', () => {
    mockUseDomainEventsQuery.mockReturnValue({ data: samplePage, isLoading: false, error: null });
    renderWithProviders();

    const rows = screen.getAllByTestId('event-row');
    expect(rows).toHaveLength(2);
    expect(screen.getByText('inventory.low-stock-detected')).toBeInTheDocument();
    expect(screen.getByText('procurement.po-created')).toBeInTheDocument();
    expect(screen.getByTestId('total-events')).toHaveTextContent('2 event(s)');
  });

  it('disables the export button when there are no events', () => {
    mockUseDomainEventsQuery.mockReturnValue({
      data: { ...samplePage, content: [], totalElements: 0 },
      isLoading: false,
      error: null,
    });
    renderWithProviders();
    expect(screen.getByTestId('export-csv')).toBeDisabled();
  });

  it('exports a CSV blob on click', async () => {
    mockUseDomainEventsQuery.mockReturnValue({ data: samplePage, isLoading: false, error: null });
    mockExportDomainEvents.mockResolvedValue(new Blob(['a,b'], { type: 'text/csv' }));
    URL.createObjectURL = vi.fn(() => 'blob:mock');
    URL.revokeObjectURL = vi.fn();

    renderWithProviders();
    fireEvent.click(screen.getByTestId('export-csv'));

    expect(mockExportDomainEvents).toHaveBeenCalledWith(undefined);
    await screen.findByText('Export CSV');
  });

  it('resets to page 0 when the filter changes', () => {
    mockUseDomainEventsQuery.mockReturnValue({ data: samplePage, isLoading: false, error: null });
    renderWithProviders();

    fireEvent.change(screen.getByTestId('event-type-filter'), {
      target: { value: 'inventory.low-stock-detected' },
    });

    expect(mockUseDomainEventsQuery).toHaveBeenLastCalledWith({
      eventType: 'inventory.low-stock-detected',
      page: 0,
    });
  });
});
