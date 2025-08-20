import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Meeting } from "@/types/api";
import { format } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "../ui/badge";

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle>{meeting.title}</CardTitle>
            <Badge variant={meeting.status === 'COMPLETED' ? 'outline' : 'default'}>{meeting.status}</Badge>
        </div>
        <CardDescription>Scheduled for {format(new Date(meeting.scheduledFor), 'PPP p')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{meeting.location}</span></div>
        <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{format(new Date(meeting.scheduledFor), 'eeee, MMMM do')}</span></div>
        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{format(new Date(meeting.scheduledFor), 'h:mm a')}</span></div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/meetings/${meeting.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
