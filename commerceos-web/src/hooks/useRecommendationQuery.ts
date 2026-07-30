/* =============================================================================
   CommerceOS — Recommendation Query Hooks
   ============================================================================= */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  dismissRecommendation,
  generateRecommendation,
  listRecommendations,
  type PurchaseRecommendationResponse,
} from '../api/recommendation';

export function useRecommendationQuery(status?: string) {
  return useQuery<PurchaseRecommendationResponse[], Error>({
    queryKey: ['recommendations', status ?? 'ALL'],
    queryFn: () => listRecommendations(status),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useDismissRecommendationMutation() {
  const queryClient = useQueryClient();

  return useMutation<PurchaseRecommendationResponse, Error, string>({
    mutationFn: (id: string) => dismissRecommendation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

export function useGenerateRecommendationMutation() {
  const queryClient = useQueryClient();

  return useMutation<PurchaseRecommendationResponse, Error, string>({
    mutationFn: (productId: string) => generateRecommendation(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}
