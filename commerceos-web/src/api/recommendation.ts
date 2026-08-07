/* =============================================================================
   CommerceOS — Recommendation API
   ============================================================================= */

import api from './axios';
import type { ApiResponse } from './auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RecommendationStatus = 'OPEN' | 'DISMISSED' | 'PO_CREATED';

export interface PurchaseRecommendationResponse {
  id: string;
  productId: string;
  recommendedSupplierId: string;
  recommendedQuantity: number;
  unitCost: number;
  estimatedTotalCost: number;
  urgencyLevel: UrgencyLevel | string;
  confidenceScore: number;
  llmReasoning: string | null;
  status: RecommendationStatus | string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Recommendation API Functions
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

export async function listRecommendations(
  status?: string,
): Promise<PagedResponse<PurchaseRecommendationResponse>> {
  const { data } = await api.get<ApiResponse<PagedResponse<PurchaseRecommendationResponse>>>(
    '/recommendations',
    {
      params: status && status !== 'ALL' ? { status } : undefined,
    },
  );
  return data.data;
}

export async function getRecommendation(
  id: string,
): Promise<PurchaseRecommendationResponse> {
  const { data } = await api.get<ApiResponse<PurchaseRecommendationResponse>>(
    `/recommendations/${id}`,
  );
  return data.data;
}

export async function generateRecommendation(
  productId: string,
): Promise<PurchaseRecommendationResponse> {
  const { data } = await api.post<ApiResponse<PurchaseRecommendationResponse>>(
    '/recommendations/generate',
    { productId },
  );
  return data.data;
}

export async function dismissRecommendation(
  id: string,
): Promise<PurchaseRecommendationResponse> {
  const { data } = await api.post<ApiResponse<PurchaseRecommendationResponse>>(
    `/recommendations/${id}/dismiss`,
  );
  return data.data;
}
