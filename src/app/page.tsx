/* eslint-disable react/no-unescaped-entities */
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center p-8">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-800 dark:text-white">
          Welcome to ChamaSmart
        </h1>
        <p className="max-w-xl text-lg text-gray-600 dark:text-gray-300">
          The modern, secure, and easy-to-use platform for managing your chama's finances, loans, and meetings.
        </p>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/login">
            Login
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/register">
            Create an Account
          </Link>
        </Button>
      </div>
    </main>
  );
}