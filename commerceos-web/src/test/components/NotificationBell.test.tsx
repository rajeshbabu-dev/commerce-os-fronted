import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotificationBell from '../../components/NotificationBell';
import type { NotificationResponse } from '../../api/notification';

vi.mock('../../hooks/useNotificationQuery', () => ({
  useNotificationsQuery: vi.fn(),
  useUnreadCountQuery: vi.fn(),
  useMarkNotificationReadMutation: vi.fn(),
}));

import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkNotificationReadMutation,
} from '../../hooks/useNotificationQuery';

const mockUseNotificationsQuery = useNotificationsQuery as ReturnType<typeof vi.fn>;
const mockUseUnreadCountQuery = useUnreadCountQuery as ReturnType<typeof vi.fn>;
const mockUseMarkNotificationReadMutation =
  useMarkNotificationReadMutation as ReturnType<typeof vi.fn>;

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NotificationBell />
    </QueryClientProvider>,
  );
}

describe('NotificationBell', () => {
  const mockMutate = vi.fn();

  const sampleNotifications: NotificationResponse[] = [
    {
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
    },
    {
      id: 'notif-002',
      userId: 'user-01',
      title: 'PO approved',
      message: 'Purchase order po-001 has been approved.',
      type: 'APPROVAL_DECIDED',
      relatedEntityType: 'PURCHASE_ORDER',
      relatedEntityId: 'po-001',
      read: true,
      createdAt: '2026-08-01T09:00:00Z',
      readAt: '2026-08-01T09:30:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMarkNotificationReadMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('shows the unread count badge without opening the dropdown', () => {
    mockUseNotificationsQuery.mockReturnValue({
      data: { content: sampleNotifications },
    });
    mockUseUnreadCountQuery.mockReturnValue({ data: 1 });

    renderWithProviders();

    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    const badge = screen.getByTestId('unread-count');
    expect(badge.textContent).toBe('1');
    expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
  });

  it('hides the badge when there are no unread notifications', () => {
    mockUseNotificationsQuery.mockReturnValue({
      data: { content: sampleNotifications },
    });
    mockUseUnreadCountQuery.mockReturnValue({ data: 0 });

    renderWithProviders();

    expect(screen.queryByTestId('unread-count')).not.toBeInTheDocument();
  });

  it('opens the dropdown on click and lists notifications', () => {
    mockUseNotificationsQuery.mockReturnValue({
      data: { content: sampleNotifications },
    });
    mockUseUnreadCountQuery.mockReturnValue({ data: 1 });

    renderWithProviders();
    fireEvent.click(screen.getByTestId('notification-bell'));

    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
    expect(screen.getAllByTestId('notification-item')).toHaveLength(2);
    expect(screen.getByText('Low stock alert')).toBeInTheDocument();
    expect(screen.getByText('PO approved')).toBeInTheDocument();
  });

  it('shows an empty state when there are no notifications', () => {
    mockUseNotificationsQuery.mockReturnValue({
      data: { content: [] },
    });
    mockUseUnreadCountQuery.mockReturnValue({ data: 0 });

    renderWithProviders();
    fireEvent.click(screen.getByTestId('notification-bell'));

    expect(screen.getByText('No notifications yet.')).toBeInTheDocument();
  });

  it('marks an unread notification as read via mutation', () => {
    mockUseNotificationsQuery.mockReturnValue({
      data: { content: sampleNotifications },
    });
    mockUseUnreadCountQuery.mockReturnValue({ data: 1 });

    renderWithProviders();
    fireEvent.click(screen.getByTestId('notification-bell'));
    fireEvent.click(screen.getByTestId('mark-read-notif-001'));

    expect(mockMutate).toHaveBeenCalledWith('notif-001');
  });
});
