"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useBroadcastMessage } from "@/hooks/useNotifications";
import { useChamaContext } from "@/context/ChamaContext";
import { Send } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export function BroadcastMessage() {
    const { activeChama } = useChamaContext();
    const broadcastMutation = useBroadcastMessage();
    const form = useForm<FormValues>({ resolver: zodResolver(formSchema) });

    const onSubmit = (values: FormValues) => {
        if (!activeChama) return;
        broadcastMutation.mutate({ chamaId: activeChama.id, ...values }, {
            onSuccess: () => form.reset()
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Send a Broadcast</CardTitle>
                <CardDescription>
                    Send a notification (in-app and SMS) to all active members of {activeChama?.name}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Important Reminder" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="message" render={({ field }) => (
                            <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea placeholder="Your message here..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={!activeChama || broadcastMutation.isPending} className="w-full">
                            {broadcastMutation.isPending ? "Sending..." : <><Send className="mr-2 h-4 w-4" /> Send Broadcast</>}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}