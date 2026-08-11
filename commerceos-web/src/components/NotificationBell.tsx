/* =============================================================================
   CommerceOS — Notification Bell
   =============================================================================
   Shared bell + dropdown (TICKET-31). Polls via TanStack Query; unread count
   badge is visible without opening the dropdown; marking read persists to the
   backend.
   ============================================================================= */

import { useEffect, useRef, useState } from 'react';
import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  useUnreadCountQuery,
} from '../hooks/useNotificationQuery';
import type { NotificationResponse } from '../api/notification';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: NotificationResponse;
  onMarkRead: (id: string) => void;
}) {
  return (
    <div
      className={`px-4 py-3 border-b border-slate-100 ${
        notification.read ? 'opacity-60' : 'bg-white'
      }`}
      data-testid="notification-item"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">{notification.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {formatTime(notification.createdAt)}
          </p>
        </div>
        {!notification.read && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="btn-ghost text-xs text-primary-600 hover:text-primary-700 shrink-0"
            data-testid={`mark-read-${notification.id}`}
          >
            Mark read
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notification Bell
// ---------------------------------------------------------------------------

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: notifications } = useNotificationsQuery();
  const { data: unreadCount = 0 } = useUnreadCountQuery();
  const markReadMutation = useMarkNotificationReadMutation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="btn-ghost relative p-2"
        title="Notifications"
        data-testid="notification-bell"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold flex items-center justify-center"
            data-testid="unread-count"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50"
          data-testid="notification-dropdown"
        >
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            <button
              onClick={() => setOpen(false)}
              className="btn-ghost text-xs text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications?.content.length ? (
              notifications.content.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={(id) => markReadMutation.mutate(id)}
                />
              ))
            ) : (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No notifications yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
