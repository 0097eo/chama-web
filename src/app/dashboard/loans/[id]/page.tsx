"use client";

import * as React from "react";
import { useGetLoanById } from "@/hooks/useLoans";
import { Skeleton } from "@/components/ui/skeleton";
import { LoanApproval } from "@/components/loans/LoanApproval";
import { useSession } from "next-auth/react";
import { useGetChamas } from "@/hooks/useChamas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { RepaymentSchedule } from "@/components/loans/RepaymentSchedule";
import { PaymentTracking } from "@/components/loans/PaymentTracking";
import { LoanStatus } from "@/types/api";

const getStatusVariant = (status: LoanStatus) => {
    switch(status) {
        case 'APPROVED': return 'default';
        case 'ACTIVE': return 'secondary';
        case 'PAID': return 'outline';
        case 'REJECTED':
        case 'DEFAULTED':
             return 'destructive';
        default: return 'secondary';
    }
}

export default function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;

  const { data: session } = useSession();
  const { data: loan, isLoading } = useGetLoanById(id);
  const { data: chamas } = useGetChamas();

    const currentUserMembership = chamas?.flatMap(c => c.members).find(
        m => m.user.id === session?.user?.id && m.chamaId === loan?.membership.chamaId
    );

    const currentUserRole = currentUserMembership?.role;
    
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!loan) {
        return <p className="text-center text-muted-foreground py-12">Loan not found.</p>;
    }

    const memberName = `${loan.membership.user.firstName} ${loan.membership.user.lastName}`;

    return (
        <div className="space-y-8">
            <div>
                <Badge variant={getStatusVariant(loan.status)} className="text-sm">
                    {loan.status}
                </Badge>
                <h1 className="text-3xl font-bold mt-2">Loan for {memberName}</h1>
                <p className="text-muted-foreground">Applied on {format(new Date(loan.appliedAt), 'PPP')}</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Loan Summary</CardTitle>
                    <CardDescription>
                        {loan.purpose}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Principal Amount</p>
                        <p className="font-semibold text-lg">KSH {loan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Interest Rate</p>
                        <p className="font-semibold text-lg">{(loan.interestRate * 100).toFixed(1)}% per year</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold text-lg">{loan.duration} months</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Repayable</p>
                        <p className="font-semibold text-lg text-blue-600">
                            KSH {loan.repaymentAmount?.toLocaleString() || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Monthly Installment</p>
                        <p className="font-semibold text-lg">
                            KSH {loan.monthlyInstallment?.toLocaleString() || 'N/A'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {['PENDING', 'APPROVED'].includes(loan.status) && (
                 <LoanApproval loan={loan} currentUserRole={currentUserRole} />
            )}
            
            {['ACTIVE', 'PAID', 'DEFAULTED'].includes(loan.status) && (
                <div className="grid lg:grid-cols-2 gap-8">
                    <PaymentTracking loan={loan} currentUserRole={currentUserRole} />
                    <RepaymentSchedule loanId={loan.id} />
                </div>
            )}
        </div>
    );
}