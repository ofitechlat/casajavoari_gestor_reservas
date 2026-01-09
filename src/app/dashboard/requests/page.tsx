import { BookingList } from "@/components/booking-list";

export default function RequestsPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Solicitudes de Espacio</h1>
                <p className="text-muted-foreground">
                    Revisa y gestiona el historial de reservas.
                </p>
            </div>

            <BookingList />
        </div>
    );
}
