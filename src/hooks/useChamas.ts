"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Chama, Membership, MembershipRole } from '@/types/api';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

// === API Functions ===

const getChamas = async (): Promise<Chama[]> => {
  const response = await api.get('/chamas');
  return response.data.data;
};

const getChamaById = async (chamaId: string): Promise<Chama> => {
  const response = await api.get(`/chamas/${chamaId}`);
  return response.data.data;
};

const createChama = async (chamaData: FormData): Promise<Chama> => {
    const response = await api.post('/chamas', chamaData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

const deleteChama = async (chamaId: string): Promise<void> => {
    await api.delete(`/chamas/${chamaId}`);
};

const updateMemberRole = async ({ chamaId, userId, role }: { chamaId: string; userId: string; role: MembershipRole }) => {
    const response = await api.put(`/chamas/${chamaId}/members/${userId}/role`, { role });
    return response.data.data;
};

const addMember = async ({ chamaId, email }: { chamaId: string; email: string }) => {
    const response = await api.post(`/chamas/${chamaId}/members`, { email });
    return response.data.data;
};

const removeMember = async ({ chamaId, userId }: { chamaId: string; userId: string }) => {
    await api.delete(`/chamas/${chamaId}/members/${userId}`);
};


// === React Query Hooks ===

export const useGetChamas = () => {
  return useQuery<Chama[], Error>({ queryKey: ['chamas'], queryFn: getChamas });
};

export const useGetChamaById = (chamaId: string) => {
    return useQuery<Chama, Error>({
        queryKey: ['chama', chamaId],
        queryFn: () => getChamaById(chamaId),
        enabled: !!chamaId,
    });
};

export const useCreateChama = () => {
  const queryClient = useQueryClient();
  return useMutation<Chama, Error, FormData>({
    mutationFn: createChama,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chamas'] });
      toast.success(`Chama "${data.name}" created successfully!`);
    },
    onError: (error) => {
      if (isAxiosError<{ message: string }>(error)) {
        toast.error(error.response?.data?.message || 'Failed to create chama.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    },
  });
};

export const useDeleteChama = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deleteChama,
        onSuccess: (_, chamaId) => {
            queryClient.invalidateQueries({ queryKey: ['chamas'] });
            queryClient.removeQueries({ queryKey: ['chama', chamaId] });
            toast.success("Chama deleted successfully!");
        },
        onError: (error) => {
            if (isAxiosError<{ message: string }>(error)) {
                toast.error(error.response?.data?.message || "Failed to delete chama.");
            } else {
                toast.error('An unexpected error occurred.');
            }
        }
    });
};

export const useUpdateMemberRole = () => {
    const queryClient = useQueryClient();
    return useMutation<Membership, Error, { chamaId: string; userId: string; role: MembershipRole }>({
        mutationFn: updateMemberRole,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['chama', variables.chamaId] });
            toast.success("Member's role updated successfully!");
        },
        onError: (error) => {
            if (isAxiosError<{ message: string }>(error)) {
                toast.error(error.response?.data?.message || "Failed to update role.");
            } else {
                toast.error('An unexpected error occurred.');
            }
        }
    });
};

export const useAddMember = () => {
    const queryClient = useQueryClient();
    return useMutation<Membership, Error, { chamaId: string; email: string }>({
        mutationFn: addMember,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['chama', variables.chamaId] });
            toast.success("Member added successfully!");
        },
        onError: (error) => {
            if (isAxiosError<{ message: string }>(error)) {
                toast.error(error.response?.data?.message || "Failed to add member.");
            } else {
                toast.error('An unexpected error occurred.');
            }
        }
    });
};

export const useRemoveMember = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { chamaId: string; userId: string }>({
        mutationFn: removeMember,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['chama', variables.chamaId] });
            toast.success("Member removed successfully!");
        },
        onError: (error) => {
            if (isAxiosError<{ message: string }>(error)) {
                toast.error(error.response?.data?.message || "Failed to remove member.");
            } else {
                toast.error('An unexpected error occurred.');
            }
        }
    });
};