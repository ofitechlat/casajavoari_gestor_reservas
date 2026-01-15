"use client";

import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useDashboardKpis } from "@/hooks/use-dashboard-kpis";
import { Calendar, Clock, DollarSign, LayoutGrid } from "lucide-react";
import { KpiCard } from "@/components/cards";

export default function DashboardPage() {
  const { user } = useAuth();
  const { totalBookings, pendingRequests, activeSpaces, totalRevenue, loading } = useDashboardKpis();

  if (!user) return null;

  return (
    <div className="space-y-2">
      <header className="p-8 space-y-1">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold font-sans">
            Hola, {user.user_metadata?.name}
          </h1>
        </div>
        <p>
          Bienvenido al Dashboard de Casa Javorai. Hoy es{" "}
          {format(new Date(), "dd 'de' MMMM, yyyy")}.
        </p>
      </header>

      <main className="p-8">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            variant="info"
            title="Total de Reservas"
            value={totalBookings}
            subtitle="Todas las reservas"
            icon={Calendar}
            loading={loading}
          />
          <KpiCard

            variant="warning"
            title="Solicitudes Pendientes"
            value={pendingRequests}
            subtitle="Requieren aprobación"
            icon={Clock}
            loading={loading}
          />
          <KpiCard
            variant="success"
            title="Espacios Activos"
            value={activeSpaces}
            subtitle="Disponibles para reservar"
            icon={LayoutGrid}
            loading={loading}
          />
          <KpiCard
            variant="destructive"
            title="Ingresos Totales"
            value={`$${totalRevenue.toLocaleString("es-MX")}`}
            subtitle="De reservas aprobadas"
            icon={DollarSign}
            loading={loading}
          />
        </div>


      </main>
    </div>
  );
}
