"use client";

import { use } from "react";
import { useGetChamaById } from "@/hooks/useChamas";
import { Skeleton } from "@/components/ui/skeleton";
import { ChamaSettingsForm } from "@/components/chamas/ChamaSettingsForm";

// This is the dedicated "Settings" page.
export default function SettingsPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = use(params);
  const { data: chama, isLoading } = useGetChamaById(id);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!chama) return null; // The layout handles the not found case.

  return (
    <div>
      <ChamaSettingsForm chama={chama} />
    </div>
  );
}