"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/hooks/queries";
import { BookingStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "@/components/bookings/columns";
import { DataTableToolbar } from "@/components/bookings/data-table-toolbar";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, AlertCircle, Calendar, MapPin, User } from "lucide-react";

export default function MyBookingsPage() {
    const { user } = useAuth();
    const { data: allBookings = [], isLoading } = useBookings();
    const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "all">("all");

    // Filter bookings for current user only
    const myBookings = allBookings.filter(booking => booking.userId === user?.id);

    // Filter by status
    const filteredBookings = selectedStatus === "all"
        ? myBookings
        : myBookings.filter(b => b.status === selectedStatus);

    const getStatusBadge = (status: BookingStatus) => {
        const variants = {
            pending: { variant: "secondary" as const, icon: Clock, label: "Pendiente", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
            approved: { variant: "default" as const, icon: CheckCircle2, label: "Aprobada", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
            rejected: { variant: "destructive" as const, icon: XCircle, label: "Rechazada", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
            cancelled: { variant: "outline" as const, icon: XCircle, label: "Cancelada", className: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
        };

        const config = variants[status];
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className={config.className}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getStatusCounts = () => {
        return {
            all: myBookings.length,
            pending: myBookings.filter(b => b.status === "pending").length,
            approved: myBookings.filter(b => b.status === "approved").length,
            rejected: myBookings.filter(b => b.status === "rejected").length,
        };
    };

    const counts = getStatusCounts();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6 ">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Mis Solicitudes</h1>
                    <p className="text-muted-foreground mt-2">
                        Gestiona y revisa el estado de tus solicitudes de reserva
                    </p>
                </div>
            </header>

            <DataTable
                columns={columns}
                data={myBookings}
                toolbar={DataTableToolbar}
            />
        </div>
    );
}
