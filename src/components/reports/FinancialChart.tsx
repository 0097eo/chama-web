"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { DateRange } from "react-day-picker";
import { Skeleton } from "../ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { useGetCashflowReport } from "@/hooks/useReports";

interface TooltipPayload {
    dataKey: string;
    value: number;
    color: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
                <p className="text-sm font-medium mb-2">{label}</p>
                {payload.map((entry: TooltipPayload, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="font-medium">{entry.dataKey}:</span>
                        <span className="text-muted-foreground">
                            KSH {entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
                <div className="border-t border-border mt-2 pt-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <span>Net Flow:</span>
                        <span className={`${payload[0].value - payload[1].value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            KSH {(payload[0].value - payload[1].value).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export function FinancialChart({ chamaId, dateRange }: { chamaId: string, dateRange?: DateRange }) {
    const { data, isLoading, error } = useGetCashflowReport(chamaId, dateRange);

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toString();
    };

    const chartData = [
        { name: "Cash Flow", Inflows: data?.totalInflows || 0, Outflows: data?.totalOutflows || 0 }
    ];

    const netFlow = (data?.totalInflows || 0) - (data?.totalOutflows || 0);
    const hasData = data && (data.totalInflows > 0 || data.totalOutflows > 0);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                        <Skeleton className="h-[300px] w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        Error Loading Data
                    </CardTitle>
                    <CardDescription>
                        Unable to load cash flow data. Please try again later.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!hasData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Cash Flow Summary</CardTitle>
                    <CardDescription>
                        No transactions found for the selected period.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                        No cash flow data available for this period.
                        <br />
                        Try selecting a different date range.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Cash Flow Summary</CardTitle>
                        <CardDescription className="mt-1">
                            Financial overview for the selected period
                        </CardDescription>
                    </div>
                    <Badge 
                        variant={netFlow >= 0 ? "default" : "destructive"}
                        className="text-sm px-3 py-1"
                    >
                        {netFlow >= 0 ? "Positive" : "Negative"} Flow
                    </Badge>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Inflows</p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                    KSH {(data?.totalInflows || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Outflows</p>
                                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                    KSH {(data?.totalOutflows || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-gradient-to-br p-4 rounded-lg border ${
                        netFlow >= 0 
                            ? 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900' 
                            : 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                                netFlow >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20'
                            }`}>
                                <DollarSign className={`h-5 w-5 ${
                                    netFlow >= 0 
                                        ? 'text-blue-600 dark:text-blue-400' 
                                        : 'text-orange-600 dark:text-orange-400'
                                }`} />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Net Flow</p>
                                <p className={`text-xl font-bold ${
                                    netFlow >= 0 
                                        ? 'text-blue-600 dark:text-blue-400' 
                                        : 'text-orange-600 dark:text-orange-400'
                                }`}>
                                    KSH {Math.abs(netFlow).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-gradient-to-br from-muted/20 to-muted/40 p-4 rounded-lg">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart 
                            data={chartData} 
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            barCategoryGap="30%"
                        >
                            <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke="hsl(var(--border))"
                                opacity={0.5}
                            />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fill: 'currentColor', fontSize: 12 }}
                                tickLine={false} 
                                axisLine={false}
                                dy={10}
                                className="text-foreground"
                            />
                            <YAxis 
                                tick={{ fill: 'currentColor', fontSize: 12 }}
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(value) => `KSH ${formatCurrency(value)}`}
                                width={80}
                                className="text-foreground"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                wrapperStyle={{ 
                                    paddingTop: '20px',
                                    fontSize: '14px',
                                    color: 'hsl(var(--foreground))'
                                }}
                            />
                            <Bar 
                                dataKey="Inflows" 
                                fill="#22c55e" 
                                radius={[4, 4, 0, 0]}
                                stroke="#16a34a"
                                strokeWidth={1}
                                className="hover:opacity-80 transition-opacity"
                            />
                            <Bar 
                                dataKey="Outflows" 
                                fill="#ef4444" 
                                radius={[4, 4, 0, 0]}
                                stroke="#dc2626"
                                strokeWidth={1}
                                className="hover:opacity-80 transition-opacity"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}