/* =============================================================================
   CommerceOS — Approval Query Hooks
   ============================================================================= */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  decideApproval,
  listPendingApprovals,
  type ApprovalDecisionRequest,
  type ApprovalRequestResponse,
  type PagedResponse,
} from '../api/workflow';

export function usePendingApprovalsQuery() {
  return useQuery<PagedResponse<ApprovalRequestResponse>, Error>({
    queryKey: ['approvals', 'pending'],
    queryFn: () => listPendingApprovals(),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useDecideApprovalMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ApprovalRequestResponse,
    Error,
    { id: string; decision: ApprovalDecisionRequest }
  >({
    mutationFn: ({ id, decision }) => decideApproval(id, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}
