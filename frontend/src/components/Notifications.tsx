import { useEffect, useState } from 'react';
import { useApiWithToasts } from '@/lib/http';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, CheckCheck } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Notification {
    id: number;
    message: string;
    link: string;
    is_read: boolean;
    created_at: string;
}

export function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const api = useApiWithToasts();

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/notifications');
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every 60 seconds
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await api.post(`/api/notifications/${notificationId}/read`);
            fetchNotifications();
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };
    
    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/api/notifications/read-all');
            fetchNotifications();
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 md:w-96" align="end">
                <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium leading-none">Notifications</h4>
                        {unreadCount > 0 && (
                            <Button variant="link" size="sm" onClick={handleMarkAllAsRead} className="-mr-2">
                                <CheckCheck className="mr-1 h-4 w-4" />
                                Mark all as read
                            </Button>
                        )}
                    </div>
                    <div className="grid gap-2 max-h-96 overflow-y-auto">
                        {loading ? (
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
