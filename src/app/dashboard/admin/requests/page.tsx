"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/hooks/queries";
import { Shield, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "@/components/admin/requests/columns";
import { DataTableToolbar } from "@/components/admin/requests/data-table-toolbar";

export default function AdminRequestsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { data: allBookings = [], isLoading } = useBookings();

    // Redirect if not admin
    if (user && user.user_metadata?.role !== "admin") {
        router.push("/dashboard");
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center gap-3">
                
                <div>
                    <h1 className="text-3xl font-bold flex items-center">
                        <Shield className="w-8 h-8 text-primary" /> Gestión de Solicitudes
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Revisa y administra todas las solicitudes de reserva
                    </p>
                </div>
            </div>

            <DataTable columns={columns} data={allBookings} toolbar={DataTableToolbar} />
        </div>
    );
}
