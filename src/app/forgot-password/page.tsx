/* eslint-disable react/no-unescaped-entities */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import Link from "next/link";


export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            No problem. Enter your email below and we'll send you a link to reset it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Back to Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}