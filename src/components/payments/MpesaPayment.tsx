"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRecordContribution } from "@/hooks/useContributions";
import { useInitiateStkPush } from "@/hooks/useMpesa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chama } from "@/types/api";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { PaymentStatus } from "./PaymentStatus";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(new Date().getFullYear() - 5),
});

type FormValues = z.infer<typeof formSchema>;

export function MpesaPayment({ chama }: { chama: Chama }) {
  const { data: session } = useSession();
  const recordContributionMutation = useRecordContribution();
  const initiateStkPushMutation = useInitiateStkPush();
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

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

    setCheckoutRequestId(null);

    const formattedPhone = session.user.phone.startsWith('+') 
      ? session.user.phone.substring(1) 
      : session.user.phone;

    const pendingContributionData = {
        membershipId: currentUserMembership.id,
        amount: chama.monthlyContribution,
        month: values.month,
        year: values.year,
        paymentMethod: 'M-PESA',
        status: 'PENDING',
        paidAt: new Date(),
    };
    
    try {
      const newContribution = await recordContributionMutation.mutateAsync(pendingContributionData);
      
      const stkResponse = await initiateStkPushMutation.mutateAsync({
        contributionId: newContribution.id,
        amount: process.env.NODE_ENV === 'development' ? 1 : chama.monthlyContribution,
        phone: formattedPhone,
      });

      // Set the checkout request ID to start polling
      if (stkResponse.CheckoutRequestID) {
        setCheckoutRequestId(stkResponse.CheckoutRequestID);
      }

    } catch (error) { 
      console.error("STK Push flow failed:", error);
      // Reset state on error
      setCheckoutRequestId(null);
    }
  }

  const handleNewPayment = () => {
    setCheckoutRequestId(null);
    form.reset({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
  };
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  // If we have a checkout request ID, show the payment status
  if (checkoutRequestId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaymentStatus checkoutRequestId={checkoutRequestId} />
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Payment Details:
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Chama:</span> {chama.name}
              </div>
              <div>
                <span className="font-medium">Amount:</span> KSH {chama.monthlyContribution.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Month:</span> {monthNames[form.getValues('month') - 1]}
              </div>
              <div>
                <span className="font-medium">Year:</span> {form.getValues('year')}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleNewPayment} 
            variant="outline" 
            className="w-full"
          >
            Make Another Payment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make M-Pesa Payment</CardTitle>
      </CardHeader>
      <CardContent>
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

            <div className="border rounded-lg p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Payment Summary</p>
              <div className="flex justify-between items-center">
                <span className="text-sm">Contribution Amount:</span>
                <strong className="text-lg">KSH {chama.monthlyContribution.toLocaleString()}</strong>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-orange-600 mt-2">
                  Development mode: Payment amount is KSH 1 for testing
                </p>
              )}
            </div>

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
            
            <p className="text-xs text-center text-muted-foreground">
              A prompt will be sent to your registered phone number ({session?.user?.phone}) to complete the payment.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}