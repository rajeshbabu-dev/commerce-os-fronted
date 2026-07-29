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
    it('calls GET /inventory/stock-items and returns unwrapped data', async () => {
      const mockItems = [
        {
          id: '1',
          product: { id: 'p1', name: 'Test', sku: 'TST-001' },
          quantityOnHand: 50,
          status: 'HEALTHY',
        },
      ];
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: mockItems },
      });

      const result = await listStockItems();

      expect(mockApi.get).toHaveBeenCalledWith('/inventory/stock-items');
      expect(result).toEqual(mockItems);
    });
  });

  describe('listProducts', () => {
    it('calls GET /inventory/products and returns unwrapped data', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Test Product', sku: 'TST-001' },
      ];
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: mockProducts },
      });

      const result = await listProducts();

      expect(mockApi.get).toHaveBeenCalledWith('/inventory/products');
      expect(result).toEqual(mockProducts);
    });
  });
});
