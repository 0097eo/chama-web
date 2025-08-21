"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { User } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfileForm } from "@/components/profile/UserProfileForm";

const getProfile = async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data.data;
};


const useGetProfile = () => {
    return useQuery<User, Error>({
        queryKey: ['profile'],
        queryFn: getProfile,
    });
};


export default function ProfilePage() {
    const { data: profile, isLoading } = useGetProfile();

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-64 w-full max-w-2xl" />
            </div>
        );
    }

    if (!profile) {
        return <p>Could not load user profile.</p>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">
                    View and update your personal information.
                </p>
            </div>
            <UserProfileForm profile={profile} />
        </div>
    );
}