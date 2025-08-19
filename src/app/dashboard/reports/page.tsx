"use client";

import { useGetFinancialSummary } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FinancialChart } from "@/components/reports/FinancialChart";
import { useChamaContext } from "@/context/ChamaContext";
import { DateRange } from "react-day-picker";

export default function ReportsOverviewPage() {
  const { activeChama } = useChamaContext();
  const { data: summary, isLoading } = useGetFinancialSummary(activeChama?.id);

  if (!activeChama) {
      return (
          <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
              <p>Please select a chama to view its financial summary.</p>
          </div>
      );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!summary) return <p>No summary data available.</p>;

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader><CardTitle className="text-sm font-medium">Total Contributions</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">KSH {summary.totalContributions.toLocaleString()}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm font-medium">Loans Disbursed</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">KSH {summary.totalLoansDisbursed.toLocaleString()}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm font-medium">Outstanding Loans</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">KSH {summary.outstandingLoanPrincipal.toLocaleString()}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm font-medium">Net Position</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">KSH {summary.netPosition.toLocaleString()}</p></CardContent></Card>
        </div>
        <FinancialChart chamaId={activeChama.id} dateRange={{} as DateRange} />
    </div>
  );
}