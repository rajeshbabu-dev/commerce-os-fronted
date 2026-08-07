/* =============================================================================
   CommerceOS — Procurement API
   ============================================================================= */

import api from './axios';
import type { ApiResponse } from './auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PoStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SENT';

export interface PoItemResponse {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseOrderResponse {
  id: string;
  supplierId: string;
  createdBy: string;
  recommendationId: string | null;
  totalAmount: number;
  status: PoStatus | string;
  items: PoItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePoItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePoRequest {
  supplierId: string;
  recommendationId?: string;
  items: CreatePoItemRequest[];
  idempotencyKey?: string;
}

// ---------------------------------------------------------------------------
// Procurement API Functions
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

export async function listPurchaseOrders(
  status?: string,
): Promise<PagedResponse<PurchaseOrderResponse>> {
  const { data } = await api.get<ApiResponse<PagedResponse<PurchaseOrderResponse>>>(
    '/procurement/orders',
    {
      params: status && status !== 'ALL' ? { status } : undefined,
    },
  );
  return data.data;
}

export async function getPurchaseOrder(
  id: string,
): Promise<PurchaseOrderResponse> {
  const { data } = await api.get<ApiResponse<PurchaseOrderResponse>>(
    `/procurement/orders/${id}`,
  );
  return data.data;
}

export async function createPurchaseOrder(
  request: CreatePoRequest,
): Promise<PurchaseOrderResponse> {
  const { data } = await api.post<ApiResponse<PurchaseOrderResponse>>(
    '/procurement/orders',
    request,
  );
  return data.data;
}

export async function createFromRecommendation(
  recommendationId: string,
): Promise<PurchaseOrderResponse> {
  const { data } = await api.post<ApiResponse<PurchaseOrderResponse>>(
    `/procurement/orders/from-recommendation/${recommendationId}`,
  );
  return data.data;
}

export async function submitPurchaseOrder(
  id: string,
  idempotencyKey?: string,
): Promise<PurchaseOrderResponse> {
  const { data } = await api.post<ApiResponse<PurchaseOrderResponse>>(
    `/procurement/orders/${id}/submit`,
    null,
    {
      params: idempotencyKey ? { idempotencyKey } : undefined,
    },
  );
  return data.data;
}
