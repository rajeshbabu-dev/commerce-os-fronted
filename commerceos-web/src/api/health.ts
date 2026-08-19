/* =============================================================================
   CommerceOS — Health Check API
   ============================================================================= */

import api from './axios';
import type { ApiResponse } from './auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await api.get<ApiResponse<HealthResponse>>('/health');
  return data.data;
}
