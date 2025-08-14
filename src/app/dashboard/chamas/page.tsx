"use client";

import { useGetChamas } from "@/hooks/useChamas";
import { ChamaCard } from "@/components/chamas/ChamaCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";

export default function ChamasPage() {
  const { data: chamas, isLoading } = useGetChamas();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Chamas</h1>
        <Button asChild>
          <Link href="/dashboard/chamas/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Chama
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-52" />)}
        </div>
      )}

      {!isLoading && chamas && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chamas.map((chama) => (
            <ChamaCard key={chama.id} chama={chama} />
          ))}
        </div>
      )}

      {!isLoading && chamas?.length === 0 && (
        <p>You are not a member of any chamas yet.</p>
      )}
    </div>
  );
}