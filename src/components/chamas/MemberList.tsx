"use client";

import { useState } from "react";
import { Membership, MembershipRole } from "@/types/api";
import { useRemoveMember, useUpdateMemberRole } from "@/hooks/useChamas";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Crown, DollarSign, Shield, User, MoreVertical, Trash2, UserCog, PlusCircle } from "lucide-react";
import { InviteMemberForm } from "./InviteMemberForm";

interface MemberListProps {
  chamaId: string;
  members: Membership[];
  canManageMembers?: boolean;
}

const getRoleIcon = (role: MembershipRole) => {
  switch (role) {
    case 'ADMIN': return <Crown className="h-3 w-3" />;
    case 'TREASURER': return <DollarSign className="h-3 w-3" />;
    case 'SECRETARY': return <Shield className="h-3 w-3" />;
    default: return <User className="h-3 w-3" />;
  }
};

const getRoleBadgeVariant = (role: MembershipRole) => {
  switch (role) {
    case 'ADMIN': return 'destructive' as const;
    case 'TREASURER': return 'secondary' as const;
    case 'SECRETARY': return 'outline' as const;
    default: return 'default' as const;
  }
};

export function MemberList({ chamaId, members, canManageMembers = false }: MemberListProps) {
  const [memberToRemove, setMemberToRemove] = useState<Membership | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const removeMemberMutation = useRemoveMember();
  const updateRoleMutation = useUpdateMemberRole();

  const activeMembers = members.filter(member => member.isActive);
  const inactiveMembers = members.filter(member => !member.isActive);

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    await removeMemberMutation.mutateAsync({
      chamaId,
      userId: memberToRemove.user.id
    });
    setIsRemoveDialogOpen(false);
    setMemberToRemove(null);
  };

  const handleRoleChange = async (userId: string, newRole: MembershipRole) => {
    await updateRoleMutation.mutateAsync({
      chamaId,
      userId,
      role: newRole
    });
  };

  const openRemoveDialog = (member: Membership) => {
    setMemberToRemove(member);
    setIsRemoveDialogOpen(true);
  };

  const renderMemberCard = (member: Membership) => (
    <div
      key={member.id}
      className={`flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${!member.isActive ? 'opacity-60' : ''}`}
    >
      <Avatar className="h-12 w-12">
        <AvatarFallback>{`${member.user.firstName[0]}${member.user.lastName[0]}`}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{`${member.user.firstName} ${member.user.lastName}`}</p>
        <p className="text-sm text-muted-foreground truncate">{member.user.email}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
            <span className="flex items-center gap-1">
              {getRoleIcon(member.role)}
              {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
            </span>
          </Badge>
          {!member.isActive && (<Badge variant="outline" className="text-xs">Inactive</Badge>)}
        </div>
      </div>

      {canManageMembers && member.isActive && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Change Role</DropdownMenuLabel>
            {(['ADMIN', 'TREASURER', 'SECRETARY', 'MEMBER'] as MembershipRole[]).filter(role => role !== member.role).map(role => (
              <DropdownMenuItem key={role} onClick={() => handleRoleChange(member.user.id, role)} disabled={updateRoleMutation.isPending} className="flex items-center gap-2">
                {getRoleIcon(role)}
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openRemoveDialog(member)} disabled={removeMemberMutation.isPending} className="text-red-600 focus:text-red-600 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Remove Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Active Members ({activeMembers.length})
              </CardTitle>
              {canManageMembers && (
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Invite a New Member</DialogTitle>
                    </DialogHeader>
                    <InviteMemberForm chamaId={chamaId} onSuccess={() => setIsInviteDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeMembers.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">{activeMembers.map(renderMemberCard)}</div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No active members found.</p>
            )}
          </CardContent>
        </Card>

        {inactiveMembers.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-muted-foreground">Inactive Members ({inactiveMembers.length})</CardTitle></CardHeader>
            <CardContent><div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">{inactiveMembers.map(renderMemberCard)}</div></CardContent>
          </Card>
        )}
      </div>

      {/* Remove Member Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <strong>{memberToRemove && `${memberToRemove.user.firstName} ${memberToRemove.user.lastName}`}</strong>{' '}
              from this chama? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} disabled={removeMemberMutation.isPending} className="bg-red-600 hover:bg-red-700">
              {removeMemberMutation.isPending ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}