"use client";

import { useGetLoanDefaulters } from "@/hooks/useLoans";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Loan } from "@/types/api";
import { Button } from "../ui/button";
import { Phone } from "lucide-react";
import { useSendLoanReminder } from "@/hooks/useNotifications";
export function LoanDefaultersList({ chamaId }: { chamaId: string }) {
    const { data: defaulters, isLoading } = useGetLoanDefaulters(chamaId);
    
    const sendReminderMutation = useSendLoanReminder();

    const handleSendReminder = (loan: Loan) => {
        sendReminderMutation.mutate({
            chamaId,
            loanId: loan.id,
            memberName: loan.membership.user.firstName,
            phoneNumber: loan.membership.user.phone,
        });
    };

    if (isLoading) {
        return <Skeleton className="h-48 w-full" />;
    }

    if (!defaulters || defaulters.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                <p>There are currently no overdue loans.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {defaulters.map((loan) => (
                    <TableRow key={loan.id} className="bg-destructive/10">
                        <TableCell className="font-medium">
                            {loan.membership.user.firstName} {loan.membership.user.lastName}
                        </TableCell>
                        <TableCell>
                            KSH {loan.monthlyInstallment?.toLocaleString() || 'N/A'}
                        </TableCell>
                        <TableCell>
                            {loan.dueDate ? format(new Date(loan.dueDate), "PPP") : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendReminder(loan)}
                                disabled={sendReminderMutation.isPending && sendReminderMutation.variables?.loanId === loan.id}
                            >
                                <Phone className="mr-2 h-4 w-4" />
                                {sendReminderMutation.isPending && sendReminderMutation.variables?.loanId === loan.id
                                    ? "Sending..."
                                    : "Send Reminder"}
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}