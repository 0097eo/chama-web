"use client";

import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

// === API Function ===
interface ReminderPayload {
    chamaId: string;
    userId: string;
    memberName: string;
    phoneNumber: string;
}

const sendContributionReminderSms = async (data: ReminderPayload) => {
    const response = await api.post('/notifications/reminders/contribution', data);
    return response.data;
};


// === React Query Hook ===
export const useSendContributionReminder = () => {
    return useMutation({
        mutationFn: sendContributionReminderSms,
        onSuccess: (data) => {
            toast.success(data.message || "Reminder sent successfully!");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Failed to send reminder.");
        }
    });
};