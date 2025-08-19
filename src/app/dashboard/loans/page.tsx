"use client";

import { useGetChamas } from "@/hooks/useChamas";
import { useGetChamaLoans } from "@/hooks/useLoans";
import { LoanCard } from "@/components/loans/LoanCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Info, MessageSquareWarning, User } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { ChamaSelector } from "@/components/chamas/ChamaSelector";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoanDefaultersList } from "@/components/loans/LoanDefaultersList";
import { cn } from "@/lib/utils";

export default function LoansPage() {
    const { data: session } = useSession();
    const [activeChamaId, setActiveChamaId] = useState<string | null>(null);
    const { data: chamas, isLoading: chamasLoading } = useGetChamas();

    useEffect(() => {
        if (!activeChamaId && chamas && chamas.length > 0) {
            setActiveChamaId(chamas[0].id);
        }
    }, [chamas, activeChamaId]);

    const { data: allLoans, isLoading: loansLoading } = useGetChamaLoans(activeChamaId!);
    const activeChama = chamas?.find(c => c.id === activeChamaId);

    const { isPrivileged, isFinancialManager, currentUserMembershipId } = useMemo(() => {
        if (!activeChama || !session?.user) {
            return { isPrivileged: false, isFinancialManager: false, currentUserMembershipId: null };
        }
        const membership = activeChama.members.find(m => m.user.id === session.user.id);
        const privilegedRoles = ['ADMIN', 'TREASURER', 'SECRETARY'];
        const financialRoles = ['ADMIN', 'TREASURER'];
        return {
            isPrivileged: !!membership && privilegedRoles.includes(membership.role),
            isFinancialManager: !!membership && financialRoles.includes(membership.role),
            currentUserMembershipId: membership?.id || null,
        };
    }, [activeChama, session]);

    const filteredLoans = useMemo(() => {
        if (!allLoans) return [];
        if (isPrivileged) {
            return allLoans;
        }
        return allLoans.filter(loan => loan.membershipId === currentUserMembershipId);
    }, [allLoans, isPrivileged, currentUserMembershipId]);


    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Loan Management</h1>
                    <p className="text-muted-foreground">
                        Select a chama to manage its loans.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
                    {chamas && (
                        <ChamaSelector
                            chamas={chamas}
                            selectedChamaId={activeChamaId}
                            onSelectChama={setActiveChamaId}
                            className="w-full sm:w-[250px]"
                        />
                    )}
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/dashboard/loans/apply">
                            <PlusCircle className="mr-2 h-4 w-4" /> Apply for Loan
                        </Link>
                    </Button>
                </div>
            </div>
            
            {activeChamaId ? (
                <Tabs defaultValue="all_loans" className="w-full">
                    <TabsList className="bg-transparent p-0 h-auto justify-start gap-2">
                        <TabsTrigger
                            value="all_loans"
                            className={cn(
                                buttonVariants({ variant: "secondary", size: "default" }),
                                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            )}
                        >
                            <User className="mr-2 h-4 w-4" />
                            {isPrivileged ? "All Loans" : "My Loans"}
                        </TabsTrigger>
                        
                        {isFinancialManager && (
                            <TabsTrigger
                                value="defaulters"
                                className={cn(
                                    buttonVariants({ variant: "secondary", size: "default" }),
                                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                )}
                            >
                                <MessageSquareWarning className="mr-2 h-4 w-4" />
                                Defaulters
                            </TabsTrigger>
                        )}
                    </TabsList>
                    
                    <TabsContent value="all_loans" className="mt-6">
                        {(chamasLoading || loansLoading) ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-56" />)}
                            </div>
                        ) : (
                            filteredLoans.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredLoans.map((loan) => {
                                        const member = activeChama?.members.find(m => m.id === loan.membershipId);
                                        const memberName = member ? `${member.user.firstName} ${member.user.lastName}` : "Unknown";
                                        return <LoanCard key={loan.id} loan={loan} memberName={memberName} />;
                                    })}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                                    <Info className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-semibold">No loans to display</h3>
                                    <p className="mt-1 text-sm">
                                        {isPrivileged ? "No loans have been recorded for this chama yet." : "You have not applied for any loans in this chama."}
                                    </p>
                                </div>
                            )
                        )}
                    </TabsContent>
                    
                    {isFinancialManager && (
                        <TabsContent value="defaulters" className="mt-6">
                            <LoanDefaultersList chamaId={activeChamaId} />
                        </TabsContent>
                    )}
                </Tabs>
            ) : (
                <Skeleton className="h-96 w-full" />
            )}
        </div>
    );
}