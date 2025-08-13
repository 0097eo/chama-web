"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import axios, { AxiosError } from 'axios';
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ApiErrorResponse {
  message: string;
}

function VerificationComponent() {
  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. The token is missing.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, { token });
        setStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        setStatus('error');
        if (error instanceof AxiosError && error.response?.data) {
          const errorData = error.response.data as ApiErrorResponse;
          setMessage(errorData.message || 'Verification failed. The link may be expired or invalid.');
        } else {
          setMessage('Verification failed. The link may be expired or invalid.');
        }
      }
    };

    verifyToken();
  }, [token]);

  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {status === 'verifying' && <p>{message}</p>}
        {status === 'success' && <p className="text-green-600">{message}</p>}
        {status === 'error' && <p className="text-red-500">{message}</p>}
        <Button asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Suspense fallback={<div>Loading...</div>}>
                <VerificationComponent />
            </Suspense>
        </div>
    )
}