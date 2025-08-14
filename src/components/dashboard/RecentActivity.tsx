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
import { formatDistanceToNow } from 'date-fns';
import { formatActivityLog } from "@/lib/formatters";
import { useGetRecentActivity } from "@/hooks/useAudit";





export function RecentActivity({ chamaId }: { chamaId: string }) {
  const { data: activities, isLoading } = useGetRecentActivity(chamaId);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A log of the 5 most recent actions in your chama.</CardDescription>
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

        {!isLoading && activities && activities.length > 0 &&
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {activity.user.firstName?.charAt(0).toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  {formatActivityLog(activity)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}

        {!isLoading && (!activities || activities.length === 0) && (
            <p className="text-sm text-muted-foreground">No recent activity found.</p>
        )}
      </CardContent>
    </Card>
  );
}