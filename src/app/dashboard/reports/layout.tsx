"use client";

import React from "react";
import { ChamaSelector } from "@/components/chamas/ChamaSelector";
import { DateRangePicker } from "@/components/reports/DateRangePicker";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useChamaContext } from "@/context/ChamaContext";
import { ExportButton } from "@/components/reports/ExportButton";
import { ReportsProvider, useReportsContext } from "@/context/ReportsContext";
import { AccessDenied } from "@/components/layout/AccessDenied";

const navLinks = [
    { href: "/dashboard/reports", label: "Overview", reportType: "financial_summary", roles: ['ADMIN', 'TREASURER', 'SECRETARY'] },
    { href: "/dashboard/reports/contributions", label: "Contributions", reportType: "contributions", roles: ['ADMIN', 'TREASURER', 'SECRETARY'] },
    { href: "/dashboard/reports/loans", label: "Loans", reportType: "loans", roles: ['ADMIN', 'TREASURER', 'SECRETARY'] },
    { href: "/dashboard/reports/member-performance", label: "Member Performance", reportType: "memeber_performance", roles: ['ADMIN', 'TREASURER', 'SECRETARY'] },
    { href: "/dashboard/reports/audit-trail", label: "Audit Trail", reportType: "audit_trail", roles: ['ADMIN'] }
];

function ReportsLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { chamas, activeChama, setActiveChamaId, isLoading, currentUserMembership, resetToDefaultChama } = useChamaContext();
    const { dateRange, setDateRange } = useReportsContext();

    const activeReport = navLinks.find(link => link.href === pathname);
    
    const userRole = currentUserMembership?.role;
    const requiredRoles = activeReport?.roles || [];
    const hasPermission = userRole && requiredRoles.includes(userRole);


    if (isLoading) {
        return <Skeleton className="h-screen w-full" />;
    }
    

    if (activeChama && !hasPermission) {
        return <AccessDenied requiredRoles={requiredRoles} onReturn={resetToDefaultChama} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Financial Reports</h1>
                    <p className="text-muted-foreground">Analyze the financial performance of your selected chama.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                    {chamas && (
                        <ChamaSelector
                            chamas={chamas}
                            selectedChamaId={activeChama?.id || null}
                            onSelectChama={setActiveChamaId}
                            className="w-full sm:w-[250px]"
                        />
                    )}
                    {activeChama && activeReport && hasPermission && pathname === "/dashboard/reports/contributions" && (
                        <ExportButton
                            chamaId={activeChama.id}
                            reportType={activeReport.reportType}
                            dateRange={dateRange}
                        />
                    )}
                </div>
            </div>
            <nav className="flex items-center space-x-2 border-b">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn("px-3 py-2 text-sm font-medium rounded-t-md border-b-2",
                            pathname === link.href ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-primary"
                        )}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
            <div>{children}</div>
        </div>
    );
}

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
    return (
        <ReportsProvider>
            <ReportsLayoutContent>{children}</ReportsLayoutContent>
        </ReportsProvider>
    )
}