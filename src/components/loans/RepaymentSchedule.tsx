"use client";

import { useGetRepaymentSchedule } from "@/hooks/useLoans";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

export function RepaymentSchedule({ loanId }: { loanId: string }) {
    const { data: schedule, isLoading } = useGetRepaymentSchedule(loanId);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Repayment Schedule
                </CardTitle>
                <CardDescription>
                    This is the projected payment schedule for this loan.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <Skeleton className="h-48 w-full" />}

                {!isLoading && schedule && schedule.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Installment</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="text-right">Payment (KSH)</TableHead>
                                <TableHead className="text-right">Remaining Balance (KSH)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedule.map((item) => (
                                <TableRow key={item.installment}>
                                    <TableCell className="font-medium">{item.installment}</TableCell>
                                    <TableCell>{format(new Date(item.dueDate), 'PPP')}</TableCell>
                                    <TableCell className="text-right">{item.payment.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{item.balance.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                {!isLoading && (!schedule || schedule.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">
                        The repayment schedule will be generated once the loan is disbursed.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}