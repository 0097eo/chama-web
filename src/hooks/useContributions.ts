"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Contribution, Membership } from '@/types/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

// === API Functions ===

interface ContributionData {
  membershipId: string;
  amount: number;
  month: number;
  year: number;
  paymentMethod: string;
  mpesaCode?: string;
  paidAt: Date;
}

interface ContributionsApiResponse {
  data: {
    contributions: Contribution[];
    totalRecords: number;
    totalPages: number;
  };
}

// GET /api/contributions/chama/:chamaId
const getChamaContributions = async (chamaId: string): Promise<ContributionsApiResponse> => {
  const response = await api.get(`/contributions/chama/${chamaId}`);
  return response.data; // The entire response.data is the object
};

// POST /api/contributions
const recordContribution = async (data: ContributionData): Promise<Contribution> => {
    const response = await api.post('/contributions', data);
    return response.data.data;
};

// POST /api/payments/stk-push (M-Pesa)
const initiateStkPush = async ({ amount, phone, contributionId }: { amount: number, phone: string, contributionId: string }) => {
    const response = await api.post('/payments/stk-push', { amount, phone, contributionId });
    return response.data;
};

// GET /api/contributions/defaulters/:chamaId
const getDefaulters = async (chamaId: string): Promise<Membership[]> => {
    const response = await api.get(`/contributions/defaulters/${chamaId}`);
    return response.data.data;
};


// === React Query Hooks ===

export const useGetChamaContributions = (chamaId: string) => {
    return useQuery<ContributionsApiResponse, Error>({ // The hook returns the full response object
        queryKey: ['contributions', chamaId],
        queryFn: () => getChamaContributions(chamaId),
        enabled: !!chamaId,
    });
};

export const useRecordContribution = () => {
    const queryClient = useQueryClient();
    return useMutation<Contribution, Error, ContributionData>({
        mutationFn: recordContribution,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contributions', variables.membershipId] });
            toast.success("Contribution recorded successfully!");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || 'Failed to record contribution.');
        },
    });
};

export const useInitiateStkPush = () => {
    return useMutation({
        mutationFn: initiateStkPush,
        onSuccess: () => {
            toast.success('STK Push initiated. Please check your phone to complete the payment.');
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || 'Failed to initiate STK Push.');
        }
    });
};

export const useGetDefaulters = (chamaId: string) => {
    return useQuery<Membership[], Error>({
        queryKey: ['defaulters', chamaId],
        queryFn: () => getDefaulters(chamaId),
        enabled: !!chamaId,
    });
};
