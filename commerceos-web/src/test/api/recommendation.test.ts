import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listRecommendations,
  getRecommendation,
  generateRecommendation,
  dismissRecommendation,
  type PurchaseRecommendationResponse,
} from '../../api/recommendation';
import api from '../../api/axios';

vi.mock('../../api/axios', async () => {
  const actual = await vi.importActual('../../api/axios');
  const mockApi = {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return { ...actual, default: mockApi };
});

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

describe('Recommendation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRec: PurchaseRecommendationResponse = {
    id: 'rec-101',
    productId: 'prod-01',
    recommendedSupplierId: 'sup-01',
    recommendedQuantity: 100,
    unitCost: 15.5,
    estimatedTotalCost: 1550,
    urgencyLevel: 'CRITICAL',
    confidenceScore: 0.95,
    llmReasoning: 'Stock level is below safety margin and lead time is 7 days.',
    status: 'OPEN',
    createdAt: '2026-07-30T10:00:00Z',
  };

  describe('listRecommendations', () => {
    it('calls GET /recommendations without params when status is omitted', async () => {
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: [mockRec] },
      });

      const result = await listRecommendations();

      expect(mockApi.get).toHaveBeenCalledWith('/recommendations', {
        params: undefined,
      });
      expect(result).toEqual([mockRec]);
    });

    it('calls GET /recommendations with status parameter when provided', async () => {
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: [mockRec] },
      });

      const result = await listRecommendations('OPEN');

      expect(mockApi.get).toHaveBeenCalledWith('/recommendations', {
        params: { status: 'OPEN' },
      });
      expect(result).toEqual([mockRec]);
    });
  });

  describe('getRecommendation', () => {
    it('calls GET /recommendations/:id and returns unwrapped data', async () => {
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: mockRec },
      });

      const result = await getRecommendation('rec-101');

      expect(mockApi.get).toHaveBeenCalledWith('/recommendations/rec-101');
      expect(result).toEqual(mockRec);
    });
  });

  describe('generateRecommendation', () => {
    it('calls POST /recommendations/generate with productId', async () => {
      mockApi.post.mockResolvedValue({
        data: { success: true, message: 'OK', data: mockRec },
      });

      const result = await generateRecommendation('prod-01');

      expect(mockApi.post).toHaveBeenCalledWith('/recommendations/generate', {
        productId: 'prod-01',
      });
      expect(result).toEqual(mockRec);
    });
  });

  describe('dismissRecommendation', () => {
    it('calls POST /recommendations/:id/dismiss', async () => {
      const dismissedRec = { ...mockRec, status: 'DISMISSED' };
      mockApi.post.mockResolvedValue({
        data: { success: true, message: 'OK', data: dismissedRec },
      });

      const result = await dismissRecommendation('rec-101');

      expect(mockApi.post).toHaveBeenCalledWith('/recommendations/rec-101/dismiss');
      expect(result).toEqual(dismissedRec);
    });
  });
});
