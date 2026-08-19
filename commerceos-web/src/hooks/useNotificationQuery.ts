/* =============================================================================
   CommerceOS — Notification Query Hooks
   =============================================================================
   The notification bell polls on an interval via TanStack Query (TICKET-31).
   ============================================================================= */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tokenStore } from '../api/axios';
import {
  getUnreadNotificationCount,
  listMyNotifications,
  markNotificationRead,
  type NotificationResponse,
  type PagedResponse,
} from '../api/notification';

const POLL_INTERVAL = 30_000;

export function useNotificationsQuery() {
  const hasToken = !!tokenStore.getAccessToken();
  return useQuery<PagedResponse<NotificationResponse>, Error>({
    queryKey: ['notifications'],
    queryFn: () => listMyNotifications(),
    enabled: hasToken,
    staleTime: 15_000,
    refetchInterval: hasToken ? POLL_INTERVAL : false,
  });
}

export function useUnreadCountQuery() {
  const hasToken = !!tokenStore.getAccessToken();
  return useQuery<number, Error>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => getUnreadNotificationCount(),
    enabled: hasToken,
    staleTime: 15_000,
    refetchInterval: hasToken ? POLL_INTERVAL : false,
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
