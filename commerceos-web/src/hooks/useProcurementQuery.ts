/* =============================================================================
   CommerceOS — Procurement Query Hooks
   ============================================================================= */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createFromRecommendation,
  createPurchaseOrder,
  getPurchaseOrder,
  listPurchaseOrders,
  submitPurchaseOrder,
  type CreatePoRequest,
  type PurchaseOrderResponse,
  type PagedResponse,
} from '../api/procurement';

export function usePurchaseOrderListQuery(status?: string) {
  return useQuery<PagedResponse<PurchaseOrderResponse>, Error>({
    queryKey: ['purchaseOrders', status ?? 'ALL'],
    queryFn: () => listPurchaseOrders(status),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function usePurchaseOrderQuery(id: string) {
  return useQuery<PurchaseOrderResponse, Error>({
    queryKey: ['purchaseOrder', id],
    queryFn: () => getPurchaseOrder(id),
    staleTime: 30_000,
  });
}

export function useCreatePurchaseOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<PurchaseOrderResponse, Error, CreatePoRequest>({
    mutationFn: (request: CreatePoRequest) => createPurchaseOrder(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });
}

export function useCreateFromRecommendationMutation() {
  const queryClient = useQueryClient();

  return useMutation<PurchaseOrderResponse, Error, string>({
    mutationFn: (recommendationId: string) =>
      createFromRecommendation(recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

export function useSubmitPurchaseOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    PurchaseOrderResponse,
    Error,
    { id: string; idempotencyKey?: string }
  >({
    mutationFn: ({ id, idempotencyKey }) =>
      submitPurchaseOrder(id, idempotencyKey),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({
        queryKey: ['purchaseOrder', variables.id],
      });
    },
  });
}
