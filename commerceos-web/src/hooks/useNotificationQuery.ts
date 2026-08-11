/* =============================================================================
   CommerceOS — Notification Query Hooks
   =============================================================================
   The notification bell polls on an interval via TanStack Query (TICKET-31).
   ============================================================================= */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUnreadNotificationCount,
  listMyNotifications,
  markNotificationRead,
  type NotificationResponse,
  type PagedResponse,
} from '../api/notification';

const POLL_INTERVAL = 30_000;

export function useNotificationsQuery() {
  return useQuery<PagedResponse<NotificationResponse>, Error>({
    queryKey: ['notifications'],
    queryFn: () => listMyNotifications(),
    staleTime: 15_000,
    refetchInterval: POLL_INTERVAL,
  });
}

export function useUnreadCountQuery() {
  return useQuery<number, Error>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => getUnreadNotificationCount(),
    staleTime: 15_000,
    refetchInterval: POLL_INTERVAL,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<NotificationResponse, Error, string>({
    mutationFn: (id) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
