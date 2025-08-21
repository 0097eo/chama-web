"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { File as ChamaFile } from '@/types/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

// === API Functions ===
const getFileById = async (fileId: string): Promise<ChamaFile> => {
    const response = await api.get(`/files/${fileId}`);
    return response.data.data;
};

const getChamaFiles = async (chamaId: string): Promise<ChamaFile[]> => {
    const response = await api.get(`/files/chama/${chamaId}`);
    return response.data.data;
};

interface UploadFilePayload {
    chamaId: string;
    file: File;
    category?: string;
}
const uploadFile = async (data: UploadFilePayload): Promise<ChamaFile> => {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.category) {
        formData.append('category', data.category);
    }
    const response = await api.post(`/files/upload/${data.chamaId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

const deleteFile = async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}`);
};


// === React Query Hooks ===

export const useGetChamaFiles = (chamaId: string | null | undefined) => {
    return useQuery<ChamaFile[], Error>({
        queryKey: ['files', chamaId],
        queryFn: () => getChamaFiles(chamaId!),
        enabled: !!chamaId,
    });
};

export const useUploadFile = () => {
    const queryClient = useQueryClient();
    return useMutation<ChamaFile, Error, UploadFilePayload>({
        mutationFn: uploadFile,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['files', data.chamaId] });
            toast.success("File uploaded successfully!");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || 'File upload failed.');
        }
    });
};

export const useDeleteFile = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { fileId: string; chamaId: string }>({
        mutationFn: ({ fileId }) => deleteFile(fileId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['files', variables.chamaId] });
            toast.success("File deleted successfully!");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || 'Failed to delete file.');
        }
    });
};

export const useGetFileById = (fileId: string | null | undefined) => {
    return useQuery<ChamaFile, Error>({
        queryKey: ['file', fileId],
        queryFn: () => getFileById(fileId!),
        enabled: !!fileId,
    });
};