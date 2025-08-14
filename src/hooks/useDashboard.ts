"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ChamaDashboardStats } from '@/types/api';

// === API Function ===
const getDashboardStats = async (chamaId: string): Promise<ChamaDashboardStats> => {
  const response = await api.get(`/chamas/${chamaId}/dashboard`);
  return response.data.data;
};

// === React Query Hook ===
export const useGetDashboardStats = (chamaId: string) => {
  return useQuery<ChamaDashboardStats, Error>({
    queryKey: ['dashboardStats', chamaId],
    queryFn: () => getDashboardStats(chamaId),
    enabled: !!chamaId, // Only run the query if chamaId is available
  });
};