/* =============================================================================
   CommerceOS — Supplier API
   ============================================================================= */

import api from './axios';
import type { ApiResponse } from './auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SupplierPerformanceResponse {
  id: string;
  supplierId: string;
  totalOrdersFulfilled: number;
  onTimeDeliveries: number;
  fulfillmentRate: number;
  avgLeadTimeDays: number;
}

export interface SupplierResponse {
  id: string;
  name: string;
  contactEmail: string;
  phone: string | null;
  address: string | null;
  paymentTerms: string;
  active: boolean;
  performance: SupplierPerformanceResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProductResponse {
  id: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  unitCost: number;
  leadTimeDays: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  paymentTerms?: string;
}

export interface MapSupplierProductRequest {
  productId: string;
  unitCost: number;
  leadTimeDays: number;
  isPrimary: boolean;
}

export interface ProductOption {
  id: string;
  name: string;
  sku: string;
}

// ---------------------------------------------------------------------------
// Supplier API
// ---------------------------------------------------------------------------

export async function listSuppliers(): Promise<SupplierResponse[]> {
  const { data } = await api.get<ApiResponse<SupplierResponse[]>>('/suppliers');
  return data.data;
}

export async function getSupplier(id: string): Promise<SupplierResponse> {
  const { data } = await api.get<ApiResponse<SupplierResponse>>(`/suppliers/${id}`);
  return data.data;
}

export async function createSupplier(
  request: CreateSupplierRequest,
): Promise<SupplierResponse> {
  const { data } = await api.post<ApiResponse<SupplierResponse>>('/suppliers', request);
  return data.data;
}

export async function deactivateSupplier(id: string): Promise<void> {
  await api.delete(`/suppliers/${id}`);
}

export async function listSupplierProducts(
  supplierId: string,
): Promise<SupplierProductResponse[]> {
  const { data } = await api.get<ApiResponse<SupplierProductResponse[]>>(
    `/suppliers/${supplierId}/products`,
  );
  return data.data;
}

export async function mapSupplierProduct(
  supplierId: string,
  request: MapSupplierProductRequest,
): Promise<SupplierProductResponse> {
  const { data } = await api.post<ApiResponse<SupplierProductResponse>>(
    `/suppliers/${supplierId}/products`,
    request,
  );
  return data.data;
}

export async function listProductsForMapping(): Promise<ProductOption[]> {
  const { data } = await api.get<ApiResponse<ProductOption[]>>('/inventory/products');
  return data.data;
}
