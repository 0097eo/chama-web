"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ApiErrorResponse {
  message: string;
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, values);
      toast.success("Password reset link sent!");
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        toast.error(errorData.message || "An error occurred. Please try again.");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-green-600">Check Your Email</h3>
        <p className="text-muted-foreground">
          If an account with that email exists, we have sent a password reset link to it. The link will expire in one hour.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your registered email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending Link..." : "Send Reset Link"}
        </Button>
      </form>
    </Form>
  );
}