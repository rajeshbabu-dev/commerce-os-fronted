/* =============================================================================
   CommerceOS — Analytics API
   ============================================================================= */

import api from './axios';
import type { ApiResponse } from './auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KpiValue {
  key: string;
  label: string;
  value: number;
  unit: string;
  description: string;
}

export interface Funnel {
  lowStockAlerts: number;
  recommendations: number;
  poCreated: number;
  approvals: number;
}

export interface TrendPoint {
  date: string;
  lowStockAlerts: number;
  recommendations: number;
  poCreated: number;
  approvals: number;
}

export interface DashboardResponse {
  inventoryHealth: KpiValue;
  supplierScore: KpiValue;
  procurementCost: KpiValue;
  inventoryTurnover: KpiValue;
  stockoutRisk: KpiValue;
  deadStock: KpiValue;
  funnel: Funnel;
  activeUsers: number;
  trends: TrendPoint[];
  computedAt: string;
}

export interface EventLogEntry {
  id: string;
  eventType: string;
  sourceExchange: string | null;
  correlationId: string | null;
  productId: string | null;
  entityId: string | null;
  actorId: string | null;
  amount: number | null;
  confidenceScore: number | null;
  decision: string | null;
  payload: string;
  occurredAt: string;
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

// ---------------------------------------------------------------------------
// Analytics API Functions
// ---------------------------------------------------------------------------

export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get<ApiResponse<DashboardResponse>>('/analytics/dashboard');
  return data.data;
}

export async function listDomainEvents(params: {
  eventType?: string;
  page?: number;
  size?: number;
}): Promise<PagedResponse<EventLogEntry>> {
  const { data } = await api.get<ApiResponse<PagedResponse<EventLogEntry>>>(
    '/analytics/events',
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
        eventType: params.eventType || undefined,
      },
    },
  );
  return data.data;
}

export async function exportDomainEvents(eventType?: string): Promise<Blob> {
  const { data } = await api.get('/analytics/events/export', {
    params: { eventType: eventType || undefined },
    responseType: 'blob',
  });
  return data as Blob;
}
