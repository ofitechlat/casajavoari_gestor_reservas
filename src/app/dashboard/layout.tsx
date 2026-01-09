"use client";

import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <AppSidebar />
            <main className="pl-64 min-h-screen">
                <div className="container mx-auto p-8 max-w-5xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
