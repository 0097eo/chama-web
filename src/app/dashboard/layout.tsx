"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChamaProvider } from "@/context/ChamaContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChamaProvider>
      <div className="min-h-screen w-full flex bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-8 bg-muted/40">
            {children}
          </main>
        </div>
      </div>
    </ChamaProvider>
  );
}