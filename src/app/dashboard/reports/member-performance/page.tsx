/* eslint-disable react/no-unescaped-entities */
"use client";

import { useGetMemberPerformanceReport } from "@/hooks/useReports";
import { Skeleton } from "@/components/ui/skeleton";
import { useChamaContext } from "@/context/ChamaContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProcessedMemberPerformance } from "@/types/api";
import { useMemo } from "react";

export default function MemberPerformancePage() {
    const { activeChama } = useChamaContext();
    const { data: reportData, isLoading } = useGetMemberPerformanceReport(activeChama?.id);

    // Use useMemo to process the raw API data only when it changes
    const processedReport: ProcessedMemberPerformance[] = useMemo(() => {
        if (!reportData) return [];
        
        return reportData.map(member => ({
            membershipId: member.id,
            name: `${member.user.firstName} ${member.user.lastName}`,
            email: member.user.email,
            contributionCount: member._count.contributions,
            loanCount: member._count.loans,
            totalContributions: member.contributions.reduce((sum, c) => sum + c.amount, 0),
            totalLoanPrincipal: member.loans.reduce((sum, l) => sum + l.amount, 0),
            activeLoansCount: member.loans.filter(l => l.status === 'ACTIVE').length,
        }));
    }, [reportData]);

    if (!activeChama) {
        return (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                <p>Please select a chama to view the member performance report.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Member Performance Report</CardTitle>
                <CardDescription>
                    An overview of each member's financial activity in {activeChama.name}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {processedReport && processedReport.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead className="text-right">Total Contributed</TableHead>
                                <TableHead className="text-right">No. of Contributions</TableHead>
                                <TableHead className="text-right">Total Loaned</TableHead>
                                <TableHead className="text-right">No. of Loans</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processedReport.map((member) => (
                                <TableRow key={member.membershipId}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback>
                                                    {member.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-xs text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">KSH {member.totalContributions.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{member.contributionCount}</TableCell>
                                    <TableCell className="text-right">KSH {member.totalLoanPrincipal.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{member.loanCount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                        <p>No member activity found for this chama.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}