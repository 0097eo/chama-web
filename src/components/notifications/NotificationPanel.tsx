"use client";

import { useEffect, useState } from 'react';
import { 
    Bell, BellOff, Trash2, Check, Wifi, WifiOff,
    Coins, Banknote, CalendarDays, Megaphone, BellRing,
} from 'lucide-react';
import { 
    useGetNotifications, 
    useMarkAsRead, 
    useDeleteNotification,
    useNotificationStats,
    useWebSocketNotifications 
} from '@/hooks/useNotifications';

interface NotificationPanelProps {
    chamaId: string;
}

export const NotificationPanel = ({ chamaId }: NotificationPanelProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

    const { data: notifications = [], isLoading, error } = useGetNotifications(chamaId);
    const { unreadCount, hasUnread } = useNotificationStats(chamaId);
    const { isConnected, requestNotificationPermission } = useWebSocketNotifications(chamaId);
    const markAsReadMutation = useMarkAsRead();
    const deleteNotificationMutation = useDeleteNotification();

    // Request browser notification permission on first load
    useEffect(() => {
        if (!hasRequestedPermission && 'Notification' in window) {
            requestNotificationPermission().then(() => {
                setHasRequestedPermission(true);
            });
        }
    }, [hasRequestedPermission, requestNotificationPermission]);

    const handleMarkAsRead = (notificationId: string) => {
        markAsReadMutation.mutate({ notificationId, chamaId });
    };

    const handleDelete = (notificationId: string) => {
        if (confirm('Are you sure you want to delete this notification?')) {
            deleteNotificationMutation.mutate({ notificationId, chamaId });
        }
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'CONTRIBUTION':
                return <Coins size={18} className="text-yellow-500" />;
            case 'LOAN':
                return <Banknote size={18} className="text-green-500" />;
            case 'MEETING':
                return <CalendarDays size={18} className="text-blue-500" />;
            case 'GENERAL':
                return <Megaphone size={18} className="text-purple-500" />;
            default:
                return <BellRing size={18} className="text-gray-500" />;
        }
    };

    return (
        <div className="relative">
            {/* Notification Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-full transition-colors ${
                    hasUnread 
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">
                            Notifications {unreadCount > 0 && `(${unreadCount})`}
                        </h3>
                        <div className="flex items-center gap-2">
                            {/* WebSocket Status */}
                            <div className={`flex items-center gap-1 text-xs ${
                                isConnected ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                                {isConnected ? 'Live' : 'Offline'}
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-500">
                                Loading notifications...
                            </div>
                        ) : error ? (
                            <div className="p-4 text-center text-red-500">
                                Failed to load notifications
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                <BellOff size={24} className="mx-auto mb-2 opacity-50" />
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 transition-colors ${
                                        !notification.read 
                                            ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">
                                                    {getNotificationIcon(notification.type)}
                                                </span>
                                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatRelativeTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    disabled={markAsReadMutation.isPending}
                                                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notification.id)}
                                                disabled={deleteNotificationMutation.isPending}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete notification"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 bg-gray-50 text-center">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};