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

// ---------------------------------------------------------------------------
// Inventory API
// ---------------------------------------------------------------------------

export async function listStockItems(): Promise<StockItemResponse[]> {
  const { data } = await api.get<ApiResponse<StockItemResponse[]>>('/inventory/stock-items');
  return data.data;
}

export async function listProducts(): Promise<ProductResponse[]> {
  const { data } = await api.get<ApiResponse<ProductResponse[]>>('/inventory/products');
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
