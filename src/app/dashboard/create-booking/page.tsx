import { BookingForm } from "@/components/booking-form";

export default function CreateBookingPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Nueva Solicitud</h1>
                <p className="text-muted-foreground">
                    Completa el formulario para reservar un espacio. El sistema verificará conflictos automáticamente.
                </p>
            </div>

            <BookingForm />
        </div>
    );
}
