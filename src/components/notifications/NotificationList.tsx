/* eslint-disable react/no-unescaped-entities */
"use client";

import { useGetNotifications, useMarkAsRead, useDeleteNotification } from "@/hooks/useNotifications";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Bell, Trash2, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Notification } from "@/types/api";

export function NotificationList({ chamaId }: { chamaId: string }) {
    const { data: notifications = [], isLoading } = useGetNotifications(chamaId);
    const markAsReadMutation = useMarkAsRead();
    const deleteMutation = useDeleteNotification();

    const handleMarkAsRead = (notificationId: string) => {
        // Pass both IDs to the mutation for correct cache invalidation
        markAsReadMutation.mutate({ notificationId, chamaId });
    };

    const handleDelete = (notificationId: string) => {
        // Pass both IDs to the mutation
        deleteMutation.mutate({ notificationId, chamaId });
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
            </div>
        );
    }
    
    if (notifications.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold">No new notifications</h3>
                <p className="mt-1 text-sm">You're all caught up!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {notifications.map((notification: Notification) => (
                <div
                    key={notification.id}
                    className={cn(
                        "flex items-start gap-4 p-4 border rounded-lg transition-colors",
                        !notification.read && "bg-primary/5 border-primary/20"
                    )}
                >
                    <div className="flex-1">
                        <p className="font-semibold">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        {!notification.read && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={markAsReadMutation.isPending && markAsReadMutation.variables?.notificationId === notification.id}
                                aria-label="Mark as read"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        )}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" aria-label="Delete notification">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Notification?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this notification.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={() => handleDelete(notification.id)}
                                        className="bg-destructive hover:bg-destructive/90"
                                        disabled={deleteMutation.isPending && deleteMutation.variables?.notificationId === notification.id}
                                    >
                                        {deleteMutation.isPending && deleteMutation.variables?.notificationId === notification.id ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            ))}
        </div>
    );
}