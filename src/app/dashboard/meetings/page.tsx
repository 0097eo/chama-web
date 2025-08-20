"use client";

import { useGetChamaMeetings } from "@/hooks/useMeetings";
import { useChamaContext } from "@/context/ChamaContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Terminal } from "lucide-react";
import { MeetingCalendar } from "@/components/meetings/MeetingCalendar";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { ChamaSelector } from "@/components/chamas/ChamaSelector";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MeetingsPage() {

    const { 
        chamas, 
        activeChama, 
        setActiveChamaId,
        isPrivileged,
        isLoading: isChamaLoading 
    } = useChamaContext();
    

    const { data: meetings, isLoading: isMeetingsLoading } = useGetChamaMeetings(activeChama?.id);

    const isLoading = isChamaLoading || (activeChama && isMeetingsLoading);

    if (isLoading) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-[600px] w-full" />
            </div>
        )
    }

    if (!chamas || chamas.length === 0) {
        return (
             <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>No Chamas Found</AlertTitle>
                <AlertDescription>
                    You must be a member of a chama to manage meetings. 
                    <Link href="/dashboard/chamas/create" className="underline ml-1">Create one</Link>.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-8">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Meetings</h1>
                    <p className="text-muted-foreground">
                        View and manage the meeting schedule for your chama.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
                    <ChamaSelector
                        chamas={chamas}
                        selectedChamaId={activeChama?.id || null}
                        onSelectChama={setActiveChamaId}
                        className="w-full sm:w-[250px]"
                    />

                    {isPrivileged && (
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/dashboard/meetings/create">
                                <PlusCircle className="mr-2 h-4 w-4" /> Schedule New Meeting
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
            
            {activeChama ? (
                <>
                    {isMeetingsLoading && <Skeleton className="h-[600px] w-full" />}
                    
                    {meetings && <MeetingCalendar meetings={meetings} />}
                    
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Upcoming Meetings</h2>
                        
                        {isMeetingsLoading && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-52" />)}
                            </div>
                        )}
                        
                        {meetings && meetings.filter(m => m.status === 'SCHEDULED' && new Date(m.scheduledFor) > new Date()).length > 0 ? (
                             meetings.filter(m => m.status === 'SCHEDULED' && new Date(m.scheduledFor) > new Date()).map(meeting => (
                                <MeetingCard key={meeting.id} meeting={meeting} />
                            ))
                        ) : (
                            !isMeetingsLoading && (
                                <p className="text-muted-foreground pt-4">
                                    No upcoming meetings scheduled for {activeChama.name}.
                                </p>
                            )
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                    <p>Please select a chama to view the meeting schedule.</p>
                </div>
            )}
        </div>
    );
}