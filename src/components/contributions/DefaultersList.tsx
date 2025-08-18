"use client";

import { Membership } from "@/types/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { MessageSquareWarning, Phone } from "lucide-react";
import { useSendContributionReminder } from "@/hooks/useNotifications";
import { useGetDefaulters } from "@/hooks/useContributions";

export function DefaultersList({ chamaId }: { chamaId: string }) {
    const { data: defaulters, isLoading } = useGetDefaulters(chamaId);
    
    // Initialize the mutation hook
    const sendReminderMutation = useSendContributionReminder();

    const handleSendReminder = (member: Membership['user']) => {
        sendReminderMutation.mutate({
            chamaId,
            userId: member.id,
            memberName: member.firstName,
            phoneNumber: member.phone,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquareWarning className="h-5 w-5 text-amber-500" />
                    Outstanding Contributions (This Month)
                </CardTitle>
                <CardDescription>
                    The following members have not yet recorded their contribution for the current month.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="space-y-4">
                        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                )}
                {!isLoading && defaulters && defaulters.length > 0 && (
                    <div className="space-y-3">
                        {defaulters.map(membership => (
                            <div key={membership.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>
                                            {membership.user.firstName[0]}{membership.user.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{membership.user.firstName} {membership.user.lastName}</p>
                                        <p className="text-sm text-muted-foreground">{membership.user.email}</p>
                                    </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendReminder(membership.user)}
                                  disabled={sendReminderMutation.isPending && sendReminderMutation.variables?.userId === membership.user.id}
                                >
                                  <Phone className="mr-2 h-4 w-4" />
                                  {sendReminderMutation.isPending && sendReminderMutation.variables?.userId === membership.user.id
                                    ? "Sending..."
                                    : "Send Reminder"}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && (!defaulters || defaulters.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">
                        All members are up to date with their contributions for this month!
                    </p>
                )}
            </CardContent>
        </Card>
    );
}