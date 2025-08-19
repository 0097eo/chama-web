"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Loan } from '@/types/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface RepaymentInstallment {
    installment: number;
    dueDate: string;
    payment: number;
    balance: number;
}

interface LoanApplicationPayload {
  membershipId: string;
  amount: number;
  purpose: string;
  duration: number;
}

interface LoanPaymentPayload {
  amount: number;
  paidAt: string;
}

// === API Functions ===

const getChamaLoans = async (chamaId: string): Promise<Loan[]> => {
    const response = await api.get(`/loans/chama/${chamaId}`);
    return response.data.data;
};

const getLoanById = async (loanId: string): Promise<Loan> => {
    const response = await api.get(`/loans/${loanId}`);
    return response.data.data;
};

const applyForLoan = async (data: LoanApplicationPayload): Promise<Loan> => {
    const response = await api.post('/loans', data);
    return response.data.data;
};

const approveOrRejectLoan = async ({ loanId, status }: { loanId: string, status: 'APPROVED' | 'REJECTED' }) => {
    return api.put(`/loans/${loanId}/approve`, { status });
};

const disburseLoan = async (loanId: string) => {
    return api.put(`/loans/${loanId}/disburse`);
};

const recordLoanPayment = async ({ loanId, data }: { loanId: string, data: LoanPaymentPayload }) => {
    return api.post(`/loans/${loanId}/payments`, data);
};

const getRepaymentSchedule = async (loanId: string): Promise<RepaymentInstallment[]> => {
    const response = await api.get(`/loans/${loanId}/schedule`);
    return response.data.data;
};

const checkEligibility = async ({ membershipId, amount }: { membershipId: string, amount: number }) => {
    const response = await api.get(`/loans/eligibility?membershipId=${membershipId}&amount=${amount}`);
    return response.data.data;
};

const getLoanDefaulters = async (chamaId: string): Promise<Loan[]> => {
    const response = await api.get(`/loans/defaulters/${chamaId}`);
    return response.data.data;
};

// === React Query Hooks ===

export const useGetChamaLoans = (chamaId: string) => {
    return useQuery<Loan[], Error>({
        queryKey: ['loans', chamaId],
        queryFn: () => getChamaLoans(chamaId),
        enabled: !!chamaId,
    });
};

export const useGetLoanById = (loanId: string) => {
    return useQuery<Loan, Error>({
        queryKey: ['loan', loanId],
        queryFn: () => getLoanById(loanId),
        enabled: !!loanId,
    });
};

export const useApplyForLoan = () => {
  const queryClient = useQueryClient();
  return useMutation<Loan, Error, LoanApplicationPayload>({
    mutationFn: applyForLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success("Loan application submitted successfully!");
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || 'Loan application failed.');
    },
  });
};

export const useApproveOrRejectLoan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: approveOrRejectLoan,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['loan', variables.loanId] });
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            toast.success(`Loan has been ${variables.status.toLowerCase()}.`);
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || 'Action failed.');
        }
    });
};

export const useDisburseLoan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: disburseLoan,
        onSuccess: (_, loanId) => {
            queryClient.invalidateQueries({ queryKey: ['loan', loanId] });
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            toast.success("Loan disbursed successfully!");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || 'Disbursement failed.');
        }
    });
};

export const useRecordLoanPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: recordLoanPayment,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['loan', variables.loanId] });
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            toast.success("Payment recorded successfully!");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || 'Failed to record payment.');
        }
    });
};

export const useGetRepaymentSchedule = (loanId: string) => {
    return useQuery<RepaymentInstallment[], Error>({
        queryKey: ['loan-schedule', loanId],
        queryFn: () => getRepaymentSchedule(loanId),
        enabled: !!loanId, // Only run if loanId is available
    });
};

export const useCheckEligibility = () => {
    return useMutation({
        mutationFn: checkEligibility,
    });
};

export const useGetLoanDefaulters = (chamaId: string) => {
    return useQuery<Loan[], Error>({
        queryKey: ['loan-defaulters', chamaId],
        queryFn: () => getLoanDefaulters(chamaId),
        enabled: !!chamaId,
    });
};