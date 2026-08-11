/* =============================================================================
   CommerceOS — Notification API
   ============================================================================= */

import api from './axios';
import type { ApiResponse } from './auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationType =
  | 'LOW_STOCK'
  | 'RECOMMENDATION'
  | 'PO_NEEDS_APPROVAL'
  | 'APPROVAL_DECIDED';

export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType | string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
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
// Notification API Functions
// ---------------------------------------------------------------------------

export async function listMyNotifications(): Promise<
  PagedResponse<NotificationResponse>
> {
  const { data } = await api.get<ApiResponse<PagedResponse<NotificationResponse>>>(
    '/notifications',
    { params: { size: 20 } },
  );
  return data.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { data } = await api.get<ApiResponse<number>>('/notifications/unread-count');
  return data.data;
}

export async function markNotificationRead(id: string): Promise<NotificationResponse> {
  const { data } = await api.patch<ApiResponse<NotificationResponse>>(
    `/notifications/${id}/read`,
  );
  return data.data;
}
