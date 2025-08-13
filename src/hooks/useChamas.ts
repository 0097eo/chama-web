"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Chama } from '@/types/api';
import toast from 'react-hot-toast';

// API Functions
const getChamas = async (): Promise<Chama[]> => {
  const response = await api.get('/chamas');
  return response.data.data;
};

const createChama = async (chamaData: FormData): Promise<Chama> => {
    // Use FormData for file uploads
    const response = await api.post('/chamas', chamaData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

// React Query Hooks
export const useGetChamas = () => {
  return useQuery<Chama[], Error>({
    queryKey: ['chamas'],
    queryFn: getChamas,
  });
};

export const useCreateChama = () => {
  const queryClient = useQueryClient();

  return useMutation<Chama, Error, FormData>({
    mutationFn: createChama,
    onSuccess: (data) => {
      // When a new chama is created, invalidate the 'chamas' query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['chamas'] });
      toast.success(`Chama "${data.name}" created successfully!`);
    },
    onError: (error) => {
      toast.error(`Failed to create chama: ${error.message}`);
    },
  });
};