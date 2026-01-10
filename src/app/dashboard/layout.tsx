"use client";

import { AppSidebar } from "@/components/fixed/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const normalizedPathname = pathname.replace(/^\//, "");
  const title = normalizedPathname.replace(/\//g, " ");

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formattedTitle = capitalizeFirstLetter(title);
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="h-screen overflow-y-auto w-full flex flex-col">
        <header className="flex h-[50px] sticky top-0 bg-background shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[50px]">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">{formattedTitle}</h1>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
                <a
                  href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="dark:text-foreground"
                >
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </header>
        {children}
      </main>
    </SidebarProvider>
  );
}
