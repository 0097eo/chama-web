"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { useInitiateStkPush, useRecordContribution } from "@/hooks/useContributions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chama } from "@/types/api";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const formSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(new Date().getFullYear() - 5),
});

type FormValues = z.infer<typeof formSchema>;

export function MpesaPayment({ chama }: { chama: Chama }) {
  const { data: session } = useSession();
  const recordContributionMutation = useRecordContribution();
  const initiateStkPushMutation = useInitiateStkPush();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  });

  const currentUserMembership = chama.members.find(m => m.user.id === session?.user?.id);

  async function onSubmit(values: FormValues) {
    if (!currentUserMembership) {
      toast.error("Could not find your membership in this chama.");
      return;
    }
    if (!session?.user?.phone) {
      toast.error("Your phone number is not available. Please update your profile.");
      return;
    }

    const formattedPhone = session.user.phone.startsWith('+') 
      ? session.user.phone.substring(1) 
      : session.user.phone;

    const pendingContributionData = {
        membershipId: currentUserMembership.id,
        amount: chama.monthlyContribution,
        month: values.month,
        year: values.year,
        paymentMethod: 'M-PESA',
        status: 'PENDING', // Explicitly set as PENDING for M-Pesa
        paidAt: new Date(), // This will be updated by the callback when payment succeeds
    };
    
    try {
      const newContribution = await recordContributionMutation.mutateAsync(pendingContributionData);
      
      await initiateStkPushMutation.mutateAsync({
        contributionId: newContribution.id,
        amount: chama.monthlyContribution,
        phone: formattedPhone,
      });

      toast.success("Payment request sent to your phone. Please complete the transaction.");

    } catch (error) { 
      console.error("STK Push flow failed:", error);
    }
  }
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <p className="text-sm">You are about to make a payment for <strong>{chama.name}</strong>.</p>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="month" render={({ field }) => (
              <FormItem>
                  <FormLabel>For the Month of</FormLabel>
                  <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{monthNames.map((m, i) => <SelectItem key={m} value={String(i+1)}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
              </FormItem>
          )} />
          <FormField control={form.control} name="year" render={({ field }) => (
              <FormItem>
                  <FormLabel>For the Year</FormLabel>
                   <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                  <FormMessage />
              </FormItem>
          )} />
        </div>

        <p className="text-sm text-muted-foreground border-t pt-4">
            Contribution Amount: <strong className="text-lg text-foreground">KSH {chama.monthlyContribution.toLocaleString()}</strong>
        </p>

        <Button 
            type="submit" 
            className="w-full" 
            disabled={recordContributionMutation.isPending || initiateStkPushMutation.isPending}
        >
          {recordContributionMutation.isPending 
            ? "Preparing Payment..." 
            : initiateStkPushMutation.isPending 
              ? "Sending to Your Phone..." 
              : "Pay with M-Pesa"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">A prompt will be sent to your registered phone number to complete the payment.</p>
      </form>
    </Form>
  );
}