import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listMyNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  type NotificationResponse,
} from '../../api/notification';
import api from '../../api/axios';

vi.mock('../../api/axios', async () => {
  const actual = await vi.importActual('../../api/axios');
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return { ...actual, default: mockApi };
});

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

describe('Notification API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockNotification: NotificationResponse = {
    id: 'notif-001',
    userId: 'user-01',
    title: 'Low stock alert',
    message: 'Widget is below its reorder point.',
    type: 'LOW_STOCK',
    relatedEntityType: 'PRODUCT',
    relatedEntityId: 'prod-001',
    read: false,
    createdAt: '2026-08-01T10:00:00Z',
    readAt: null,
  };

  describe('listMyNotifications', () => {
    it('calls GET /notifications and returns paged data', async () => {
      const pagedData = {
        content: [mockNotification],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
      };
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: pagedData },
      });

      const result = await listMyNotifications();

      expect(mockApi.get).toHaveBeenCalledWith('/notifications', {
        params: { size: 20 },
      });
      expect(result).toEqual(pagedData);
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('calls GET /notifications/unread-count and returns the count', async () => {
      mockApi.get.mockResolvedValue({
        data: { success: true, message: 'OK', data: 3 },
      });

      const result = await getUnreadNotificationCount();

      expect(mockApi.get).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result).toBe(3);
    });
  });

  describe('markNotificationRead', () => {
    it('calls PATCH /notifications/{id}/read and returns the notification', async () => {
      const readNotification = { ...mockNotification, read: true, readAt: '2026-08-01T11:00:00Z' };
      mockApi.patch.mockResolvedValue({
        data: { success: true, message: 'OK', data: readNotification },
      });

      const result = await markNotificationRead('notif-001');

      expect(mockApi.patch).toHaveBeenCalledWith('/notifications/notif-001/read');
      expect(result.read).toBe(true);
    });
  });
});
