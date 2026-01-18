"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { User } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Zod schema for the form
const formSchema = z.object({
  firstName: z.string().min(2, "First name is too short."),
  lastName: z.string().min(2, "Last name is too short."),
  phone: z.string().regex(/^(?:254|\+254|0)?(7|1)\d{8}$/, "Please enter a valid Kenyan phone number."),
});

type FormValues = z.infer<typeof formSchema>;

// Hook for the update mutation
const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation<User, AxiosError<{ message: string }>, FormValues>({
        mutationFn: (data) => api.put('/auth/profile', data).then(res => res.data.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            toast.success("Profile updated successfully!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update profile.");
        }
    });
};

export function UserProfileForm({ profile }: { profile: User }) {
    const updateProfileMutation = useUpdateProfile();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
        },
    });

    const onSubmit = (values: FormValues) => {
        updateProfileMutation.mutate(values);
    };

    return (
        <Card className="max-w-2xl">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="firstName" render={({ field }) => (
                                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="lastName" render={({ field }) => (
                                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <Input value={profile.email} disabled readOnly />
                        </FormItem>
                         <FormItem>
                            <FormLabel>ID Number</FormLabel>
                            <Input value={profile.idNumber} disabled readOnly />
                        </FormItem>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}