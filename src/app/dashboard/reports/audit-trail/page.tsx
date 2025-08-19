"use client";

import { useState } from "react";
import { useGetAuditTrailReport } from "@/hooks/useReports";
import { Skeleton } from "@/components/ui/skeleton";
import { useChamaContext } from "@/context/ChamaContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { formatActivityLog } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AuditTrailPage() {
    const { activeChama } = useChamaContext();
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data: report, isLoading } = useGetAuditTrailReport(activeChama?.id, page, limit);
    
    const auditLogs = report?.data;
    const totalPages = report?.meta.totalPages || 1;

    if (!activeChama) {
        return (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                <p>Please select a chama to view the audit trail.</p>
            </div>
        );
    }

    if (isLoading && page === 1) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-96 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Chama Audit Trail</CardTitle>
                <CardDescription>
                    A detailed log of all significant actions performed in {activeChama.name}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {auditLogs && auditLogs.length > 0 ? (
                                auditLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(log.createdAt), 'PPpp')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{log.action}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {formatActivityLog(log)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        No audit logs found for this chama.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages || isLoading}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}