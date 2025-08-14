"use client";

import { use } from "react";
import { useGetChamaById } from "@/hooks/useChamas";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";


export default function ChamaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: session } = useSession();
  const { data: chama, isLoading, error } = useGetChamaById(id);
  const pathname = usePathname();

  const currentUserMembership = chama?.members.find(
    (member) => member.user.id === session?.user?.id
  );

  const isChamaAdmin = currentUserMembership?.role === 'ADMIN';

  const navLinks = [
    { href: `/dashboard/chamas/${id}`, label: "Overview" },
    { href: `/dashboard/chamas/${id}/members`, label: "Members" },
  ];

  if (isChamaAdmin) {
    navLinks.push({ href: `/dashboard/chamas/${id}/settings`, label: "Settings" });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <div className="flex gap-4 border-b">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  if (!chama) {
    return <p>Chama not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{chama.name}</h1>
        <p className="text-muted-foreground">{chama.description || "No description provided."}</p>
      </div>

      <nav className="flex items-center space-x-4 border-b pb-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md",
              pathname === link.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      
      {/* The actual page content will be rendered here */}
      <div>{children}</div>
    </div>
  );
}