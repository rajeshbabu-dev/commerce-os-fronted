/* =============================================================================
   CommerceOS — Inventory API
   ============================================================================= */

import api from './axios';
import type { ApiResponse } from './auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  unitOfMeasure: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockItemResponse {
  id: string;
  product: ProductResponse;
  quantityOnHand: number;
  quantityReserved: number;
  reorderPoint: number;
  safetyStock: number;
  status: 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovementResponse {
  id: string;
  stockItemId: string;
  quantityChanged: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  userId: string;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateProductParams {
  name: string;
  sku: string;
  description?: string;
  unitOfMeasure?: string;
}

export interface CreateStockItemParams {
  productId: string;
  quantityOnHand: number;
  reorderPoint: number;
  safetyStock: number;
}

export interface AdjustStockParams {
  quantityChanged: number;
  reason: string;
}

// ---------------------------------------------------------------------------
// Inventory API
// ---------------------------------------------------------------------------

export async function listStockItems(
  params?: PaginationParams,
): Promise<PagedResponse<StockItemResponse>> {
  const { data } = await api.get<ApiResponse<PagedResponse<StockItemResponse>>>(
    '/inventory/stock-items',
    { params },
  );
  return data.data;
}

export async function listProducts(
  params?: PaginationParams,
): Promise<PagedResponse<ProductResponse>> {
  const { data } = await api.get<ApiResponse<PagedResponse<ProductResponse>>>(
    '/inventory/products',
    { params },
  );
  return data.data;
}

export async function getStockItem(id: string): Promise<StockItemResponse> {
  const { data } = await api.get<ApiResponse<StockItemResponse>>(`/inventory/stock-items/${id}`);
  return data.data;
}

export async function getStockMovements(stockItemId: string): Promise<StockMovementResponse[]> {
  const { data } = await api.get<ApiResponse<StockMovementResponse[]>>(
    `/inventory/stock-items/${stockItemId}/movements`,
  );
  return data.data;
}

export async function createProduct(payload: CreateProductParams): Promise<ProductResponse> {
  const { data } = await api.post<ApiResponse<ProductResponse>>('/inventory/products', payload);
  return data.data;
}

export async function createStockItem(payload: CreateStockItemParams): Promise<StockItemResponse> {
  const { data } = await api.post<ApiResponse<StockItemResponse>>('/inventory/stock-items', payload);
  return data.data;
}

export async function adjustStock(id: string, payload: AdjustStockParams): Promise<StockMovementResponse> {
  const { data } = await api.post<ApiResponse<StockMovementResponse>>(`/inventory/stock-items/${id}/adjust`, payload);
  return data.data;
}
