"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface AccessDeniedProps {
    requiredRoles?: string[];
    onReturn: () => void;
}

export function AccessDenied({ requiredRoles, onReturn }: AccessDeniedProps) {
    const router = useRouter();

    const handleReturnClick = () => {
        onReturn();
        router.push('/dashboard/reports');
    };

    return (
        <Card className="max-w-2xl mx-auto border-destructive/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                    Access Denied
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p>You do not have the required permissions to view this page for the selected chama.</p>
                {requiredRoles && (
                    <p className="text-sm text-muted-foreground">
                        Access is restricted to the following roles: {requiredRoles.join(', ')}.
                    </p>
                )}
                <Button onClick={handleReturnClick}>
                    Return to Reports Dashboard
                </Button>
            </CardContent>
        </Card>
    );
}