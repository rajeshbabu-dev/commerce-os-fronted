/* =============================================================================
   CommerceOS — Workflow / Approval API
   ============================================================================= */

import api from './axios';
import type { ApiResponse } from './auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED';

export type ApprovalDecision = 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';

export interface ApprovalRequestResponse {
  id: string;
  entityType: string;
  entityId: string;
  status: ApprovalStatus | string;
  submittedBy: string;
  submitterName: string | null;
  assignedRole: string;
  thresholdAmount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalDecisionRequest {
  action: ApprovalDecision;
  comment?: string;
}

// ---------------------------------------------------------------------------
// Workflow API Functions
// ---------------------------------------------------------------------------

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export async function listPendingApprovals(): Promise<PagedResponse<ApprovalRequestResponse>> {
  const { data } = await api.get<ApiResponse<PagedResponse<ApprovalRequestResponse>>>(
    '/workflow/approvals/pending',
  );
  return data.data;
}

export async function getApprovalRequest(
  id: string,
): Promise<ApprovalRequestResponse> {
  const { data } = await api.get<ApiResponse<ApprovalRequestResponse>>(
    `/workflow/approvals/${id}`,
  );
  return data.data;
}

export async function decideApproval(
  id: string,
  decision: ApprovalDecisionRequest,
): Promise<ApprovalRequestResponse> {
  const { data } = await api.post<ApiResponse<ApprovalRequestResponse>>(
    `/workflow/approvals/${id}/decide`,
    decision,
  );
  return data.data;
}
