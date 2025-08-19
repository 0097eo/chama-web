"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, File as FileIcon, FileText } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { DateRange } from "react-day-picker";
import { AxiosError } from "axios";

interface ExportButtonProps {
    chamaId: string;
    reportType: string;
    dateRange?: DateRange;
}

const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
};

export function ExportButton({ chamaId, reportType, dateRange }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'pdf' | 'excel') => {
        setIsExporting(true);
        try {
            const response = await api.post(`/reports/export/${chamaId}`, {
                reportType,
                format,
                startDate: dateRange?.from,
                endDate: dateRange?.to,
            }, {
                responseType: 'blob',
            });

            const extension = format === 'excel' ? 'csv' : 'pdf';
            const filename = `${reportType}-report-${new Date().toISOString()}.${extension}`;
            downloadFile(response.data, filename);
            toast.success("Report export started!");

        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("Export failed:", axiosError.message);
            toast.error("Failed to export report.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting} className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? "Exporting..." : "Export"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as Excel (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <FileIcon className="mr-2 h-4 w-4" />
                    Export as PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}