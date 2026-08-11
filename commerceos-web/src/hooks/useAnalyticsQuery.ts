/* =============================================================================
   CommerceOS — Analytics Query Hooks
   ============================================================================= */

import { useQuery } from '@tanstack/react-query';
import {
  getDashboard,
  listDomainEvents,
  type DashboardResponse,
  type EventLogEntry,
  type PagedResponse,
} from '../api/analytics';

export function useDashboardQuery() {
  return useQuery<DashboardResponse, Error>({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => getDashboard(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useDomainEventsQuery(params: { eventType?: string; page?: number }) {
  return useQuery<PagedResponse<EventLogEntry>, Error>({
    queryKey: ['analytics', 'events', params.eventType ?? 'ALL', params.page ?? 0],
    queryFn: () => listDomainEvents({ eventType: params.eventType, page: params.page }),
    staleTime: 15_000,
  });
}
