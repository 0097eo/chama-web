/* eslint-disable react/no-unescaped-entities */
"use client";

import { useGetLoanPortfolioReport } from "@/hooks/useReports";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useChamaContext } from "@/context/ChamaContext";
import { Badge } from "@/components/ui/badge";
import { DollarSign, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";

export default function LoanPortfolioPage() {
    const { activeChama } = useChamaContext();
    const { data: portfolio, isLoading } = useGetLoanPortfolioReport(activeChama?.id);

    if (!activeChama) {
        return (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Please select a chama to view the loan portfolio report.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }

    if (!portfolio || portfolio.totalPrincipalDisbursed === 0) {
        return (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Loan Data Available</h3>
                <p>No loan data available to generate a portfolio report for this chama.</p>
            </div>
        );
    }
    

    const repaymentProgress = portfolio.totalPrincipalDisbursed > 0 
        ? (portfolio.totalRepayments / portfolio.totalPrincipalDisbursed) * 100 
        : 0;
    
    const outstandingAmount = portfolio.totalPrincipalDisbursed - portfolio.totalRepayments;
    const totalLoans = portfolio.statusBreakdown.reduce((sum, item) => sum + item.count, 0);
    

    const statusConfig: Record<string, {
        label: string;
        color: string;
        badgeVariant: "default" | "secondary" | "destructive" | "outline";
        icon: React.ComponentType<{ className?: string }>;
        description: string;
    }> = {
        PENDING: {
            label: "Pending",
            color: "bg-yellow-500",
            badgeVariant: "outline",
            icon: Clock,
            description: "Loans awaiting approval"
        },
        APPROVED: { 
            label: "Approved", 
            color: "bg-blue-500", 
            badgeVariant: "secondary", 
            icon: FileText,
            description: "Loans approved but not yet disbursed"
        },
        REJECTED: {
            label: "Rejected",
            color: "bg-red-500",
            badgeVariant: "destructive",
            icon: AlertCircle,
            description: "Loans that were rejected"
        },
        ACTIVE: { 
            label: "Active", 
            color: "bg-orange-500", 
            badgeVariant: "destructive", 
            icon: Clock,
            description: "Loans currently being repaid"
        },
        PAID: { 
            label: "Paid", 
            color: "bg-green-500", 
            badgeVariant: "default", 
            icon: CheckCircle,
            description: "Fully repaid loans"
        },
        DEFAULTED: {
            label: "Defaulted",
            color: "bg-red-600",
            badgeVariant: "destructive",
            icon: AlertCircle,
            description: "Loans in default"
        }
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Disbursed</p>
                                <p className="text-2xl font-bold">KSH {portfolio.totalPrincipalDisbursed.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Repayments</p>
                                <p className="text-2xl font-bold">KSH {portfolio.totalRepayments.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                                <p className="text-2xl font-bold">KSH {outstandingAmount.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Loans</p>
                                <p className="text-2xl font-bold">{totalLoans}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Portfolio Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Portfolio Performance
                        </CardTitle>
                        <CardDescription>
                            Overall financial performance of {activeChama.name}'s loan portfolio
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Principal Disbursed</span>
                                <span className="font-semibold">KSH {portfolio.totalPrincipalDisbursed.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Repayments Received</span>
                                <span className="font-semibold text-green-600">KSH {portfolio.totalRepayments.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Outstanding Balance</span>
                                <span className="font-semibold text-orange-600">KSH {outstandingAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Repayment Progress</span>
                                <span className="text-sm font-semibold">{repaymentProgress.toFixed(1)}%</span>
                            </div>
                            <Progress value={repaymentProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                {repaymentProgress >= 80 ? "Excellent repayment performance" : 
                                 repaymentProgress >= 60 ? "Good repayment performance" :
                                 repaymentProgress >= 40 ? "Moderate repayment performance" :
                                 "Needs attention"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Loan Status Distribution
                        </CardTitle>
                        <CardDescription>
                            Breakdown of loans by current status
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {portfolio.statusBreakdown.map(item => {
                            const config = statusConfig[item.status] || { 
                                label: item.status, 
                                color: "bg-gray-500", 
                                badgeVariant: "secondary",
                                icon: AlertCircle,
                                description: ""
                            };
                            const Icon = config.icon;
                            const percentage = totalLoans > 0 ? (item.count / totalLoans * 100).toFixed(1) : "0";

                            return (
                                <div key={item.status} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-3 w-3 rounded-full ${config.color}`}></div>
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" />
                                                <span className="font-medium">{config.label}</span>
                                                <Badge variant={config.badgeVariant} className="text-xs">
                                                    {item.count}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">KSH {item.totalAmount.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">{percentage}% of loans</p>
                                        </div>
                                    </div>
                                    {config.description && (
                                        <p className="text-xs text-muted-foreground ml-6">{config.description}</p>
                                    )}
                                    <div className="ml-6">
                                        <Progress 
                                            value={parseFloat(percentage)} 
                                            className="h-1"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        
                        <div className="pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Total Portfolio</span>
                                <div className="text-right">
                                    <p className="font-semibold">KSH {portfolio.totalPrincipalDisbursed.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">{totalLoans} loans</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}