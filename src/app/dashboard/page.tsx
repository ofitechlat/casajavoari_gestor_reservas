"use client";

import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "date-fns";

export default function DashboardPage() {
    const { user, logout } = useAuth();

    if (!user) return null; // Or redirect handled by middleware/layout later

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-sans">Hola, {user.name}</h1>
                <button
                    onClick={logout}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                    Cerrar Sesión
                </button>
            </div>
            <p>Bienvenido al Dashboard de Casa Javorai. Hoy es {formatDate(new Date(), "dd 'de' MMMM, yyyy")}.</p>
        </div>
    );
}
