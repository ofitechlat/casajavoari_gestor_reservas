"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 w-full flex flex-col overflow-hidden">
        <header className="flex h-[50px] sticky top-0 z-50 bg-background shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[50px]">
          <div className="flex w-full items-center gap-1  lg:gap-2 px-4">
            <SidebarTrigger />

            {/* <div className="border w-0.5 h-[50px]" /> */}

            <div className="ml-auto flex items-center gap-2">

            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
