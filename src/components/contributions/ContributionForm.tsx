"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRecordContribution } from "@/hooks/useContributions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chama } from "@/types/api";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  chamaId: z.string().min(1, "Please select a chama."),
  membershipId: z.string().min(1, "Please select a member."),
  amount: z.coerce.number().positive(),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(new Date().getFullYear() - 10).max(new Date().getFullYear() + 1),
  paymentMethod: z.enum(["Cash", "Bank"]),
  paidAt: z.date({ required_error: "A payment date is required." }),
});

type FormValues = z.infer<typeof formSchema>;

export function ContributionForm({ chamas, selectedChama }: { chamas: Chama[], selectedChama?: Chama | null }) {
  const router = useRouter();
  const { data: session } = useSession();
  const recordContributionMutation = useRecordContribution();
  
  const [selectedChamaId, setSelectedChamaId] = useState<string | null>(selectedChama?.id || null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        chamaId: selectedChama?.id || "",
        membershipId: "",
        amount: selectedChama?.monthlyContribution || 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        paymentMethod: "Cash",
        paidAt: new Date(),
    },
  });
  
  const selectedChamaForForm = chamas.find(c => c.id === selectedChamaId);

  const currentUserMembership = selectedChamaForForm?.members.find(m => m.user.id === session?.user?.id);
  const userRoleInChama = currentUserMembership?.role;
  const isPrivilegedUser = userRoleInChama === 'ADMIN' || userRoleInChama === 'TREASURER' || userRoleInChama === 'SECRETARY';
  
  // Update form when selectedChama prop changes
  useEffect(() => {
    if (selectedChama) {
      setSelectedChamaId(selectedChama.id);
      form.setValue('chamaId', selectedChama.id);
      form.setValue('amount', selectedChama.monthlyContribution);
      form.resetField("membershipId");
    }
  }, [selectedChama, form]);

  useEffect(() => {
    if (selectedChamaForForm && !isPrivilegedUser && currentUserMembership) {
      form.setValue('membershipId', currentUserMembership.id);
    }
  }, [selectedChamaForForm, isPrivilegedUser, currentUserMembership, form]);

  function onSubmit(values: FormValues) {
    const { ...contributionData } = values;
    recordContributionMutation.mutate(contributionData, {
      onSuccess: () => {
        router.push("/dashboard/contributions");
      },
    });
  }

  if (!isPrivilegedUser && selectedChamaForForm) {
      return (
        <div className="text-center text-muted-foreground p-8">
            <p>You do not have permission to record manual contributions for this chama.</p>
        </div>
      )
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {!selectedChama && (
          <FormField
            control={form.control}
            name="chamaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chama</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedChamaId(value);
                    form.resetField("membershipId");
                    const chama = chamas.find(c => c.id === value);
                    if (chama) form.setValue('amount', chama.monthlyContribution);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a chama to contribute to" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {chamas.map(chama => (
                      <SelectItem key={chama.id} value={chama.id}>
                        {chama.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedChama && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm font-medium text-muted-foreground mb-1">Recording contribution for:</p>
            <p className="font-semibold">{selectedChama.name}</p>
          </div>
        )}

        {isPrivilegedUser && (
          <FormField
            control={form.control}
            name="membershipId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Member</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedChamaForForm}
                >
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a member to record payment for" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {selectedChamaForForm?.members.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                            {m.user.firstName} {m.user.lastName}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem>
                <FormLabel>Amount (KSH)</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />

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

        <FormField control={form.control} name="paymentMethod" render={({ field }) => (
            <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Bank">Bank Transfer</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
        )} />

        <FormField control={form.control} name="paidAt" render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date of Payment</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="w-full" disabled={recordContributionMutation.isPending}>
          {recordContributionMutation.isPending ? "Recording Payment..." : "Record Contribution"}
        </Button>
        
      </form>
    </Form>
  );
}