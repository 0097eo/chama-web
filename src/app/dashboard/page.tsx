/* eslint-disable react/no-unescaped-entities */
"use client";

import { StatsCards } from "@/components/dashboard/StatsCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Separator } from "@/components/ui/separator";
import { useGetChamas } from "@/hooks/useChamas"; // Assuming you created this hook
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function DashboardPage() {
  // TODO - Replace with your actual hook.
  const { data: chamas, isLoading } = useGetChamas() || { data: [{ id: "mock-chama-id", name: "My Primary Chama" }], isLoading: false };
  
  // TODO A real app would have a chama selector. For now, we use the first one.
  const activeChama = chamas?.[0];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!activeChama) {
    return (
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Welcome!</AlertTitle>
        <AlertDescription>
          You are not yet a member of any chama. You can create one or ask for an invitation.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard for {activeChama.name}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your chama's current status.
        </p>
      </div>
      
      <StatsCards chamaId={activeChama.id} />

      <Separator />

      <QuickActions chamaId={activeChama.id} />
      
      <div className="mt-8">
        <RecentActivity chamaId={activeChama.id} />
      </div>
    </div>
  );
}