"use client";

import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { MobileNav } from "./MobileNav";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link"; // Import the Link component

function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      <MobileNav />
      <div className="w-full flex-1">
          {/* You can add your ChamaSelector from the context here if you want it to be global */}
      </div>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar>
              {status === "loading" ? (
                <Skeleton className="h-10 w-10 rounded-full" />
              ) : (
                <AvatarFallback>
                  {user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.email || "My Account")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* --- THE FIX --- */}
          {/* Wrap the DropdownMenuItem in a Link component */}
          <Link href="/dashboard/profile" passHref>
            <DropdownMenuItem>
              Profile Settings
            </DropdownMenuItem>
          </Link>
          
          {/* The "Support" item is removed */}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}