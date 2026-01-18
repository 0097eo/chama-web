"use client";

import { useGetFileById } from "@/hooks/useFiles";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, File as FileIcon, Calendar, User, Tag, HardDrive } from "lucide-react";
import Link from "next/link";
import { use } from "react";

// Helper to format file size
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};


export default function FileDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: file, isLoading } = useGetFileById(id);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    if (!file) {
        return <p className="text-center py-12">File not found.</p>;
    }
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <FileIcon className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">{file.filename}</h1>
                    <p className="text-muted-foreground">
                        Uploaded by {file.uploader ? `${file.uploader.firstName} ${file.uploader.lastName}` : 'an unknown user'}
                    </p>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>File Details</CardTitle>
                    <CardDescription>Metadata for the uploaded file.</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-6 text-sm">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">{format(new Date(file.uploadedAt), 'PPPP p')}</p>
                            <p className="text-muted-foreground">Upload Date</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <HardDrive className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">{formatBytes(file.size)}</p>
                            <p className="text-muted-foreground">File Size</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Tag className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">{file.category}</p>
                            <p className="text-muted-foreground">Category</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">{file.uploader ? `${file.uploader.firstName} ${file.uploader.lastName}` : 'N/A'}</p>
                            <p className="text-muted-foreground">Uploader</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4">
                <Button asChild>
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Download File
                    </a>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/files">Back to Library</Link>
                </Button>
            </div>
        </div>
    );
}