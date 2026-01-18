"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateMeeting } from "@/hooks/useMeetings";
import { Meeting } from "@/types/api";
import { DialogFooter, DialogDescription } from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  agenda: z.string().min(10, "Please provide a brief agenda."),
  location: z.string().min(3, "Location is required."),
  scheduledFor: z.date().refine((date) => date > new Date(), {
    message: "Meeting date must be in the future.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateMeetingFormProps {
    meeting: Meeting;
    onSuccess: () => void;
}

export function UpdateMeetingForm({ meeting, onSuccess }: UpdateMeetingFormProps) {
    const updateMeetingMutation = useUpdateMeeting();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: meeting.title,
            agenda: meeting.agenda,
            location: meeting.location,
            scheduledFor: new Date(meeting.scheduledFor),
        }
    });

    const onSubmit = (values: FormValues) => {
        const apiPayload = {
            ...values,
            scheduledFor: values.scheduledFor.toISOString(),
        };

        updateMeetingMutation.mutate({ meetingId: meeting.id, data: apiPayload }, {
            onSuccess: () => {
                form.reset();
                onSuccess();
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <DialogDescription>
                    Make changes to the meeting details below. An update notification will be sent to members.
                </DialogDescription>
                
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Meeting Title</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Q4 Financial Review" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                <FormField control={form.control} name="agenda" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Agenda</FormLabel>
                        <FormControl>
                            <Textarea placeholder="List the topics to be discussed." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Community Hall or Zoom Link" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                <FormField control={form.control} name="scheduledFor" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Date and Time</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button 
                                        variant={"outline"} 
                                        className={cn(
                                            "pl-3 text-left font-normal", 
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {field.value ? (
                                            format(field.value, "PPP p") // Format with time
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar 
                                    mode="single" 
                                    selected={field.value} 
                                    onSelect={field.onChange} 
                                    disabled={(date) => date < new Date()} 
                                    initialFocus 
                                />
                                {/* Todo -  proper time picker would be an enhancement here */}
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}/>

                <DialogFooter className="pt-4">
                    <Button type="submit" disabled={updateMeetingMutation.isPending}>
                        {updateMeetingMutation.isPending ? "Saving Changes..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}