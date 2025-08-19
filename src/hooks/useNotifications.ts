"use client";

import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

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

const sendContributionReminderSms = async (data: ContributionReminderPayload) => {
    const response = await api.post('/notifications/reminders/contribution', data);
    return response.data;
};

const sendLoanReminderSms = async (data: LoanReminderPayload) => {
    const response = await api.post('/notifications/reminders/loan', data);
    return response.data;
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