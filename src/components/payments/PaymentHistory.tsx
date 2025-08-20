"use client";

import { useGetMpesaTransactions } from "@/hooks/useMpesa";
import { Skeleton } from "../ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { MpesaTransaction } from "@/types/api";
import { cn } from "@/lib/utils";

export function PaymentHistory({ chamaId }: { chamaId: string }) {
    const { data: transactions, isLoading, error } = useGetMpesaTransactions(chamaId);

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="border rounded-md p-8 text-center">
                <p className="text-red-600">Failed to load transaction history</p>
                <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            </div>
        );
    }

    const formatTransactionDetails = (tx: MpesaTransaction) => {
        if (tx.type === 'Contribution') {
            const monthYear = tx.month && tx.year ? ` (${tx.month}/${tx.year})` : '';
            const penalty = tx.penaltyApplied && tx.penaltyApplied > 0 ? ` +KSH ${tx.penaltyApplied} penalty` : '';
            return `${tx.mpesaCode || 'N/A'}${monthYear}${penalty}`;
        } else {
            return `${tx.purpose || 'Loan disbursement'} • ${tx.mpesaCode || 'N/A'}`;
        }
    };

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount (KSH)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions && transactions.length > 0 ? transactions.map((tx: MpesaTransaction) => (
                        <TableRow key={`${tx.type}-${tx.id}`}>
                            <TableCell className="text-sm">
                                {tx.date ? format(new Date(tx.date), 'MMM dd, yyyy HH:mm') : 'N/A'}
                            </TableCell>
                            <TableCell className="font-medium">{tx.memberName}</TableCell>
                            <TableCell>
                                <Badge 
                                    variant={tx.type === 'Contribution' ? 'default' : 'secondary'}
                                    className={tx.type === 'Contribution' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                                >
                                    {tx.type}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                {formatTransactionDetails(tx)}
                            </TableCell>
                            <TableCell>
                                <Badge 
                                    variant={tx.status === 'PAID' || tx.status === 'APPROVED' ? 'default' : 'destructive'}
                                    className={
                                        tx.status === 'PAID' || tx.status === 'APPROVED' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }
                                >
                                    {tx.status}
                                </Badge>
                            </TableCell>
                            <TableCell className={cn(
                                "text-right font-semibold",
                                tx.amount > 0 ? "text-green-600" : "text-red-600"
                            )}>
                                {tx.amount > 0 ? '+' : ''}{Math.abs(tx.amount).toLocaleString()}
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <p className="text-muted-foreground">No M-Pesa transactions found for this chama.</p>
                                    <p className="text-sm text-muted-foreground">Transactions will appear here once members make contributions or receive disbursements.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}