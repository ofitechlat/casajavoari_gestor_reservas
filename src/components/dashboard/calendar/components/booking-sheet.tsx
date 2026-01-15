import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { DialogBody } from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useBooking } from "@/hooks/queries/useBookings";
import { useActivity } from "@/hooks/queries/useActivities";
import { BookingUserAvatar } from "./booking-avatar";
import { useMemo } from "react";

export function BookingSheet({
  open,
  onOpenChange,
  eventId
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string | null;
}) {
  // Detect if this is an activity (composite ID) or a booking (simple UUID)
  const isActivity = eventId?.startsWith('agenda-');

  // Extract the actual activity ID from the composite ID (agenda-{activityId}-{spaceId})
  const actualId = useMemo(() => {
    if (!eventId) return '';
    if (isActivity) {
      const parts = eventId.split('-');
      // The activity ID is parts[1] through parts[5] (UUID format: 8-4-4-4-12)
      return parts.slice(1, 6).join('-');
    }
    return eventId;
  }, [eventId, isActivity]);

  const { data: booking } = useBooking(!isActivity && actualId ? actualId : '');
  const { data: activity } = useActivity(isActivity && actualId ? actualId : '');

  const cutId = actualId?.slice(0, 8);

  // Determine which data to display
  const displayData = isActivity ? {
    title: activity?.title,
    description: activity?.description,
    startTime: activity?.startAt,
    endTime: activity?.endAt,
    status: 'Evento Cultural',
    ventureName: activity?.venture?.name,
    userId: undefined,
    contactId: undefined,
    responsible: activity?.responsible,
    responsibleContactIds: activity?.responsibleContactIds,
    type: 'activity'
  } : {
    title: booking?.title,
    description: booking?.description,
    startTime: booking?.startTime,
    endTime: booking?.endTime,
    status: booking?.status,
    userId: booking?.userId,
    contactId: booking?.contactId,
    responsible: booking?.responsible,
    responsibleContactIds: booking?.responsibleContactIds,
    type: 'booking'
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="m-6 max-h-[calc(100vh-10rem)] rounded-md border">
        <SheetHeader className="pb-0">
          <SheetTitle>{isActivity ? 'Evento Cultural' : 'Reserva'} #{cutId}</SheetTitle>
          <SheetDescription>
            {isActivity ? 'Detalles del evento cultural' : 'Detalles de la reserva'}
          </SheetDescription>
        </SheetHeader>
        <DialogBody className="flex-1 border-y bg-sidebar p-6 space-y-4 overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Título</h3>
            <p className="text-lg font-bold">{displayData?.title}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Descripción</h3>
            <p className="text-sm">{displayData?.description || 'Sin descripción'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Inicio</h3>
              <p className="text-sm">
                {displayData?.startTime && format(new Date(displayData.startTime), "PPP h:mm a", { locale: es }).toLowerCase()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fin</h3>
              <p className="text-sm">
                {displayData?.endTime && format(new Date(displayData.endTime), "PPP h:mm a", { locale: es }).toLowerCase()}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Estado</h3>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                {displayData?.status}
              </div>
              {isActivity && (displayData as any).ventureName && (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  Artista: {(displayData as any).ventureName}
                </div>
              )}
            </div>
          </div>

          {(displayData?.userId || displayData?.contactId || (displayData?.responsible && displayData.responsible.length > 0) || (displayData?.responsibleContactIds && displayData.responsibleContactIds.length > 0)) ? (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Responsables</h3>
              <BookingUserAvatar
                userId={displayData.userId}
                contactId={displayData.contactId}
                responsible={displayData.responsible}
                responsibleContactIds={displayData.responsibleContactIds}
                className="w-full"
              />
            </div>
          ) : null}

          {isActivity && activity?.imageUrl && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Imagen</h3>
              <img src={activity.imageUrl} alt={activity.title} className="w-full rounded-md" />
            </div>
          )}

          {isActivity && activity?.tags && activity.tags.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </DialogBody>
        <SheetFooter className="p-6">
          <SheetClose asChild>
            <button className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors">
              Cerrar
            </button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet >
  );
}
