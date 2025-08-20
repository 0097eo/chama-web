"use client";

import { useChamaContext } from "@/context/ChamaContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentHistory } from "@/components/payments/PaymentHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessDenied } from "@/components/layout/AccessDenied";
import { ChamaSelector } from "@/components/chamas/ChamaSelector";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Link from "next/link";

export default function MpesaPaymentsPage() {
    const { 
        chamas, 
        activeChama, 
        setActiveChamaId, 
        currentUserMembership, 
        isLoading,
        resetToDefaultChama 
    } = useChamaContext();

    const userRole = currentUserMembership?.role;
    const isFinancialManager = userRole === 'ADMIN' || userRole === 'TREASURER';

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
                    You must be a member of at least one chama to view this page. 
                    <Link href="/dashboard/chamas/create" className="underline ml-1">Create one</Link>.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">M-Pesa Transactions</h1>
                    <p className="text-muted-foreground">
                        View a history of M-Pesa transactions for a selected chama.
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

            {!activeChama ? (
                <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                    <p>Please select a chama to view transactions.</p>
                </div>
            ) : isFinancialManager ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History for {activeChama.name}</CardTitle>
                        <CardDescription>
                            This list includes both incoming contributions and outgoing loan disbursements.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PaymentHistory chamaId={activeChama.id} />
                    </CardContent>
                </Card>
            ) : (
                <AccessDenied 
                    requiredRoles={['Admin', 'Treasurer']}
                    onReturn={resetToDefaultChama}
                />
            )}
        </div>
    );
}