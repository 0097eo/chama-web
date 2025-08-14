/* eslint-disable react/no-unescaped-entities */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAddMember } from "@/hooks/useChamas";
import { DialogFooter } from "@/components/ui/dialog";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export function InviteMemberForm({ chamaId, onSuccess }: { chamaId: string; onSuccess?: () => void }) {
  const addMemberMutation = useAddMember();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await addMemberMutation.mutateAsync({ chamaId, email: values.email });
    form.reset();
    onSuccess?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member's Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="newmember@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={addMemberMutation.isPending}>
            {addMemberMutation.isPending ? "Adding Member..." : "Add Member"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}