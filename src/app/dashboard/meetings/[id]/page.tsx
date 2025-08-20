"use client";

import { use, useState } from "react";
import { useGetMeetingById } from "@/hooks/useMeetings";
import { Skeleton } from "@/components/ui/skeleton";
import { MeetingMinutes } from "@/components/meetings/MeetingMinutes";
import { AttendanceTracker } from "@/components/meetings/AttendanceTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Edit, XCircle } from "lucide-react";
import { useChamaContext } from "@/context/ChamaContext";
import { useCancelMeeting } from "@/hooks/useMeetings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UpdateMeetingForm } from "@/components/meetings/UpdateMeetingForm";
import { useRouter } from "next/navigation";

export default function MeetingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isUpdateOpen, setUpdateOpen] = useState(false);
    const { data: meeting, isLoading } = useGetMeetingById(id);
    const { isPrivileged } = useChamaContext();
    const cancelMeetingMutation = useCancelMeeting();

    const handleCancel = () => {
        cancelMeetingMutation.mutate(id, {
            onSuccess: () => {
                router.push('/dashboard/meetings');
            }
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-48 w-full" />
                <div className="grid lg:grid-cols-2 gap-8">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }
    
    if (!meeting) return <p className="text-center py-12">Meeting not found.</p>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div>
                    <Badge variant={meeting.status === 'COMPLETED' ? 'outline' : 'default'}>
                        {meeting.status}
                    </Badge>
                    <h1 className="text-3xl font-bold mt-2">{meeting.title}</h1>
                    <p className="text-muted-foreground">
                        Agenda: {meeting.agenda}
                    </p>
                </div>

                {isPrivileged && meeting.status === 'SCHEDULED' && (
                    <div className="flex gap-2">
                        <Dialog open={isUpdateOpen} onOpenChange={setUpdateOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Edit className="mr-2 h-4 w-4" /> Edit Meeting
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Update Meeting Details</DialogTitle>
                                </DialogHeader>
                                <UpdateMeetingForm meeting={meeting} onSuccess={() => setUpdateOpen(false)} />
                            </DialogContent>
                        </Dialog>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <XCircle className="mr-2 h-4 w-4" /> Cancel Meeting
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will cancel the meeting. Members will be notified. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={handleCancel} 
                                        className="bg-destructive hover:bg-destructive/90"
                                    >
                                        Confirm Cancellation
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Meeting Details</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5" />
                        <div>
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-semibold">
                                {format(new Date(meeting.scheduledFor), 'eeee, MMMM do, yyyy')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5" />
                        <div>
                            <p className="text-muted-foreground">Time</p>
                            <p className="font-semibold">
                                {format(new Date(meeting.scheduledFor), 'p')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5" />
                        <div>
                            <p className="text-muted-foreground">Location</p>
                            <p className="font-semibold">{meeting.location}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <div className="grid lg:grid-cols-2 gap-8 items-start">
                <AttendanceTracker meetingId={meeting.id} />
                <MeetingMinutes 
                    meetingId={meeting.id} 
                    initialContent={meeting.minutes} 
                    isPrivileged={isPrivileged} 
                />
            </div>
        </div>
    );
}