/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { useGetChamaFiles, useDeleteFile } from "@/hooks/useFiles";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { File as FileIcon, Upload, Trash2 } from "lucide-react";
import { useChamaContext } from "@/context/ChamaContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUploadForm } from "@/components/files/FileUploadForm";
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Link from "next/link";
import { ChamaSelector } from "@/components/chamas/ChamaSelector";

export default function FilesPage() {
    const { chamas, activeChama, setActiveChamaId, isPrivileged, isLoading: isChamaLoading } = useChamaContext();
    const { data: files, isLoading: areFilesLoading } = useGetChamaFiles(activeChama?.id);
    const deleteFileMutation = useDeleteFile();
    
    const [isUploadOpen, setUploadOpen] = useState(false);

    const handleDelete = (fileId: string) => {
        if (!activeChama) return;
        deleteFileMutation.mutate({ fileId, chamaId: activeChama.id });
    };

    const isLoading = isChamaLoading || (activeChama && areFilesLoading);

    if (isChamaLoading) {
        return <Skeleton className="h-96 w-full" />
    }

    if (!chamas || chamas.length === 0) {
        return (
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>No Chamas Found</AlertTitle>
                <AlertDescription>
                    You must be a member of a chama to manage files. 
                    <Link href="/dashboard/chamas/create" className="underline ml-1">Create one</Link>.
                </AlertDescription>
            </Alert>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">File Library</h1>
                    <p className="text-muted-foreground">Manage and share documents for your chama.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
                    <ChamaSelector
                        chamas={chamas}
                        selectedChamaId={activeChama?.id || null}
                        onSelectChama={setActiveChamaId}
                        className="w-full sm:w-[250px]"
                    />
                    <Dialog open={isUploadOpen} onOpenChange={setUploadOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto"><Upload className="mr-2 h-4 w-4" /> Upload File</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Upload a New File to {activeChama?.name}</DialogTitle></DialogHeader>
                            {activeChama && <FileUploadForm chamaId={activeChama.id} onSuccess={() => setUploadOpen(false)} />}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Files for {activeChama?.name}</CardTitle>
                    <CardDescription>A central repository for all chama-related documents.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <Skeleton className="h-64 w-full" />}
                    {!isLoading && files && (
                        <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Filename</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Uploaded At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {files.length > 0 ? files.map(file => (
                                    <TableRow key={file.id}>
                                        <TableCell className="font-medium">
                                            <Link href={`/dashboard/files/${file.id}`} className="flex items-center gap-2 hover:underline">
                                                <FileIcon className="h-4 w-4" /> {file.filename}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{file.category}</TableCell>
                                        <TableCell>{format(new Date(file.uploadedAt), 'PPP')}</TableCell>
                                        <TableCell className="text-right">
                                            {isPrivileged && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete the file '{file.filename}'. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(file.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24">No files have been uploaded for this chama yet.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}