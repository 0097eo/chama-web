"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { FinancialSummary, Contribution, LoanPortfolioReport, PaginatedResponse, MemberPerformanceData, AuditLog} from '@/types/api';
import { DateRange } from 'react-day-picker';

// === API Functions ===

const getFinancialSummary = async (chamaId: string): Promise<FinancialSummary> => {
    const response = await api.get(`/reports/financial-summary/${chamaId}`);
    return response.data.data;
};

const getContributionsReport = async (chamaId: string, dateRange?: DateRange): Promise<PaginatedResponse<Contribution>> => {
    const params = new URLSearchParams();
    if (dateRange?.from) params.append('startDate', dateRange.from.toISOString());
    if (dateRange?.to) params.append('endDate', dateRange.to.toISOString());
    
    const response = await api.get(`/reports/contributions/${chamaId}?${params.toString()}`);
    return response.data;
};

const getLoanPortfolioReport = async (chamaId: string): Promise<LoanPortfolioReport> => {
    const response = await api.get(`/reports/loans/${chamaId}`);
    return response.data.data;
};

const getCashflowReport = async (chamaId: string, dateRange?: DateRange) => {
    const params = new URLSearchParams();
    if (dateRange?.from) params.append('startDate', dateRange.from.toISOString());
    if (dateRange?.to) params.append('endDate', dateRange.to.toISOString());
    const response = await api.get(`/reports/cashflow/${chamaId}?${params.toString()}`);
    return response.data.data;
};

const getMemberPerformanceReport = async (chamaId: string): Promise<MemberPerformanceData[]> => {
    const response = await api.get(`/reports/member-performance/${chamaId}`);
    return response.data.data;
};

const getAuditTrailReport = async (chamaId: string, page: number, limit: number): Promise<PaginatedResponse<AuditLog>> => {
    const response = await api.get(`/reports/audit-trail/${chamaId}?page=${page}&limit=${limit}`);
    return response.data;
};

// === React Query Hooks ===

export const useGetFinancialSummary = (chamaId?: string | null) => {
    return useQuery<FinancialSummary, Error>({
        queryKey: ['reports', 'financial-summary', chamaId],
        queryFn: () => getFinancialSummary(chamaId!),
        enabled: !!chamaId,
    });
};

export const useGetContributionsReport = (chamaId?: string | null, dateRange?: DateRange) => {
    return useQuery<PaginatedResponse<Contribution>, Error>({
        queryKey: ['reports', 'contributions', chamaId, dateRange],
        queryFn: () => getContributionsReport(chamaId!, dateRange),
        enabled: !!chamaId,
    });
};

export const useGetLoanPortfolioReport = (chamaId?: string | null) => {
    return useQuery<LoanPortfolioReport, Error>({
        queryKey: ['reports', 'loans', chamaId],
        queryFn: () => getLoanPortfolioReport(chamaId!),
        enabled: !!chamaId,
    });
};

export const useGetCashflowReport = (chamaId: string, dateRange?: DateRange) => {
    return useQuery({
        queryKey: ['reports', 'cashflow', chamaId, dateRange],
        queryFn: () => getCashflowReport(chamaId, dateRange),
        enabled: !!chamaId
    });
};


export const useGetMemberPerformanceReport = (chamaId?: string | null) => {
    return useQuery<MemberPerformanceData[], Error>({
        queryKey: ['reports', 'member-performance', chamaId],
        queryFn: () => getMemberPerformanceReport(chamaId!),
        enabled: !!chamaId,
    });
};

export const useGetAuditTrailReport = (chamaId: string | null | undefined, page: number, limit: number) => {
    return useQuery<PaginatedResponse<AuditLog>, Error>({
        queryKey: ['reports', 'audit-trail', chamaId, page, limit],
        queryFn: () => getAuditTrailReport(chamaId!, page, limit),
        enabled: !!chamaId,
    });
};