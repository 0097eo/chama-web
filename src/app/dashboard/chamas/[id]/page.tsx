"use client";

import { use } from "react";
import { useGetChamaById } from "@/hooks/useChamas";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Calendar, DollarSign, Info, Crown, Shield, User, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MembershipRole } from "@/types/api";

const getRoleIcon = (role: MembershipRole) => {
  switch (role) {
    case 'ADMIN':
      return <Crown className="h-3 w-3" />;
    case 'TREASURER':
      return <DollarSign className="h-3 w-3" />;
    case 'SECRETARY':
      return <Shield className="h-3 w-3" />;
    default:
      return <User className="h-3 w-3" />;
  }
};

const getRoleBadgeVariant = (role: MembershipRole) => {
  switch (role) {
    case 'ADMIN':
      return 'destructive';
    case 'TREASURER':
      return 'secondary';
    case 'SECRETARY':
      return 'outline';
    default:
      return 'default';
  }
};

export default function ChamaDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const { data: chama, isLoading } = useGetChamaById(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!chama) return null;

  const activeMembers = chama.members?.filter(member => member.isActive) || [];
  const inactiveMembers = chama.members?.filter(member => !member.isActive) || [];

  return (
    <div className="space-y-6">
      <StatsCards chamaId={chama.id} />
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Chama Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{chama.name}</p>
            </div>
            
            {chama.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{chama.description}</p>
              </div>
            )}
            
            <Separator />
            
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Monthly Contribution
                </span>
                <span className="font-semibold">KSH {chama.monthlyContribution.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Meeting Day
                </span>
                <span className="font-medium">{chama.meetingDay}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Members
                </span>
                <span className="font-semibold">{chama.totalMembers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Member Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membership Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  Active Members
                </span>
                <Badge variant="secondary">{activeMembers.length}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  Inactive Members
                </span>
                <Badge variant="outline">{inactiveMembers.length}</Badge>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Member Roles</p>
              <div className="space-y-2">
                {['ADMIN', 'TREASURER', 'SECRETARY', 'MEMBER'].map(role => {
                  const count = activeMembers.filter(m => m.role === role).length;
                  return (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        {getRoleIcon(role as MembershipRole)}
                        {role.charAt(0) + role.slice(1).toLowerCase()}
                      </span>
                      <Badge variant={getRoleBadgeVariant(role as MembershipRole)}>
                        {count}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Members List */}
      {activeMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Members ({activeMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {`${member.user.firstName[0]}${member.user.lastName[0]}`}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {`${member.user.firstName} ${member.user.lastName}`}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {member.user.email}
                    </p>
                  </div>
                  <Badge variant={getRoleBadgeVariant(member.role)} className="shrink-0">
                    <span className="flex items-center gap-1">
                      {getRoleIcon(member.role)}
                      {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                    </span>
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inactive Members List (if any) */}
      {inactiveMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">
              Inactive Members ({inactiveMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inactiveMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 border rounded-lg opacity-60"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {`${member.user.firstName[0]}${member.user.lastName[0]}`}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {`${member.user.firstName} ${member.user.lastName}`}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {member.user.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    Inactive
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}