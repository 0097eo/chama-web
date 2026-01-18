"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Meeting } from '@/types/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { MeetingAttendance } from '@/types/api';


interface ScheduleMeetingData {
    chamaId: string;
    title: string;
    agenda?: string;
    location?: string;
    scheduledFor: string; // ISO string format
}

interface UpdateMeetingData {
    title?: string;
    agenda?: string;
    location?: string;
    scheduledFor?: string;
}

// === API Functions ===

const getQrCode = async (meetingId: string): Promise<{ qrCodeDataUrl: string }> => {
    const response = await api.get(`/meetings/${meetingId}/qr-code`);
    return response.data.data;
};

const getAttendanceList = async (meetingId: string): Promise<MeetingAttendance[]> => {
    const response = await api.get(`/meetings/${meetingId}/attendance`);
    return response.data.data;
};

const markMyAttendance = async (meetingId: string) => {
    return api.post(`/meetings/${meetingId}/attendance`);
};

const getMeetingById = async (meetingId: string): Promise<Meeting> => {
    const response = await api.get(`/meetings/${meetingId}`);
    return response.data.data;
};

const getChamaMeetings = async (chamaId: string): Promise<Meeting[]> => {
    const response = await api.get(`/meetings/chama/${chamaId}`);
    return response.data.data;
};

const scheduleMeeting = async (data: ScheduleMeetingData): Promise<Meeting> => {
    const response = await api.post('/meetings', data);
    return response.data.data;
};

const saveMeetingMinutes = async ({ meetingId, minutes }: { meetingId: string, minutes: string }) => {
    return api.post(`/meetings/${meetingId}/minutes`, { minutes });
};

const updateMeeting = async ({ meetingId, data }: { meetingId: string, data: UpdateMeetingData }) => {
    const response = await api.put(`/meetings/${meetingId}`, data);
    return response.data.data;
};

const cancelMeeting = async (meetingId: string) => {
    await api.delete(`/meetings/${meetingId}`);
};

// === React Query Hooks ===

export const useGetChamaMeetings = (chamaId: string | null | undefined) => {
    return useQuery<Meeting[], Error>({
        queryKey: ['meetings', chamaId],
        queryFn: () => getChamaMeetings(chamaId!),
        enabled: !!chamaId,
    });
};

export const useScheduleMeeting = () => {
    const queryClient = useQueryClient();
    return useMutation<Meeting, AxiosError<{ message: string }>, ScheduleMeetingData>({
        mutationFn: scheduleMeeting,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['meetings', data.chamaId] });
            toast.success("Meeting scheduled successfully!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to schedule meeting.");
        }
    });
};

export const useSaveMeetingMinutes = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveMeetingMinutes,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['meetings'] });
            queryClient.invalidateQueries({ queryKey: ['meeting', variables.meetingId] });
            toast.success("Meeting minutes saved successfully!");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Failed to save minutes.");
        }
    });
};

export const useGetMeetingById = (meetingId: string | null | undefined) => {
    return useQuery<Meeting, Error>({
        queryKey: ['meeting', meetingId],
        queryFn: () => getMeetingById(meetingId!),
        enabled: !!meetingId,
    });
};

export const useUpdateMeeting = () => {
    const queryClient = useQueryClient();
    return useMutation<Meeting, AxiosError<{ message: string }>, { meetingId: string, data: UpdateMeetingData }>({
        mutationFn: updateMeeting,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['meeting', data.id] });
            queryClient.invalidateQueries({ queryKey: ['meetings', data.chamaId] });
            toast.success("Meeting details updated successfully!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update meeting.");
        }
    });
};

export const useCancelMeeting = () => {
    const queryClient = useQueryClient();
    return useMutation<void, AxiosError<{ message: string }>, string>({
        mutationFn: cancelMeeting,
        onSuccess: (_, meetingId) => {
            queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
            queryClient.invalidateQueries({ queryKey: ['meetings'] }); // Invalidate list to update status
            toast.success("Meeting has been cancelled.");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to cancel meeting.");
        }
    });
};

export const useGetQrCode = (meetingId: string) => {
    return useQuery<{ qrCodeDataUrl: string }, Error>({
        queryKey: ['qr-code', meetingId],
        queryFn: () => getQrCode(meetingId),
    });
};

export const useGetAttendanceList = (meetingId: string) => {
    return useQuery<MeetingAttendance[], Error>({
        queryKey: ['attendance', meetingId],
        queryFn: () => getAttendanceList(meetingId),
        refetchInterval: 10000, // Refetch every 10 seconds for live updates
    });
};

export const useMarkMyAttendance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markMyAttendance,
        onSuccess: (_, meetingId) => {
            queryClient.invalidateQueries({ queryKey: ['attendance', meetingId] });
            toast.success("Your attendance has been marked successfully!");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            const message = error.response?.data?.message || "Failed to mark attendance";
            toast.error(message);
        }
    });
};