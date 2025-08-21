"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useScheduleMeeting } from "@/hooks/useMeetings";
import { useChamaContext } from "@/context/ChamaContext";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ChamaSelector } from "@/components/chamas/ChamaSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  title: z.string().min(3, "Title is too short."),
  agenda: z.string().min(10, "Please provide a brief agenda."),
  location: z.string().min(3, "Location is required."),
  scheduledFor: z.date({
    invalid_type_error: "Please select a valid date",
  }).refine((date) => date > new Date(), {
    message: "Meeting date must be in the future",
  }),
  time: z.string().min(1, "Please select a time"),
});

type FormValues = z.infer<typeof formSchema>;

// Generate time options
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const display = format(new Date(2000, 0, 1, hour, minute), 'h:mm a');
      times.push({ value: time, display });
    }
  }
  return times;
};

export default function CreateMeetingPage() {
    const router = useRouter();
    const timeOptions = generateTimeOptions();

    const { chamas, activeChama, setActiveChamaId, isPrivileged, isLoading } = useChamaContext();
    const scheduleMeetingMutation = useScheduleMeeting();

    const form = useForm<FormValues>({ 
        resolver: zodResolver(formSchema),
        defaultValues: {
            scheduledFor: new Date(),
            time: "09:00",
        }
    });

    const onSubmit = (values: FormValues) => {
        if (!activeChama) return;
        
        // Combine date and time
        const [hours, minutes] = values.time.split(':').map(Number);
        const scheduledDateTime = new Date(values.scheduledFor);
        scheduledDateTime.setHours(hours, minutes, 0, 0);
        
        const meetingData = {
            chamaId: activeChama.id,
            title: values.title,
            agenda: values.agenda,
            location: values.location,
            scheduledFor: scheduledDateTime.toISOString(),
        };
        
        scheduleMeetingMutation.mutate(meetingData, {
            onSuccess: () => router.push('/dashboard/meetings')
        });
    };

    if (isLoading) {
        return <Skeleton className="max-w-2xl mx-auto h-96" />;
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Schedule New Meeting</CardTitle>
                <CardDescription>
                    Select a chama and fill in the details to schedule a new meeting.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-medium mb-2 block">For Chama</label>
                        <ChamaSelector
                            chamas={chamas}
                            selectedChamaId={activeChama?.id || null}
                            onSelectChama={setActiveChamaId}
                        />
                    </div>

                    {activeChama && isPrivileged ? (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border-t pt-6">
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
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="scheduledFor" render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date</FormLabel>
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
                                                                format(field.value, "PPP")
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
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>

                                    <FormField control={form.control} name="time" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Time</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <div className="flex items-center">
                                                            <ClockIcon className="mr-2 h-4 w-4 opacity-50" />
                                                            <SelectValue placeholder="Select time" />
                                                        </div>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {timeOptions.map((time) => (
                                                        <SelectItem key={time.value} value={time.value}>
                                                            {time.display}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                
                                <Button type="submit" className="w-full" disabled={scheduleMeetingMutation.isPending}>
                                    {scheduleMeetingMutation.isPending ? "Scheduling..." : "Schedule Meeting"}
                                </Button>
                            </form>
                        </Form>
                    ) : (
                        <div className="text-center text-muted-foreground pt-8">
                           {activeChama ? (
                               <p>You do not have permission to schedule meetings for this chama.</p>
                           ) : (
                               <p>Please select a chama to continue.</p>
                           )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}