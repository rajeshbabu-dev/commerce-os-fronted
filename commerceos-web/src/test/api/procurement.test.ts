import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  createFromRecommendation,
  submitPurchaseOrder,
  type PurchaseOrderResponse,
} from '../../api/procurement';
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

describe('Procurement API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPo: PurchaseOrderResponse = {
    id: 'po-101',
    supplierId: 'sup-01',
    createdBy: 'user-01',
    recommendationId: null,
    totalAmount: 1500.0,
    status: 'DRAFT',
    items: [
      { id: 'item-1', productId: 'prod-01', quantity: 10, unitPrice: 150.0, subtotal: 1500.0 },
    ],
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-07-30T10:00:00Z',
  };

  describe('listPurchaseOrders', () => {
    it('calls GET /procurement/orders without params when status is omitted', async () => {
      const pagedData = { content: [mockPo], page: 0, size: 20, totalElements: 1, totalPages: 1, first: true, last: true };
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: pagedData },
      });

      const result = await listPurchaseOrders();

      expect(mockApi.get).toHaveBeenCalledWith('/procurement/orders', {
        params: undefined,
      });
      expect(result).toEqual(pagedData);
    });

    it('calls GET /procurement/orders with status parameter when provided', async () => {
      const pagedData = { content: [mockPo], page: 0, size: 20, totalElements: 1, totalPages: 1, first: true, last: true };
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: pagedData },
      });

      const result = await listPurchaseOrders('DRAFT');

      expect(mockApi.get).toHaveBeenCalledWith('/procurement/orders', {
        params: { status: 'DRAFT' },
      });
      expect(result).toEqual(pagedData);
    });

    it('returns empty content when no orders exist', async () => {
      const pagedData = { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, first: true, last: true };
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: pagedData },
      });

      const result = await listPurchaseOrders();

      expect(result.content).toEqual([]);
    });
  });

  describe('getPurchaseOrder', () => {
    it('calls GET /procurement/orders/:id and returns unwrapped data', async () => {
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: mockPo },
      });

      const result = await getPurchaseOrder('po-101');

      expect(mockApi.get).toHaveBeenCalledWith('/procurement/orders/po-101');
      expect(result).toEqual(mockPo);
    });
  });

  describe('createPurchaseOrder', () => {
    it('calls POST /procurement/orders with request body', async () => {
      mockApi.post.mockResolvedValue({
        data: { success: true, message: 'OK', data: mockPo },
      });

      const request = {
        supplierId: 'sup-01',
        items: [{ productId: 'prod-01', quantity: 10, unitPrice: 150.0 }],
      };

      const result = await createPurchaseOrder(request);

      expect(mockApi.post).toHaveBeenCalledWith('/procurement/orders', request);
      expect(result).toEqual(mockPo);
    });
  });

  describe('createFromRecommendation', () => {
    it('calls POST /procurement/orders/from-recommendation/:id', async () => {
      mockApi.post.mockResolvedValue({
        data: { success: true, message: 'OK', data: mockPo },
      });

      const result = await createFromRecommendation('rec-001');

      expect(mockApi.post).toHaveBeenCalledWith('/procurement/orders/from-recommendation/rec-001');
      expect(result).toEqual(mockPo);
    });
  });

  describe('submitPurchaseOrder', () => {
    it('calls POST /procurement/orders/:id/submit without idempotency key', async () => {
      const submittedPo = { ...mockPo, status: 'PENDING_APPROVAL' };
      mockApi.post.mockResolvedValue({
        data: { success: true, message: 'OK', data: submittedPo },
      });

      const result = await submitPurchaseOrder('po-101');

      expect(mockApi.post).toHaveBeenCalledWith('/procurement/orders/po-101/submit', null, {
        params: undefined,
      });
      expect(result.status).toBe('PENDING_APPROVAL');
    });

    it('calls POST with idempotency key when provided', async () => {
      const submittedPo = { ...mockPo, status: 'PENDING_APPROVAL' };
      mockApi.post.mockResolvedValue({
        data: { success: true, message: 'OK', data: submittedPo },
      });

      await submitPurchaseOrder('po-101', 'key-123');

      expect(mockApi.post).toHaveBeenCalledWith('/procurement/orders/po-101/submit', null, {
        params: { idempotencyKey: 'key-123' },
      });
    });
  });
});
