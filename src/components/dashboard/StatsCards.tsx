"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Users, PiggyBank, HandCoins } from "lucide-react";

// TODO This would be a hook that calls your API: `GET /api/chamas/:chamaId/dashboard`
// For now, we'll use mock data and a loading state.
const useChamaDashboard = (chamaId: string) => {
  // TODO  Replace with a real Tanstack Query hook
  return {
    data: {
        totalContributionsThisYear: 125000,
        activeLoansCount: 3,
        totalLoanAmountActive: 45000,
        totalMembers: 12,
    },
    isLoading: false,
  }
}

export function StatsCards({ chamaId }: { chamaId: string }) {
  const { data, isLoading } = useChamaDashboard(chamaId);

  const stats = [
    { title: "Total Contributions (Year)", value: `KSH ${data?.totalContributionsThisYear.toLocaleString()}`, icon: PiggyBank },
    { title: "Active Loans", value: data?.activeLoansCount, icon: HandCoins },
    { title: "Loan Principal Out", value: `KSH ${data?.totalLoanAmountActive.toLocaleString()}`, icon: DollarSign },
    { title: "Total Members", value: data?.totalMembers, icon: Users },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}