"use client";

import { useState, useEffect } from "react";
import { useGetChamaContributions } from "@/hooks/useContributions";
import { ContributionTable } from "@/components/contributions/ContributionTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Upload, Download, Terminal } from "lucide-react"; // Import new icons
import { useGetChamas } from "@/hooks/useChamas";
import { ChamaSelector } from "@/components/chamas/ChamaSelector";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DefaultersList } from "@/components/contributions/DefaultersList";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Import Dialog components
import { BulkImportForm } from "@/components/contributions/BulkImportForm"; // Import the new form
import toast from "react-hot-toast";

export default function ContributionsHistoryPage() {
  const { data: session } = useSession();
  const [activeChamaId, setActiveChamaId] = useState<string | null>(null);
  const { data: chamas, isLoading: isChamasLoading } = useGetChamas();
  const [isImportOpen, setImportOpen] = useState(false);

  useEffect(() => {
    if (!activeChamaId && chamas && chamas.length > 0) {
      setActiveChamaId(chamas[0].id);
    }
  }, [chamas, activeChamaId]);

  const { 
    data: contributionResponse, 
    isLoading: isContributionsLoading,
    refetch,
  } = useGetChamaContributions(activeChamaId!);

  useEffect(() => {
    if (activeChamaId) {
      refetch();
    }
  }, [activeChamaId, refetch]);

  const contributions = contributionResponse?.data.contributions;
  const activeChama = chamas?.find(c => c.id === activeChamaId);

  // Check if user has privileges in the currently selected chama
  const isPrivilegedInActiveChama = activeChama?.members?.some(member => 
    member.user.id === session?.user?.id && 
    ['ADMIN', 'TREASURER', 'SECRETARY'].includes(member.role)
  ) ?? false;

const handleExport = async () => {
  if (!activeChamaId) return;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contributions/export/${activeChamaId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session?.accessToken}`, 
      },
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `contributions-${activeChamaId}-${new Date().toISOString().split('T')[0]}.csv`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Export downloaded successfully!');
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export contributions. Please try again.');
  }
};

  if (isChamasLoading) {
    return <Skeleton className="h-screen w-full" />;
  }

  if (!chamas || chamas.length === 0) {
    return (
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>No Chamas Found</AlertTitle>
        <AlertDescription>
          You are not a member of any chama yet. <Link href="/dashboard/chamas/create" className="underline">Create one</Link> to get started.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contributions</h1>
          <p className="text-muted-foreground">Select a chama to view its contribution records.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
          <ChamaSelector 
            chamas={chamas}
            selectedChamaId={activeChamaId}
            onSelectChama={setActiveChamaId}
            className="w-full sm:w-[250px]"
          />
          
          {isPrivilegedInActiveChama && (
            <>
              <Dialog open={isImportOpen} onOpenChange={setImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Import
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Import Contributions</DialogTitle>
                  </DialogHeader>
                  <BulkImportForm chamaId={activeChamaId!} onSuccess={() => setImportOpen(false)} />
                </DialogContent>
              </Dialog>

              <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
            </>
          )}

          <Button asChild>
            <Link href="/dashboard/contributions/record">
              <PlusCircle className="mr-2 h-4 w-4" /> Record
            </Link>
          </Button>
        </div>
      </div>

      {activeChamaId ? (
        <div className="space-y-6">
          {isPrivilegedInActiveChama && (
            <>
              <DefaultersList chamaId={activeChamaId} />
              <Separator />
            </>
          )}
          
          <Card>
            <CardHeader>
                <CardTitle>Full Contribution History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isContributionsLoading && <p className="p-6 text-center text-muted-foreground">Loading contributions...</p>}

              {!isContributionsLoading && contributions && contributions.length > 0 && (
                <ContributionTable contributions={contributions} />
              )}

              {!isContributionsLoading && (!contributions || contributions.length === 0) && (
                <p className="text-center text-muted-foreground py-12">
                  No contributions have been recorded for this chama yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">Please select a chama to continue.</p>
      )}
    </div>
  );
}