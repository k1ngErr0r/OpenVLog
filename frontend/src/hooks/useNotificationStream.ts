import { useEffect, useRef, useState } from 'react';

export interface NotificationItem {
  id: number;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

interface SnapshotEvent {
  notifications: NotificationItem[];
  unreadCount: number;
}

export function useNotificationStream(enabled: boolean) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (esRef.current) return; // already connected
    try {
      const es = new EventSource('/api/notifications/stream', { withCredentials: true } as any);
      esRef.current = es;
      es.addEventListener('snapshot', (e: MessageEvent) => {
        try {
          const data: SnapshotEvent = JSON.parse(e.data);
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (_) { /* ignore */ }
      });
      es.addEventListener('notification', (e: MessageEvent) => {
        try {
          const n: NotificationItem = JSON.parse(e.data);
          setNotifications(prev => [n, ...prev].slice(0, 50));
          if (!n.is_read) setUnreadCount(c => c + 1);
        } catch (_) { /* ignore */ }
      });
      es.onerror = () => {
        setError('stream_error');
        es.close();
        esRef.current = null;
      };
    } catch (e:any) {
      setError(e.message || 'connection_failed');
    }
    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [enabled]);

  return { notifications, unreadCount, error };
}