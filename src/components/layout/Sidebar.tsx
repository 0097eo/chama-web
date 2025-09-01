"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Landmark, HandCoins, Calendar, FileText, Gauge, Banknote, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationStats } from "@/hooks/useNotifications";
import { useChamaContext } from "@/context/ChamaContext";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/chamas", label: "Chamas", icon: Users },
  { href: "/dashboard/contributions", label: "Contributions", icon: Landmark },
  { href: "/dashboard/loans", label: "Loans", icon: HandCoins },
  { href: "/dashboard/reports", label: "Reports", icon: Gauge },
  { href: "/dashboard/payments", label: "Mpesa Payments", icon: Banknote},
  { href: "/dashboard/meetings", label: "Meetings", icon: Calendar },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/files", label: "Files", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { activeChama } = useChamaContext();
  const { unreadCount, hasUnread } = useNotificationStats(activeChama?.id);

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-background">
      <div className="p-6 border-b h-14 flex items-center justify-center">
        <h1 className="text-2xl font-bold">ChamaSmart</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => {
          const isNotificationLink = link.href === "/dashboard/notifications";
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary relative",
                isActive && "bg-muted text-primary",
                isNotificationLink && hasUnread && !isActive && "text-blue-600"
              )}
            >
              <link.icon className={cn(
                "h-4 w-4",
                isNotificationLink && hasUnread && "animate-pulse"
              )} />
              {link.label}
              
              {/* Notification Badge */}
              {isNotificationLink && hasUnread && (
                <Badge 
                  variant="destructive" 
                  className="ml-auto h-5 min-w-[20px] px-1.5 text-xs"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}