"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { Notification } from '@/types/api';

// === API Function ===
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


// === React Query Hook ===
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
    //const queryClient = useQueryClient();
    return useQuery<Notification[], Error>({
        queryKey: ['notifications', chamaId],
        queryFn: () => getNotifications(chamaId!),
        enabled: !!chamaId,
        staleTime: 1000 * 60, // 1 minute
        refetchOnWindowFocus: true, // Refetch when user returns to the tab
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation<Notification, Error, { notificationId: string, chamaId: string }>({
        mutationFn: ({ notificationId }) => markAsRead(notificationId),
        onSuccess: (_, variables) => {
            // Invalidate the query for the specific chama
            queryClient.invalidateQueries({ queryKey: ['notifications', variables.chamaId] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || 'Failed to mark as read.');
        }
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { notificationId: string, chamaId: string }>({
        mutationFn: ({ notificationId }) => deleteNotification(notificationId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['notifications', variables.chamaId] });
            toast.success("Notification deleted.");
        },
        onError: (error: AxiosError<{ message: string }>) => {
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
            // After broadcasting, invalidate the notifications for that chama to show the new ones
            queryClient.invalidateQueries({ queryKey: ['notifications', variables.chamaId] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || 'Failed to send broadcast.');
        }
    });
};