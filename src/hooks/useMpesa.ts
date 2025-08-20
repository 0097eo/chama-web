"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { MpesaTransaction } from '@/types/api';

// === API Functions ===

interface StkPushPayload {
    amount: number;
    phone: string;
    contributionId: string;
}

interface ApiContribution {
    id: string;
    amount: number;
    month: number;
    year: number;
    paymentMethod: string;
    mpesaCode: string;
    paidAt: string;
    status: string;
    membershipId: string;
    penaltyApplied: number;
    mpesaCheckoutId: string | null;
    membership: {
        user: {
            firstName: string;
            lastName: string;
        }
    }
}

interface ApiLoanDisbursement {
    id: string;
    amount: number;
    interestRate: number;
    duration: number;
    purpose: string;
    status: string;
    appliedAt: string;
    approvedAt: string | null;
    dueDate: string | null;
    membershipId: string;
    disbursedAt: string | null;
    isRestructured: boolean;
    monthlyInstallment: number;
    repaymentAmount: number;
    restructureNotes: string | null;
    mpesaB2CRequestId: string | null;
    membership: {
        user: {
            firstName: string;
            lastName: string;
        }
    }
}

const initiateStkPush = async (data: StkPushPayload) => {
    const response = await api.post('/payments/stk-push', data);
    return response.data;
};

const queryStkStatus = async (checkoutRequestId: string) => {
    const response = await api.get(`/payments/status/${checkoutRequestId}`);
    return response.data.data;
};

const getMpesaTransactions = async (chamaId: string): Promise<MpesaTransaction[]> => {
    const response = await api.get(`/payments/transactions/${chamaId}`);
    const { contributions = [], loanDisbursements = [] } = response.data.data;

    const contributionTxs: MpesaTransaction[] = contributions.map((c: ApiContribution) => ({
        id: c.id,
        type: 'Contribution' as const,
        amount: c.amount,
        status: c.status,
        mpesaCode: c.mpesaCode,
        date: c.paidAt,
        memberName: `${c.membership.user.firstName} ${c.membership.user.lastName}`,
        month: c.month,
        year: c.year,
        penaltyApplied: c.penaltyApplied
    }));

    const disbursementTxs: MpesaTransaction[] = loanDisbursements.map((d: ApiLoanDisbursement) => ({
        id: d.id,
        type: 'Disbursement' as const,
        amount: -d.amount, // Show as a negative value for disbursements
        status: d.status,
        mpesaCode: d.mpesaB2CRequestId,
        date: d.disbursedAt || d.approvedAt || d.appliedAt, // Use disbursedAt first, fallback to other dates
        memberName: `${d.membership.user.firstName} ${d.membership.user.lastName}`,
        purpose: d.purpose,
        interestRate: d.interestRate,
        duration: d.duration
    }));


    const allTransactions = [...contributionTxs, ...disbursementTxs];
    allTransactions.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Sort descending (newest first)
    });

    return allTransactions;
};

// === React Query Hooks ===

export const useInitiateStkPush = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: initiateStkPush,
        onSuccess: (data) => {
            toast.success(data.message || 'STK Push initiated. Please check your phone.');
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || 'Failed to initiate STK Push.');
        }
    });
};

export const useQueryStkStatus = (checkoutRequestId: string) => {
    return useQuery({
        queryKey: ['mpesa-status', checkoutRequestId],
        queryFn: () => queryStkStatus(checkoutRequestId),
        enabled: !!checkoutRequestId,
        refetchInterval: (query) => {
            const result = query.state.data;
            if (result && (result.ResultCode === 0 || result.ResultCode > 0)) {
                return false; // Stop polling
            }
            return 5000; // Poll every 5 seconds
        },
    });
};

export const useGetMpesaTransactions = (chamaId: string | null | undefined) => {
    return useQuery<MpesaTransaction[], Error>({
        queryKey: ['mpesa-transactions', chamaId],
        queryFn: () => getMpesaTransactions(chamaId!),
        enabled: !!chamaId,
        staleTime: 30000, // Consider data fresh for 30 seconds
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
    });
};