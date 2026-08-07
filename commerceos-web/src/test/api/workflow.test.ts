import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listPendingApprovals,
  getApprovalRequest,
  decideApproval,
  type ApprovalRequestResponse,
} from '../../api/workflow';
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

describe('Workflow API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockApproval: ApprovalRequestResponse = {
    id: 'apr-101',
    entityType: 'PURCHASE_ORDER',
    entityId: 'po-001',
    status: 'PENDING',
    submittedBy: 'user-01',
    submitterName: 'John Doe',
    assignedRole: 'PROCUREMENT_MANAGER',
    thresholdAmount: 1000.0,
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-07-30T10:00:00Z',
  };

  describe('listPendingApprovals', () => {
    it('calls GET /workflow/approvals/pending and returns paged data', async () => {
      const pagedData = { content: [mockApproval], page: 0, size: 20, totalElements: 1, totalPages: 1, first: true, last: true };
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: pagedData },
      });

      const result = await listPendingApprovals();

      expect(mockApi.get).toHaveBeenCalledWith('/workflow/approvals/pending');
      expect(result).toEqual(pagedData);
    });

    it('returns empty content when no pending approvals', async () => {
      const pagedData = { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, first: true, last: true };
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: pagedData },
      });

      const result = await listPendingApprovals();

      expect(result.content).toEqual([]);
    });
  });

  describe('getApprovalRequest', () => {
    it('calls GET /workflow/approvals/:id and returns unwrapped data', async () => {
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: mockApproval },
      });

      const result = await getApprovalRequest('apr-101');

      expect(mockApi.get).toHaveBeenCalledWith('/workflow/approvals/apr-101');
      expect(result).toEqual(mockApproval);
    });
  });

  describe('decideApproval', () => {
    it('calls POST /workflow/approvals/:id/decide with APPROVE action', async () => {
      const approvedApproval = { ...mockApproval, status: 'APPROVED' };
      mockApi.post.mockResolvedValue({
        data: { success: true, message: 'OK', data: approvedApproval },
      });

      const result = await decideApproval('apr-101', { action: 'APPROVE', comment: 'Looks good' });

      expect(mockApi.post).toHaveBeenCalledWith('/workflow/approvals/apr-101/decide', {
        action: 'APPROVE',
        comment: 'Looks good',
      });
      expect(result.status).toBe('APPROVED');
    });

    it('calls POST with REJECT action', async () => {
      const rejectedApproval = { ...mockApproval, status: 'REJECTED' };
      mockApi.post.mockResolvedValue({
        data: { success: true, message: 'OK', data: rejectedApproval },
      });

      const result = await decideApproval('apr-101', { action: 'REJECT' });

      expect(mockApi.post).toHaveBeenCalledWith('/workflow/approvals/apr-101/decide', {
        action: 'REJECT',
      });
      expect(result.status).toBe('REJECTED');
    });

    it('calls POST with REQUEST_CHANGES action', async () => {
      const changesApproval = { ...mockApproval, status: 'CHANGES_REQUESTED' };
      mockApi.post.mockResolvedValue({
        data: { success: true, message: 'OK', data: changesApproval },
      });

      const result = await decideApproval('apr-101', { action: 'REQUEST_CHANGES', comment: 'Need more details' });

      expect(mockApi.post).toHaveBeenCalledWith('/workflow/approvals/apr-101/decide', {
        action: 'REQUEST_CHANGES',
        comment: 'Need more details',
      });
      expect(result.status).toBe('CHANGES_REQUESTED');
    });
  });
});
