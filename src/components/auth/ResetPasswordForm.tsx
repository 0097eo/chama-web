"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ApiErrorResponse {
  message: string;
}

const formSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) {
      toast.error("Invalid or missing password reset token.");
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        token,
        password: values.password,
      });
      toast.success("Password reset successfully!");
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        toast.error(errorData.message || "An error occurred. The token may be invalid or expired.");
      } else {
        toast.error("An error occurred. The token may be invalid or expired.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-green-600">Password Reset!</h3>
        <p className="text-muted-foreground">
          Your password has been changed. You can now log in with your new password.
        </p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center text-red-500">
        <p>Invalid password reset link. The token is missing from the URL.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" placeholder="********" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" placeholder="********" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </Form>
  );
}