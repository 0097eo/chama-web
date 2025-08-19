"use client";

import { Loan, MembershipRole } from "@/types/api";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Check, X, Send } from "lucide-react";
import { useApproveOrRejectLoan, useDisburseLoan } from "@/hooks/useLoans";
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

interface LoanApprovalProps {
    loan: Loan;
    currentUserRole?: MembershipRole;
}

export function LoanApproval({ loan, currentUserRole }: LoanApprovalProps) {
    const approveMutation = useApproveOrRejectLoan();
    const disburseMutation = useDisburseLoan();

    const handleApprove = () => approveMutation.mutate({ loanId: loan.id, status: 'APPROVED' });
    const handleReject = () => approveMutation.mutate({ loanId: loan.id, status: 'REJECTED' });
    const handleDisburse = () => disburseMutation.mutate(loan.id);


    const canApprove = currentUserRole === 'ADMIN' || currentUserRole === 'TREASURER';
    const canDisburse = currentUserRole === 'TREASURER';

    if (loan.status === 'PENDING') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Approval Workflow</CardTitle>
                    <CardDescription>
                        {canApprove 
                            ? "Review and approve or reject this loan application."
                            : "This loan is pending approval from an Admin or Treasurer."
                        }
                    </CardDescription>
                </CardHeader>

                {canApprove && (
                    <CardContent className="flex gap-4">
                        <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                            <Check className="mr-2 h-4 w-4" /> Approve
                        </Button>
                        <Button onClick={handleReject} variant="destructive" disabled={approveMutation.isPending}>
                            <X className="mr-2 h-4 w-4" /> Reject
                        </Button>
                    </CardContent>
                )}
            </Card>
        );
    }

    if (loan.status === 'APPROVED') {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Disbursement</CardTitle>
                    <CardDescription>
                        {canDisburse
                            ? "This loan is approved. You can now disburse the funds."
                            : "This loan is awaiting disbursement by the Treasurer."
                        }
                    </CardDescription>
                </CardHeader>

                {canDisburse && (
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={disburseMutation.isPending}><Send className="mr-2 h-4 w-4" /> Disburse Funds</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Confirm Disbursement</AlertDialogTitle><AlertDialogDescription>This will mark the loan as active and record a transaction. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDisburse}>Confirm</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                )}
            </Card>
        );
    }
    
    return null;
}