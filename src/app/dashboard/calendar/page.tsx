import { CalendarView } from "@/components/calendar-view";

export default function CalendarPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Calendario de Actividades</h1>
                <p className="text-muted-foreground">
                    Visualiza la ocupación de los espacios por mes.
                </p>
            </div>

            <CalendarView />
        </div>
    );
}
