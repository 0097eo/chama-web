"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApplyForLoan, useCheckEligibility } from "@/hooks/useLoans";
import { Chama } from "@/types/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

const formSchema = z.object({
  membershipId: z.string().min(1, "Please select the chama you are applying for."),
  amount: z.number().positive("Loan amount must be a positive number."),
  duration: z.number().int().min(1, "Duration must be at least 1 month.").positive(),
  purpose: z.string().min(10, "Please provide a brief purpose for the loan."),
  interestRate: z.number().min(0).max(1),
});

type FormValues = z.infer<typeof formSchema>;

export function LoanApplicationForm({ chamas }: { chamas: Chama[] }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [eligibilityResult, setEligibilityResult] = useState<{ isEligible: boolean; maxLoanable: number; totalContributions: number } | null>(null);

    const applyLoanMutation = useApplyForLoan();
    const checkEligibilityMutation = useCheckEligibility();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { interestRate: 0.1, duration: 6, amount: 0, purpose: "", membershipId: "" }
    });

    const handleCheckEligibility = async () => {
        const isValid = await form.trigger(["membershipId", "amount"]);
        if (!isValid) return;

        const membershipId = form.getValues("membershipId");
        const amount = form.getValues("amount");
        
        const result = await checkEligibilityMutation.mutateAsync({ membershipId, amount });
        setEligibilityResult(result);

        if (result.isEligible) {
            setStep(2);
        }
    };

    const onSubmit = (values: FormValues) => {
        applyLoanMutation.mutate(values, {
            onSuccess: () => router.push('/dashboard/loans')
        });
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div style={{ display: step === 1 ? 'block' : 'none' }} className="space-y-6">
                    <FormField control={form.control} name="membershipId" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Apply as member of</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select your chama" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {chamas.map(chama => {
                                        const member = chama.members.find(m => m.user.id === session?.user?.id);
                                        if (!member) return null;
                                        return <SelectItem key={member.id} value={member.id}>{chama.name}</SelectItem>;
                                    })}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="amount" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Loan Amount (KSH)</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    placeholder="e.g., 20000" 
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {eligibilityResult && !eligibilityResult.isEligible && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Not Eligible</AlertTitle>
                            <AlertDescription>
                                Your requested amount exceeds the maximum you can borrow. Based on your contributions in this chama, you can borrow up to <strong>KSH {(eligibilityResult.maxLoanable || 0).toLocaleString()}</strong>.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button type="button" onClick={handleCheckEligibility} disabled={checkEligibilityMutation.isPending}>
                        {checkEligibilityMutation.isPending ? "Checking..." : "Check Eligibility & Continue"}
                    </Button>
                </div>
                
                <div style={{ display: step === 2 ? 'block' : 'none' }} className="space-y-6">
                    <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800 dark:text-green-400">You are eligible!</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-500">
                            You are eligible for the requested loan of <strong>KSH {(form.getValues("amount") || 0).toLocaleString()}</strong>. Please provide the remaining details.
                        </AlertDescription>
                    </Alert>

                     <FormField control={form.control} name="duration" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Repayment Duration (Months)</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                     <FormField control={form.control} name="purpose" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Purpose of the Loan</FormLabel>
                            <FormControl><Textarea placeholder="e.g., To expand my small business inventory." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <div className="flex gap-4">
                        <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                        <Button type="submit" disabled={applyLoanMutation.isPending}>
                            {applyLoanMutation.isPending ? "Submitting Application..." : "Submit Application"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}