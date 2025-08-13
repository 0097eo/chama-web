import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import Link from "next/link";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
            Enter a new password for your account below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-blue-600 hover:underline">
              Back to Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}