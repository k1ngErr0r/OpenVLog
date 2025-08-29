import { useEffect, useState } from 'react';
import { useApiWithToasts } from '@/lib/http';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, CheckCheck } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

import { useNotificationStream } from '@/hooks/useNotificationStream';
import type { NotificationItem as Notification } from '@/hooks/useNotificationStream';

export function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [authError, setAuthError] = useState(false);
    const stream = useNotificationStream(!authError);
    const api = useApiWithToasts();

    useEffect(() => {
        // When stream has data, sync local state
        if (stream.notifications.length) {
            setNotifications(stream.notifications);
            setUnreadCount(stream.unreadCount);
            setLoading(false);
        } else if (stream.error && !notifications.length) {
            // Fallback: single REST fetch (no interval) if stream fails
            (async () => {
                try {
                    const response = await api.get('/api/notifications');
                    setNotifications(response.data.notifications);
                    setUnreadCount(response.data.unreadCount);
                    setLoading(false);
                } catch (e:any) {
                    if (e?.response?.status === 401) setAuthError(true);
                    setLoading(false);
                }
            })();
        }
    }, [stream.notifications, stream.unreadCount, stream.error]);

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await api.post(`/api/notifications/${notificationId}/read`);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
            setUnreadCount(c => Math.max(0, c - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full" disabled={authError} aria-disabled={authError}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && !authError && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 md:w-96" align="end">
                <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium leading-none">Notifications</h4>
                        {!authError && unreadCount > 0 && (
                            <Button variant="link" size="sm" onClick={handleMarkAllAsRead} className="-mr-2">
                                <CheckCheck className="mr-1 h-4 w-4" />
                                Mark all as read
                            </Button>
                        )}
                    </div>
                    <div className="grid gap-2 max-h-96 overflow-y-auto">
                        {authError ? (
                            <p className="text-sm text-center text-muted-foreground py-4">Sign in to view notifications.</p>
                        ) : loading ? (
                            <div className="flex justify-center py-4"><Spinner /></div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        'mb-2 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0',
                                        !notification.is_read && 'font-semibold'
                                    )}
                                >
                                    <span className={cn(
                                        'flex h-2 w-2 translate-y-1 rounded-full',
                                        notification.is_read ? 'bg-gray-300' : 'bg-sky-500'
                                    )} />
                                    <div className="grid gap-1">
                                        <Link to={notification.link} className="hover:underline" onClick={() => { setIsOpen(false); if (!notification.is_read) handleMarkAsRead(notification.id); }}>
                                            <p className="text-sm">{notification.message}</p>
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-center text-muted-foreground py-4">No new notifications.</p>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
