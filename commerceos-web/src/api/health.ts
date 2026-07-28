/* =============================================================================
   CommerceOS — Health Check API
   ============================================================================= */

import api from './axios';

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
  const { data } = await api.get<HealthResponse>('/health');
  return data;
}
