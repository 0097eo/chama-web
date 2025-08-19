"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Loan, LoanStatus } from "@/types/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const getStatusVariant = (status: LoanStatus, isDefaulted: boolean) => {
    if (isDefaulted) return 'destructive';
    switch(status) {
        case 'APPROVED': return 'default';
        case 'ACTIVE': return 'secondary';
        case 'PAID': return 'outline';
        case 'REJECTED': return 'destructive';
        default: return 'secondary';
    }
}

const LoanCardStatusContent = ({ loan, isDefaulted }: { loan: Loan; isDefaulted: boolean }) => {
    switch (loan.status) {
        case 'ACTIVE':
        case 'DEFAULTED':
            return (
                <p>
                    <strong>Next Payment Due:</strong>{' '}
                    <span className={cn(isDefaulted && "text-destructive font-semibold")}>
                        {loan.dueDate ? format(new Date(loan.dueDate), 'PPP') : 'N/A'}
                    </span>
                </p>
            );
        case 'PAID':
            return (
                <p className="text-sm text-green-600">
                    This loan has been fully repaid.
                </p>
            );
        case 'APPROVED':
             return (
                <p className="text-sm text-blue-600">
                    Approved on {loan.approvedAt ? format(new Date(loan.approvedAt), 'PPP') : ''}. Awaiting disbursement.
                </p>
            );
        case 'REJECTED':
            return (
                <p className="text-sm text-destructive">
                    This loan application was rejected.
                </p>
            );
        case 'PENDING':
        default:
            return (
                <p className="text-sm text-muted-foreground">
                    This loan application is awaiting approval.
                </p>
            );
    }
}


interface LoanCardProps {
    loan: Loan;
    memberName: string;
}

export function LoanCard({ loan, memberName }: LoanCardProps) {
  const isDefaulted = !!(loan.status === 'ACTIVE' && loan.dueDate && new Date(loan.dueDate) < new Date());

  return (
    <Card className={cn(
      "flex flex-col",
      isDefaulted && "border-destructive/50 bg-destructive/5 dark:bg-destructive/10"
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Loan for {memberName}</CardTitle>
                <CardDescription>Applied on {format(new Date(loan.appliedAt), 'PPP')}</CardDescription>
            </div>
            <Badge variant={getStatusVariant(loan.status, isDefaulted)}>
                {isDefaulted ? 'DEFAULTED' : loan.status}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 flex-grow">
        <p><strong>Amount:</strong> KSH {loan.amount.toLocaleString()}</p>
        <p><strong>Duration:</strong> {loan.duration} months</p>
        
        <div className="pt-2">
            <LoanCardStatusContent loan={loan} isDefaulted={isDefaulted} />
        </div>

      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/loans/${loan.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}