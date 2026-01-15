import { BookingForm } from "@/components/forms/booking-form/BookingForm";
/* import { Button } from "@/components/ui/button"; */

export default function CreateBookingPage() {
  return (
    <>
      <div className="space-y-2 px-8 mb-8 z-10 sticky top-0 bg-background">
        <header className="py-6  flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight">Nueva Solicitud</h1>
            <p>Completa el formulario para reservar un espacio.</p>
          </div>
        </header>
      </div>

      

        

        <div className="flex flex-col gap-8 lg:flex-row px-8">
          <BookingForm />
        </div>

    </>
  );
}

