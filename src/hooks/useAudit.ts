"use client";
import api from "@/lib/axios";
import { AuditLog } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

// === API Function ===
export const getRecentActivity = async (chamaId: string, limit: number = 5): Promise<AuditLog[]> => {
  const response = await api.get(`/audit/chama/${chamaId}?limit=${limit}`);
  return response.data.data.logs as AuditLog[];
};

// === React Query Hook ===
export const useGetRecentActivity = (chamaId: string, limit: number = 5) => {
  return useQuery<AuditLog[], Error>({
    queryKey: ["recent-activity", chamaId, limit],
    queryFn: () => getRecentActivity(chamaId, limit),
    enabled: Boolean(chamaId),
  });
};