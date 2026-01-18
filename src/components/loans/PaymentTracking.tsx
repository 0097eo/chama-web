"use client";

import { Loan, MembershipRole } from "@/types/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { format } from "date-fns";
import { PlusCircle, HandCoins } from "lucide-react";
import { useRecordLoanPayment } from "@/hooks/useLoans";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";
import { Separator } from "../ui/separator";

const paymentSchema = z.object({
    amount: z.number().positive(),
    paymentMethod: z.string().min(1, "Payment method is required."),
    mpesaCode: z.string().optional(),
    paidAt: z.date(),
});
type PaymentFormValues = z.infer<typeof paymentSchema>;

function RecordPaymentForm({ loan, onSuccess }: { loan: Loan, onSuccess: () => void }) {
    const recordPaymentMutation = useRecordLoanPayment();
    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: loan.monthlyInstallment || 0,
            paymentMethod: "M-PESA",
            mpesaCode: "",
            paidAt: new Date(),
        }
    });

    const onSubmit = (values: PaymentFormValues) => {
        const paymentData = {
            amount: values.amount,
            paymentMethod: values.paymentMethod,
            mpesaCode: values.mpesaCode,
            paidAt: values.paidAt.toISOString(),
        };
        
        recordPaymentMutation.mutate({ loanId: loan.id, data: paymentData }, {
            onSuccess: () => {
                form.reset();
                onSuccess();
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment Amount (KSH)</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    placeholder="Enter amount paid" 
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a payment method" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="M-PESA">M-PESA</SelectItem>
                                    <SelectItem value="Bank">Bank Transfer</SelectItem>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {form.watch("paymentMethod") === "M-PESA" && (
                    <FormField
                        control={form.control}
                        name="mpesaCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>M-Pesa Transaction Code (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., SGH8ABCDEF" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <DialogFooter>
                    <Button type="submit" disabled={recordPaymentMutation.isPending} className="w-full">
                        {recordPaymentMutation.isPending ? "Recording..." : "Record Loan Payment"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}


interface PaymentTrackingProps {
    loan: Loan;
    currentUserRole?: MembershipRole;
}

export function PaymentTracking({ loan, currentUserRole }: PaymentTrackingProps) {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const payments = loan.payments || [];
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = (loan.repaymentAmount || 0) - totalPaid;
    
    const canRecordPayment = currentUserRole === 'TREASURER';

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <HandCoins className="h-5 w-5" />
                        Payment History
                    </CardTitle>
                    {loan.status === 'ACTIVE' && canRecordPayment && (
                        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Record Payment</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Record New Loan Payment</DialogTitle>
                                    <DialogDescription>
                                        Enter the details of the repayment made by the member.
                                    </DialogDescription>
                                </DialogHeader>
                                <RecordPaymentForm loan={loan} onSuccess={() => setDialogOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
                <CardDescription>A log of all repayments made for this loan.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 space-y-2">
                    <div className="flex justify-between font-semibold"><span>Total Paid:</span> <span>KSH {totalPaid.toLocaleString()}</span></div>
                    <div className="flex justify-between font-semibold text-primary"><span>Remaining Balance:</span> <span>KSH {balance.toLocaleString()}</span></div>
                </div>
                <Separator />
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date Paid</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead className="text-right">Amount (KSH)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.length > 0 ? payments.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{format(new Date(p.paidAt), 'PPP')}</TableCell>
                                <TableCell>{p.paymentMethod}</TableCell>
                                <TableCell className="text-right">{p.amount.toLocaleString()}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No payments have been recorded yet.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}