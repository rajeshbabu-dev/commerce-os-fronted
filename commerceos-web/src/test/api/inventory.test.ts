import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listStockItems, listProducts } from '../../api/inventory';
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
};

describe('Inventory API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listStockItems', () => {
    it('calls GET /inventory/stock-items with pagination params and returns unwrapped data', async () => {
      const mockPaged = {
        content: [
          {
            id: '1',
            product: { id: 'p1', name: 'Test', sku: 'TST-001' },
            quantityOnHand: 50,
            status: 'HEALTHY',
          },
        ],
        page: 0,
        size: 100,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
      };
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: mockPaged },
      });

      const result = await listStockItems({ page: 0, size: 100 });

      expect(mockApi.get).toHaveBeenCalledWith('/inventory/stock-items', {
        params: { page: 0, size: 100 },
      });
      expect(result).toEqual(mockPaged);
    });
  });

  describe('listProducts', () => {
    it('calls GET /inventory/products with pagination params and returns unwrapped data', async () => {
      const mockPaged = {
        content: [{ id: 'p1', name: 'Test Product', sku: 'TST-001' }],
        page: 0,
        size: 100,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
      };
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: mockPaged },
      });

      const result = await listProducts({ page: 0, size: 100 });

      expect(mockApi.get).toHaveBeenCalledWith('/inventory/products', {
        params: { page: 0, size: 100 },
      });
      expect(result).toEqual(mockPaged);
    });
  });
});
