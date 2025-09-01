"use client";

import { useChamaContext } from "@/context/ChamaContext";
import { BroadcastMessage } from "@/components/notifications/BroadcastMessage";
import { NotificationList } from "@/components/notifications/NotificationList";
import { ChamaSelector } from "@/components/chamas/ChamaSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
    const { 
        chamas, 
        activeChama, 
        setActiveChamaId, 
        canBroadCast,
        isLoading 
    } = useChamaContext();

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!chamas || chamas.length === 0) {
        return (
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>No Chamas Found</AlertTitle>
                <AlertDescription>
                    You must be a member of a chama to view notifications. 
                    <Link href="/dashboard/chamas/create" className="underline ml-1">Create one</Link>.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    <p className="text-muted-foreground">
                        Alerts and messages for your selected chama.
                    </p>
                </div>
                <div className="w-full sm:w-[300px]">
                    <ChamaSelector
                        chamas={chamas}
                        selectedChamaId={activeChama?.id || null}
                        onSelectChama={setActiveChamaId}
                    />
                </div>
            </div>
            
            {activeChama ? (
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <NotificationList chamaId={activeChama.id} />
                    </div>

                    {canBroadCast &&(
                        <div className="space-y-4">
                            <BroadcastMessage />
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                    <p>Please select a chama to view its notifications.</p>
                </div>
            )}
        </div>
    );
}