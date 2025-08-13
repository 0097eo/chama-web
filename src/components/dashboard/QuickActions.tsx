"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Landmark, HandCoins } from "lucide-react";
import Link from "next/link";

export function QuickActions({ chamaId }: { chamaId: string }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <h2 className="text-lg font-semibold">Quick Actions</h2>
      <div className="flex gap-2">
        <Button asChild>
          <Link href={`/dashboard/contributions/record?chamaId=${chamaId}`}>
            <Landmark className="mr-2 h-4 w-4" /> Record Contribution
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={`/dashboard/loans/apply?chamaId=${chamaId}`}>
            <HandCoins className="mr-2 h-4 w-4" /> Apply for Loan
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={`/dashboard/meetings/schedule?chamaId=${chamaId}`}>
            <PlusCircle className="mr-2 h-4 w-4" /> Schedule Meeting
          </Link>
        </Button>
      </div>
    </div>
  );
}