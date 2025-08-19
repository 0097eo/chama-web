"use client";

import { useGetContributionsReport } from "@/hooks/useReports";
import { Skeleton } from "@/components/ui/skeleton";
import { ContributionTable } from "@/components/contributions/ContributionTable";
import { useChamaContext } from "@/context/ChamaContext";
import { useReportsContext } from "@/context/ReportsContext";

export default function ContributionsReportPage() {
    const { activeChama } = useChamaContext();
    const { dateRange } = useReportsContext();

    const { data: report, isLoading } = useGetContributionsReport(activeChama?.id, dateRange);
    const contributions = report?.data;


    if (!activeChama) {
        return <div className="text-center text-muted-foreground py-12">Please select a chama to view the report.</div>;
    }
    if (isLoading) {
        return <Skeleton className="h-96 w-full" />;
    }

    return (
        <div>
            {contributions && contributions.length > 0 ? (
                <ContributionTable contributions={contributions} />
            ) : (
                <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                    <p>No contributions found for the selected period.</p>
                </div>
            )}
        </div>
    );
}
