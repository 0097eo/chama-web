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

// Zod schema with validation rules
const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  // Basic validation for Kenyan phone number
  phone: z.string().regex(/^(?:254|\+254|0)?(7|1)\d{8}$/, "Please enter a valid Kenyan phone number."),
  idNumber: z.string().min(5, "Please enter a valid ID number."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", idNumber: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, values);
      toast.success("Registration successful!");
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        toast.error(errorData.message || "Registration failed. Please try again.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Display a success message after registration
  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-green-600">Registration Successful!</h3>
        <p className="text-muted-foreground">
          A verification link has been sent to your email. Please check your inbox (and spam folder) to activate your account before logging in.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="0712345678" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="idNumber" render={({ field }) => (
          <FormItem><FormLabel>ID Number</FormLabel><FormControl><Input placeholder="12345678" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="********" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}