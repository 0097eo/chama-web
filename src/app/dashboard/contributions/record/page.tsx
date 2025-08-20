"use client";

import { useState, useEffect } from "react";
import { ContributionForm } from "@/components/contributions/ContributionForm";
import { MpesaPayment } from "@/components/payments/MpesaPayment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetChamas } from "@/hooks/useChamas";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChamaSelector } from "@/components/chamas/ChamaSelector";
import { Chama } from "@/types/api";

export default function RecordContributionPage() {
  const { data: session } = useSession();
  const { data: chamas, isLoading } = useGetChamas();
  
  const [activeChama, setActiveChama] = useState<Chama | null>(null);

  useEffect(() => {
    if (!activeChama && chamas && chamas.length > 0) {
      setActiveChama(chamas[0]);
    }
  }, [chamas, activeChama]);

  const isPrivilegedInActiveChama = activeChama?.members?.some(member => 
    member.user.id === session?.user?.id && 
    ['ADMIN', 'TREASURER', 'SECRETARY'].includes(member.role)
  ) ?? false;

  if (isLoading) {
    return (
        <div className="flex justify-center pt-8">
            <Skeleton className="h-96 w-full max-w-2xl" />
        </div>
    );
  }

  if (!chamas || chamas.length === 0) {
    return (
        <Alert className="max-w-2xl mx-auto">
            <Terminal className="h-4 w-4" />
            <AlertTitle>No Chamas Found</AlertTitle>
            <AlertDescription>
                You must be a member of at least one chama to record contributions. 
                <Link href="/dashboard/chamas/create" className="underline ml-1 font-semibold">Create one</Link> to get started.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Make a Contribution</CardTitle>
        <CardDescription>
          Select a chama, then choose a payment method below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div>
          <label className="text-sm font-medium mb-2 block">Select Chama</label>
          <ChamaSelector 
            chamas={chamas}
            selectedChamaId={activeChama?.id || null}
            onSelectChama={(chamaId) => {
              const newActiveChama = chamas.find(c => c.id === chamaId) || null;
              setActiveChama(newActiveChama);
            }}
          />
        </div>

        {activeChama ? (
            <Tabs defaultValue="mpesa" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mpesa">Pay with M-Pesa</TabsTrigger>
                {isPrivilegedInActiveChama && (
                    <TabsTrigger value="manual">Manual Entry (Admin)</TabsTrigger>
                )}
            </TabsList>
            
            <TabsContent value="mpesa" className="pt-6">
                <MpesaPayment chama={activeChama} />
            </TabsContent>
            
            {isPrivilegedInActiveChama && (
                <TabsContent value="manual" className="pt-6">
                    <ContributionForm chamas={chamas} selectedChama={activeChama} />
                </TabsContent>
            )}
            </Tabs>
        ) : (
            <div className="text-center text-muted-foreground pt-8">
                <p>Please select a chama to continue.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}