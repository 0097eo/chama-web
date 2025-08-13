"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// TODO This would be a hook that calls your API: `GET /api/audit/chama/:chamaId`
const useRecentActivity = (chamaId: string) => {
  // TODO Replace with a real Tanstack Query hook
  return {
    data: [
        { actor: "John D.", action: "LOAN_APPROVE", target: "Jane S.", timestamp: "2 hours ago" },
        { actor: "Jane S.", action: "CONTRIBUTION_CREATE", target: null, timestamp: "5 hours ago" },
        { actor: "Admin U.", action: "MEETING_SCHEDULE", target: null, timestamp: "1 day ago" },
    ],
    isLoading: false,
  }
}

export function RecentActivity({ chamaId }: { chamaId: string }) {
  const { data: activities, isLoading } = useRecentActivity(chamaId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A log of recent actions within your chama.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading &&
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        {!isLoading &&
          activities?.map((activity, i) => (
            <div key={i} className="flex items-center gap-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{activity.actor.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  {activity.actor} performed action: <span className="font-bold">{activity.action}</span>
                  {activity.target && ` on ${activity.target}`}
                </p>
                <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}