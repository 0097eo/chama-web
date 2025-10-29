"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import type { Notification } from '@/types/api';
import { io, Socket } from 'socket.io-client';

interface ContributionReminderPayload {
    chamaId: string;
    userId: string;
    memberName: string;
    phoneNumber: string;
}

interface LoanReminderPayload {
    chamaId: string;
    loanId: string;
    memberName: string;
    phoneNumber: string;
}

interface BroadcastPayload {
    chamaId: string;
    title: string;
    message: string;
}

// === API Functions ===
const sendContributionReminderSms = async (data: ContributionReminderPayload) => {
    const response = await api.post('/notifications/reminders/contribution', data);
    return response.data;
};

const sendLoanReminderSms = async (data: LoanReminderPayload) => {
    const response = await api.post('/notifications/reminders/loan', data);
    return response.data;
};

const getNotifications = async (chamaId: string): Promise<Notification[]> => {
    const response = await api.get(`/notifications/chama/${chamaId}`);
    return response.data.data;
};

const markAsRead = async (notificationId: string): Promise<Notification> => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data.data;
};

const deleteNotification = async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
};

const broadcastMessage = async (data: BroadcastPayload): Promise<void> => {
    await api.post(`/notifications/broadcast/${data.chamaId}`, {
        title: data.title,
        message: data.message,
    });
};

const resolveWebSocketUrl = () => {
    if (process.env.NEXT_PUBLIC_WS_URL) {
        return process.env.NEXT_PUBLIC_WS_URL;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
        try {
            const parsed = new URL(apiUrl);
            const protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
            return `${protocol}//${parsed.host}`;
        } catch (error) {
            console.warn('Failed to derive WebSocket URL from NEXT_PUBLIC_API_URL:', error);
        }
    }

    if (typeof window !== 'undefined') {
        const { protocol, host } = window.location;
        const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
        return `${wsProtocol}//${host}`;
    }

    return null;
};

// === WebSocket Hook with NextAuth ===
export const useWebSocketNotifications = (chamaId: string | null | undefined) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { data: session, status } = useSession();
    const queryClient = useQueryClient();

    const showBrowserNotification = useCallback((notification: Notification) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: notification.id, // Prevents duplicate notifications
                badge: '/favicon.ico',
                data: {
                    url: '/dashboard/notifications'
                }
            });

            // Handle notification click
            browserNotification.onclick = () => {
                window.focus();
                window.location.href = '/dashboard/notifications';
                browserNotification.close();
            };

            // Auto close after 5 seconds
            setTimeout(() => {
                browserNotification.close();
            }, 5000);
        }
    }, []);

    useEffect(() => {
        // Don't connect if no chamaId, session not loaded, or no session
        if (!chamaId || status === 'loading' || !session?.accessToken) {
            return;
        }

        const wsUrl = resolveWebSocketUrl();
        if (!wsUrl) {
            console.warn('WebSocket URL could not be determined. Skipping connection attempt.');
            return;
        }

        const newSocket = io(wsUrl, {
            auth: {
                token: session.accessToken
            },
            transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
            path: '/socket.io',
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket server');
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason: Socket.DisconnectReason) => {
            console.log('Disconnected from WebSocket server:', reason);
            setIsConnected(false);
        });

        newSocket.on('new_notification', (notification: Notification) => {
            console.log('New notification received:', notification);

            // Update the query cache with the new notification
            queryClient.setQueryData(['notifications', chamaId], (oldData: Notification[] | undefined) => {
                if (!oldData) return [notification];
                return [notification, ...oldData];
            });

            // Show toast notification
            toast.success(`${notification.title}: ${notification.message}`, {
                duration: 4000,
                position: 'top-right',
            });

            // Show browser notification if permitted
            showBrowserNotification(notification);
        });

        newSocket.on('new_broadcast_notification', (notification: Notification) => {
            console.log('New broadcast notification:', notification);

            // Show toast for broadcast
            toast(`📢 ${notification.title}: ${notification.message}`, {
                duration: 5000,
                style: {
                    background: '#3b82f6',
                    color: 'white',
                },
            });

            showBrowserNotification(notification);
        });

        newSocket.on('notification_marked_read', ({ notificationId }: { notificationId: string }) => {
            // Update the specific notification in cache
            queryClient.setQueryData(['notifications', chamaId], (oldData: Notification[] | undefined) => {
                if (!oldData) return oldData;
                return oldData.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                );
            });
        });

        newSocket.on('notification_deleted', ({ notificationId }: { notificationId: string }) => {
            // Remove notification from cache
            queryClient.setQueryData(['notifications', chamaId], (oldData: Notification[] | undefined) => {
                if (!oldData) return oldData;
                return oldData.filter(notification => notification.id !== notificationId);
            });
        });

        newSocket.on('connect_error', (error: Error) => {
            console.error('WebSocket connection error:', error.message);
            setIsConnected(false);

            // Show error toast only if it's an auth error
            if (error.message.includes('Authentication')) {
                toast.error('WebSocket authentication failed. Please refresh the page.');
            }
        });

        // Handle reconnection
        newSocket.on('reconnect', (attemptNumber: number) => {
            console.log('Reconnected to WebSocket server after', attemptNumber, 'attempts');
            toast.success('Connection restored');
        });

        newSocket.on('reconnect_error', (error: Error) => {
            console.error('WebSocket reconnection failed:', error);
        });

        return () => {
            console.log('Cleaning up WebSocket connection');
            newSocket.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, [chamaId, queryClient, session?.accessToken, showBrowserNotification, status]);

    const requestNotificationPermission = useCallback(async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                toast.success('Browser notifications enabled!');
            } else if (permission === 'denied') {
                toast.error('Browser notifications blocked. Enable them in your browser settings.');
            }
            return permission === 'granted';
        }
        return false;
    }, []);

    return {
        socket,
        isConnected,
        requestNotificationPermission,
        isAuthenticated: status === 'authenticated',
    };
};

// === Enhanced React Query Hooks ===
export const useSendContributionReminder = () => {
    return useMutation({
        mutationFn: sendContributionReminderSms,
        onSuccess: (data) => {
            toast.success(data.message || "Contribution reminder sent successfully!");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Failed to send reminder.");
        }
    });
};

export const useSendLoanReminder = () => {
    return useMutation({
        mutationFn: sendLoanReminderSms,
        onSuccess: (data) => {
            toast.success(data.message || "Loan payment reminder sent successfully!");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Failed to send loan reminder.");
        }
    });
};

export const useGetNotifications = (chamaId: string | null | undefined) => {
    const { status } = useSession();
    
    // Initialize WebSocket connection
    const { isConnected, isAuthenticated } = useWebSocketNotifications(chamaId);

    return useQuery<Notification[], Error>({
        queryKey: ['notifications', chamaId],
        queryFn: () => getNotifications(chamaId!),
        enabled: !!chamaId && status === 'authenticated',
        staleTime: 1000 * 60, // 1 minute
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        // Add connection status to query meta for debugging
        meta: {
            wsConnected: isConnected,
            authenticated: isAuthenticated,
        }
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    
    return useMutation<Notification, Error, { notificationId: string, chamaId: string }>({
        mutationFn: ({ notificationId }) => markAsRead(notificationId),
        
        // Optimistically update the UI before the API call
        onMutate: async ({ notificationId, chamaId }) => {
            await queryClient.cancelQueries({ queryKey: ['notifications', chamaId] });
            
            const previousNotifications = queryClient.getQueryData(['notifications', chamaId]);
            
            queryClient.setQueryData(['notifications', chamaId], (old: Notification[] | undefined) => {
                if (!old) return old;
                return old.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                );
            });

            return { previousNotifications };
        },
        
        onError: (
            error: AxiosError<{ message: string }>,
            variables,
            context: { previousNotifications?: unknown }
        ) => {
            // Revert optimistic update on error
            if (context?.previousNotifications) {
                queryClient.setQueryData(['notifications', variables.chamaId], context.previousNotifications);
            }
            toast.error(error.response?.data?.message || 'Failed to mark as read.');
        },
        
        onSettled: (_, __, variables) => {
            // Invalidate to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['notifications', variables.chamaId] });
        }
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    
    return useMutation<void, Error, { notificationId: string, chamaId: string }>({
        mutationFn: ({ notificationId }) => deleteNotification(notificationId),
        
        // Optimistically remove from UI
        onMutate: async ({ notificationId, chamaId }) => {
            await queryClient.cancelQueries({ queryKey: ['notifications', chamaId] });
            
            const previousNotifications = queryClient.getQueryData(['notifications', chamaId]);
            
            queryClient.setQueryData(['notifications', chamaId], (old: Notification[] | undefined) => {
                if (!old) return old;
                return old.filter(notification => notification.id !== notificationId);
            });

            return { previousNotifications };
        },
        
        onSuccess: () => {
            toast.success("Notification deleted.");
        },
        
        onError: (
            error: AxiosError<{ message: string }>,
            variables,
            context: { previousNotifications?: unknown }
        ) => {
            // Revert optimistic update on error
            if (context?.previousNotifications) {
                queryClient.setQueryData(['notifications', variables.chamaId], context.previousNotifications);
            }
            toast.error(error.response?.data?.message || 'Failed to delete notification.');
        }
    });
};

export const useBroadcastMessage = () => {
    const queryClient = useQueryClient();
    
    return useMutation<void, Error, BroadcastPayload>({
        mutationFn: broadcastMessage,
        onSuccess: (_, variables) => {
            toast.success("Broadcast message sent successfully!");
            // WebSocket will handle real-time updates, but invalidate as backup
            queryClient.invalidateQueries({ queryKey: ['notifications', variables.chamaId] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || 'Failed to send broadcast.');
        }
    });
};

// === Utility Hook for Notification Stats ===
export const useNotificationStats = (chamaId: string | null | undefined) => {
    const { data: notifications = [] } = useGetNotifications(chamaId);
    
    const unreadCount = notifications.filter(n => !n.read).length;
    const totalCount = notifications.length;
    
    return {
        unreadCount,
        totalCount,
        hasUnread: unreadCount > 0,
    };
};
