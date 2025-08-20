"use client";

import { useQueryStkStatus } from "@/hooks/useMpesa";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

export function PaymentStatus({ checkoutRequestId }: { checkoutRequestId: string }) {
    const { data, isLoading, isError } = useQueryStkStatus(checkoutRequestId);
    
    useEffect(() => {
        if (data?.ResultCode === 0) {
            toast.success(data.ResultDesc || "Payment successful!");
        } else if (data && data.ResultCode > 0) {
            toast.error(data.ResultDesc || "Payment failed.");
        }
    }, [data]);

    if (isLoading && !data) {
        return (
            <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Polling Status...</AlertTitle>
                <AlertDescription>
                    We are checking the status of your M-Pesa transaction.
                </AlertDescription>
            </Alert>
        );
    }
    
    if (isError) return <Alert variant="destructive"><XCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>Could not query payment status.</AlertDescription></Alert>;

    if (data?.ResultCode === 0) {
        return <Alert variant="default" className="bg-green-100 dark:bg-green-900/20"><CheckCircle className="h-4 w-4" /><AlertTitle>Payment Successful</AlertTitle><AlertDescription>{data.ResultDesc}</AlertDescription></Alert>;
    }
    
    if (data && data.ResultCode > 0) {
         return <Alert variant="destructive"><XCircle className="h-4 w-4" /><AlertTitle>Payment Failed</AlertTitle><AlertDescription>{data.ResultDesc}</AlertDescription></Alert>;
    }

    // Default state while polling continues
    return (
        <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Processing Payment</AlertTitle>
            <AlertDescription>
                Awaiting confirmation from M-Pesa. This may take a few moments.
            </AlertDescription>
        </Alert>
    );
}