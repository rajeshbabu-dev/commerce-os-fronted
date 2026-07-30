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

  it('listSuppliers calls GET /suppliers and unwraps data', async () => {
    const mockData = [{ id: '1', name: 'Acme', contactEmail: 'acme@test.com', paymentTerms: 'NET_30', active: true }];
    mockApi.get.mockResolvedValue({ data: { success: true, message: 'OK', data: mockData } });

    const result = await listSuppliers();
    expect(mockApi.get).toHaveBeenCalledWith('/suppliers');
    expect(result).toEqual(mockData);
  });
});
