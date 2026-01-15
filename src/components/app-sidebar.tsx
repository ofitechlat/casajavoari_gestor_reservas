"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, Home, PlusCircle, List, User as UserIcon, LogOut, Ticket, Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const links = [
        { href: "/dashboard", label: "Inicio", icon: Home },
        { href: "/dashboard/calendar", label: "Calendario", icon: Calendar },
        { href: "/dashboard/create-booking", label: "Nueva Solicitud", icon: PlusCircle },
        { href: "/dashboard/requests", label: "Solicitudes", icon: List },
        { href: "/dashboard/activities", label: "Actividades", icon: Ticket },
        { href: "/dashboard/ventures", label: "Emprendimientos", icon: Store },
    ];

    return (
        <div className="w-64 border-r bg-card h-screen flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-primary tracking-tight">Casa Javorai</h2>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t space-y-2">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.user_metadata?.name || user?.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user?.user_metadata?.role || 'user'}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
