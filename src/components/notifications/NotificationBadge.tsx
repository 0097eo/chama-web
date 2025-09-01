"use client";

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotificationStats } from '@/hooks/useNotifications';
import { useChamaContext } from '@/context/ChamaContext';
import Link from 'next/link';

export const GlobalNotificationBadge = () => {
    const { activeChama } = useChamaContext();
    const { unreadCount, hasUnread } = useNotificationStats(activeChama?.id);
    const [showPulse, setShowPulse] = useState(false);

    // Show pulse animation when new notifications arrive
    useEffect(() => {
        if (hasUnread) {
            setShowPulse(true);
            const timer = setTimeout(() => setShowPulse(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [unreadCount, hasUnread]);

    return (
        <Link href="/dashboard/notifications">
            <Button 
                variant="ghost" 
                size="sm" 
                className={`relative ${hasUnread ? 'text-blue-600' : ''}`}
            >
                <Bell className={`h-5 w-5 ${showPulse ? 'animate-pulse' : ''}`} />
                {hasUnread && (
                    <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-xs"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Button>
        </Link>
    );
};

export const CompactNotificationBadge = () => {
    const { activeChama } = useChamaContext();
    const { unreadCount, hasUnread } = useNotificationStats(activeChama?.id);

    return (
        <Link href="/dashboard/notifications" className="relative">
            <div className={`p-2 rounded-full transition-colors ${
                hasUnread 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
                <Bell size={18} />
                {hasUnread && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>
        </Link>
    );
};