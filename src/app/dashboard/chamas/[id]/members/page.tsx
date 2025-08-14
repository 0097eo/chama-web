"use client";

import { use } from "react";
import { useGetChamaById } from "@/hooks/useChamas";
import { MemberList } from "@/components/chamas/MemberList";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";


export default function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { data: chama, isLoading } = useGetChamaById(id);

  const currentUserMembership = chama?.members.find(
    (member) => member.user.id === session?.user?.id
  );

  const canManageMembers = 
    currentUserMembership?.role === 'ADMIN' || 
    currentUserMembership?.role === 'SECRETARY';

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!chama) return null; // The layout handles the not found case.

  return (
    <div>
      <MemberList 
        chamaId={chama.id} 
        members={chama.members} 
        canManageMembers={canManageMembers}
      />
    </div>
  );
}