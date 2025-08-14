
"use client";

import { useState, useEffect } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Separator } from "@/components/ui/separator";
import { useGetChamas } from "@/hooks/useChamas";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChamaSelector } from "@/components/chamas/ChamaSelector";

export default function DashboardPage() {
  const { data: chamas, isLoading } = useGetChamas();
  const [selectedChamaId, setSelectedChamaId] = useState<string | null>(null);

  // Auto-select the first chama when chamas are loaded (optional)
  useEffect(() => {
    if (chamas && chamas.length > 0 && !selectedChamaId) {
      setSelectedChamaId(chamas[0].id);
    }
  }, [chamas, selectedChamaId]);

  const activeChama = chamas?.find(chama => chama.id === selectedChamaId);

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

  if (!chamas || chamas.length === 0) {
    return (
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Welcome!</AlertTitle>
        <AlertDescription className="flex justify-between items-center">
          You are not yet a member of any chama. You can create one or ask for an invitation.
          <Button asChild className="ml-4">
            <Link href="/dashboard/chamas/create">Create a Chama</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-muted-foreground">
            Select a chama to view its current status and manage activities.
          </p>
        </div>
        
        <div className="w-full md:w-[400px]">
          <ChamaSelector
            chamas={chamas}
            selectedChamaId={selectedChamaId}
            onSelectChama={setSelectedChamaId}
          />
        </div>
      </div>

      {activeChama ? (
        <>
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{activeChama.name}</h2>
                {activeChama.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeChama.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Monthly Contribution</p>
                <p className="text-lg font-semibold">
                  KSH {activeChama.monthlyContribution.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <StatsCards chamaId={activeChama.id} />

          <Separator />

          <QuickActions chamaId={activeChama.id} />
          
          <div className="mt-8">
            <RecentActivity chamaId={activeChama.id} />
          </div>
        </>
      ) : (
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>No Chama Selected</AlertTitle>
          <AlertDescription>
            Please select a chama from the dropdown above to view its dashboard.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}