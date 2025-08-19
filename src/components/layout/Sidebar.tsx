"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Landmark, HandCoins, Calendar, FileText, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/chamas", label: "Chamas", icon: Users },
  { href: "/dashboard/contributions", label: "Contributions", icon: Landmark },
  { href: "/dashboard/loans", label: "Loans", icon: HandCoins },
  { href: "/dashboard/reports", label: "Reports", icon: Gauge },
  { href: "/dashboard/meetings", label: "Meetings", icon: Calendar },
  { href: "/dashboard/files", label: "Files", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-background">
      <div className="p-6 border-b h-14 flex items-center justify-center">
        <h1 className="text-2xl font-bold">ChamaSmart</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === link.href && "bg-muted text-primary"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}