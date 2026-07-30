import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import RecommendationListPage from '../../pages/RecommendationListPage';

// Mock TanStack query hooks
vi.mock('../../hooks/useRecommendationQuery', () => ({
  useRecommendationQuery: vi.fn(),
  useDismissRecommendationMutation: vi.fn(),
}));

import {
  useRecommendationQuery,
  useDismissRecommendationMutation,
} from '../../hooks/useRecommendationQuery';

const mockUseRecommendationQuery = useRecommendationQuery as ReturnType<typeof vi.fn>;
const mockUseDismissRecommendationMutation = useDismissRecommendationMutation as ReturnType<typeof vi.fn>;

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RecommendationListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('RecommendationListPage', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDismissRecommendationMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  const sampleRecommendations = [
    {
      id: 'rec-1',
      productId: 'prod-001',
      recommendedSupplierId: 'sup-100',
      recommendedQuantity: 50,
      unitCost: 20.0,
      estimatedTotalCost: 1000.0,
      urgencyLevel: 'CRITICAL',
      confidenceScore: 0.92,
      llmReasoning: 'Urgent stockout expected in 2 days.',
      status: 'OPEN',
      createdAt: '2026-07-30T10:00:00Z',
    },
    {
      id: 'rec-2',
      productId: 'prod-002',
      recommendedSupplierId: 'sup-200',
      recommendedQuantity: 20,
      unitCost: 15.0,
      estimatedTotalCost: 300.0,
      urgencyLevel: 'HIGH',
      confidenceScore: 0.85,
      llmReasoning: null, // AI insight unavailable fallback test
      status: 'OPEN',
      createdAt: '2026-07-30T11:00:00Z',
    },
    {
      id: 'rec-3',
      productId: 'prod-003',
      recommendedSupplierId: 'sup-300',
      recommendedQuantity: 10,
      unitCost: 50.0,
      estimatedTotalCost: 500.0,
      urgencyLevel: 'MEDIUM',
      confidenceScore: 0.75,
      llmReasoning: 'Normal reorder cycle.',
      status: 'DISMISSED',
      createdAt: '2026-07-30T12:00:00Z',
    },
  ];

  it('renders loading state', () => {
    mockUseRecommendationQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderWithProviders();
    expect(screen.getByText('Loading recommendations...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseRecommendationQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    });

    renderWithProviders();
    expect(
      screen.getByText('Failed to load recommendations. Please try again.'),
    ).toBeInTheDocument();
  });

  it('renders recommendation list with summary statistics and cards', () => {
    mockUseRecommendationQuery.mockReturnValue({
      data: sampleRecommendations,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    // Page title
    expect(screen.getByText('Purchase Recommendations')).toBeInTheDocument();

    // Summary statistics cards
    expect(screen.getByText('Total Open')).toBeInTheDocument();
    expect(screen.getByText('Critical Urgency')).toBeInTheDocument();
    expect(screen.getByText('Est Total Spend')).toBeInTheDocument();

    // Product IDs on cards
    expect(screen.getByText('Product ID: prod-001')).toBeInTheDocument();
    expect(screen.getByText('Product ID: prod-002')).toBeInTheDocument();

    // Check AI reasoning box & fallback
    expect(screen.getByText('Urgent stockout expected in 2 days.')).toBeInTheDocument();
    expect(screen.getByText('AI insight unavailable')).toBeInTheDocument();

    // Urgency badges
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('handles tab switching between All, Open, and Dismissed', () => {
    mockUseRecommendationQuery.mockReturnValue({
      data: sampleRecommendations,
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    // Initially ALL recommendations are shown
    expect(screen.getByText('Product ID: prod-001')).toBeInTheDocument();
    expect(screen.getByText('Product ID: prod-003')).toBeInTheDocument();

    // Switch to Open tab
    const openTab = screen.getByRole('button', { name: 'Open' });
    fireEvent.click(openTab);

    expect(screen.getByText('Product ID: prod-001')).toBeInTheDocument();
    expect(screen.queryByText('Product ID: prod-003')).toBeNull();

    // Switch to Dismissed tab
    const dismissedTab = screen.getByRole('button', { name: 'Dismissed' });
    fireEvent.click(dismissedTab);

    expect(screen.queryByText('Product ID: prod-001')).toBeNull();
    expect(screen.getByText('Product ID: prod-003')).toBeInTheDocument();
  });

  it('calls dismiss mutation when Dismiss button is clicked', () => {
    mockUseRecommendationQuery.mockReturnValue({
      data: [sampleRecommendations[0]],
      isLoading: false,
      error: null,
    });

    renderWithProviders();

    const dismissBtn = screen.getByRole('button', { name: 'Dismiss' });
    fireEvent.click(dismissBtn);

    expect(mockMutate).toHaveBeenCalledWith('rec-1');
  });
});
