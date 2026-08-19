import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listSuppliers } from '../../api/supplier';
import api from '../../api/axios';

vi.mock('../../api/axios', async () => {
  const actual = await vi.importActual('../../api/axios');
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  };
  return { ...actual, default: mockApi };
});

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn> };

describe('Supplier API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listSuppliers calls GET /suppliers with pagination params and unwraps data', async () => {
    const mockPaged = {
      content: [
        { id: '1', name: 'Acme', contactEmail: 'acme@test.com', paymentTerms: 'NET_30', active: true },
      ],
      page: 0,
      size: 100,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    };
    mockApi.get.mockResolvedValue({ data: { success: true, message: 'OK', data: mockPaged } });

    const result = await listSuppliers({ page: 0, size: 100 });
    expect(mockApi.get).toHaveBeenCalledWith('/suppliers', {
      params: { page: 0, size: 100 },
    });
    expect(result).toEqual(mockPaged);
  });
});
