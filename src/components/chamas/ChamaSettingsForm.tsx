/* eslint-disable react/no-unescaped-entities */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Chama } from "@/types/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDeleteChama } from "@/hooks/useChamas";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { Trash2, AlertTriangle } from "lucide-react";

// Form schema
const formSchema = z.object({
  name: z.string().min(3, "Chama name must be at least 3 characters."),
  description: z.string().optional(),
  monthlyContribution: z.coerce.number().positive("Contribution must be a positive number."),
  meetingDay: z.string().min(3, "Meeting day description is required."),
});

type SettingsFormValues = z.infer<typeof formSchema>;

const useUpdateChama = () => {
    const queryClient = useQueryClient();
    return useMutation<Chama, Error, { chamaId: string; data: Partial<SettingsFormValues> }>({
        mutationFn: ({ chamaId, data }) => api.put(`/chamas/${chamaId}`, data).then(res => res.data.data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['chama', data.id] });
            queryClient.invalidateQueries({ queryKey: ['chamas'] });
            toast.success("Chama settings updated successfully!");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Failed to update settings.");
        }
    });
};

export function ChamaSettingsForm({ chama }: { chama: Chama }) {
  const { data: session } = useSession(); // Get the current user's session
  const updateChamaMutation = useUpdateChama();
  const deleteChama = useDeleteChama();
  const router = useRouter();

  const currentUserMembership = chama.members.find(m => m.user.id === session?.user?.id);
  
  const isAdmin = currentUserMembership?.role === 'ADMIN';

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: chama.name,
        description: chama.description || "",
        monthlyContribution: chama.monthlyContribution,
        meetingDay: chama.meetingDay,
    },
  });

  function onSubmit(values: SettingsFormValues) {
    if (!isAdmin) {
        toast.error("You do not have permission to update settings.");
        return;
    }
    updateChamaMutation.mutate({ chamaId: chama.id, data: values });
  }

  const handleDelete = () => {
    if (!isAdmin) {
        toast.error("You do not have permission to delete this chama.");
        return;
    }
    deleteChama.mutate(chama.id, {
      onSuccess: () => {
        router.push('/dashboard/chamas');
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chama Settings</CardTitle>
          <CardDescription>Update the core details of your chama here. Only Admins can save changes.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* FormFields are disabled if the user is not an admin */}
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Chama Name</FormLabel><FormControl><Input {...field} disabled={!isAdmin} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} disabled={!isAdmin} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="monthlyContribution" render={({ field }) => (
                <FormItem><FormLabel>Monthly Contribution (KSH)</FormLabel><FormControl><Input type="number" {...field} disabled={!isAdmin} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="meetingDay" render={({ field }) => (
                <FormItem><FormLabel>Meeting Day</FormLabel><FormControl><Input placeholder="e.g., Last Sunday of the month" {...field} disabled={!isAdmin} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
            {isAdmin && (
              <CardFooter className="border-t px-6 py-4">
                 <Button type="submit" disabled={updateChamaMutation.isPending}>
                    {updateChamaMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            )}
          </form>
        </Form>
      </Card>

      {/* Danger Zone - Conditionally rendered based on the correct isAdmin check */}
      {isAdmin && (
        <>
          <Separator />
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleteChama.isPending} className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    {deleteChama.isPending ? 'Deleting...' : 'Delete Chama'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the chama "<strong>{chama.name}</strong>" and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      Yes, delete chama
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}