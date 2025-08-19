"use client";

import { LoanApplicationForm } from "@/components/loans/LoanApplicationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetChamas } from "@/hooks/useChamas";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApplyLoanPage() {
    const { data: chamas, isLoading } = useGetChamas();

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Loan Application</CardTitle>
                <CardDescription>Fill out the details below to apply for a new loan.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <Skeleton className="h-64" />}
                {chamas && <LoanApplicationForm chamas={chamas} />}
            </CardContent>
        </Card>
    );
}