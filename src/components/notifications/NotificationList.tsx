"use client";

import { useState } from 'react';
import { 
    useGetNotifications, 
    useMarkAsRead, 
    useDeleteNotification,
    useWebSocketNotifications 
} from '@/hooks/useNotifications';
import { Bell, BellOff, Check, Trash2, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';


interface NotificationListProps {
    chamaId: string;
}

export const NotificationList = ({ chamaId }: NotificationListProps) => {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    
    const { data: notifications = [], isLoading, error, refetch, isRefetching } = useGetNotifications(chamaId);
    const { isConnected } = useWebSocketNotifications(chamaId);
    const markAsReadMutation = useMarkAsRead();
    const deleteNotificationMutation = useDeleteNotification();

    const filteredNotifications = filter === 'unread' 
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = (notificationId: string) => {
        markAsReadMutation.mutate({ notificationId, chamaId });
    };

    const handleMarkAllAsRead = () => {
        const unreadNotifications = notifications.filter(n => !n.read);
        unreadNotifications.forEach(notification => {
            markAsReadMutation.mutate({ notificationId: notification.id, chamaId });
        });
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
                return '💰';
            case 'LOAN':
                return '🏦';
            case 'MEETING':
                return '📅';
            case 'GENERAL':
                return '📢';
            case 'REMINDER':
                return '⏰';
            default:
                return '🔔';
        }
    };

    const getNotificationTypeColor = (type: string) => {
        switch (type) {
            case 'CONTRIBUTION':
                return 'bg-green-100 text-green-800';
            case 'LOAN':
                return 'bg-orange-100 text-orange-800';
            case 'MEETING':
                return 'bg-blue-100 text-blue-800';
            case 'GENERAL':
                return 'bg-purple-100 text-purple-800';
            case 'REMINDER':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-3 w-1/4" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <Alert variant="destructive">
                        <AlertDescription>
                            Failed to load notifications. Please try again.
                        </AlertDescription>
                    </Alert>
                    <Button 
                        onClick={() => refetch()} 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        disabled={isRefetching}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                            {unreadCount > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {unreadCount} unread
                                </Badge>
                            )}
                        </CardTitle>
                        
                        {/* WebSocket Status */}
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            isConnected 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                        }`}>
                            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                            {isConnected ? 'Live' : 'Offline'}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Filter Buttons */}
                        <div className="flex bg-muted rounded-lg p-1">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                    filter === 'all' 
                                        ? 'bg-background shadow-sm' 
                                        : 'hover:bg-background/50'
                                }`}
                            >
                                All ({notifications.length})
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                    filter === 'unread' 
                                        ? 'bg-background shadow-sm' 
                                        : 'hover:bg-background/50'
                                }`}
                            >
                                Unread ({unreadCount})
                            </button>
                        </div>

                        {/* Mark All as Read Button */}
                        {unreadCount > 0 && (
                            <Button
                                onClick={handleMarkAllAsRead}
                                variant="outline"
                                size="sm"
                                disabled={markAsReadMutation.isPending}
                            >
                                <Check className="h-4 w-4 mr-1" />
                                Mark all read
                            </Button>
                        )}

                        {/* Refresh Button */}
                        <Button
                            onClick={() => refetch()}
                            variant="ghost"
                            size="sm"
                            disabled={isRefetching}
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                        <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {filter === 'unread' 
                                ? 'All caught up! Check back later for new updates.'
                                : 'You\'ll see notifications here when there are updates for this chama.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`flex items-start gap-4 p-4 border rounded-lg transition-all hover:shadow-sm ${
                                    !notification.read 
                                        ? 'bg-blue-50/50 border-blue-200' 
                                        : 'bg-background hover:bg-muted/30'
                                }`}
                            >
                                {/* Icon */}
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium text-foreground">
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                                )}
                                                <Badge 
                                                    variant="secondary" 
                                                    className={`text-xs ${getNotificationTypeColor(notification.type)}`}
                                                >
                                                    {notification.type}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatRelativeTime(notification.createdAt)}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {!notification.read && (
                                                <Button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={markAsReadMutation.isPending}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => handleDelete(notification.id)}
                                                variant="ghost"
                                                size="sm"
                                                disabled={deleteNotificationMutation.isPending}
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};