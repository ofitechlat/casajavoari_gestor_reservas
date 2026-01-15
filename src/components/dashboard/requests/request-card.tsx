'use client';

import { Booking } from '@/types';
import { useUpdateBooking, useBookings, useSpaces, useActivities } from '@/hooks/queries';
import { checkConflicts } from '@/lib/booking-utils';
import { Card, CardContent, CardDescription, CardHeader, CardHeading, CardTitle, CardToolbar } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { BookingUserAvatar } from '@/components/dashboard/calendar/components/booking-avatar';
import { XCircle, Clock, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface RequestCardProps {
  booking: Booking;
  showActions?: boolean;
}

export function RequestCard({ booking, showActions = true }: RequestCardProps) {
  const { data: allBookings = [] } = useBookings();
  const { data: allActivities = [] } = useActivities();
  const updateMutation = useUpdateBooking();
  const { data: spaces = [] } = useSpaces();

  // Verify conflicts
  const conflicts = checkConflicts(booking, allBookings, allActivities);
  const hasBlockingConflicts = conflicts.some(c => c.severity === 'blocking');
  const hasWarnings = conflicts.some(c => c.severity === 'warning');

  const handleApprove = () => {
    if (hasBlockingConflicts) {
      toast.error("No se puede aprobar. Hay conflictos bloqueantes que deben resolverse.");
      return;
    }

    updateMutation.mutate(
      { id: booking.id!, data: { status: 'approved' } },
      {
        onSuccess: () => {
          toast.success(`Reserva "${booking.title}" aprobada correctamente`);
        },
        onError: (error) => {
          toast.error("Error al aprobar la solicitud");
          console.error(error);
        }
      }
    );
  };

  const handleReject = () => {
    updateMutation.mutate(
      { id: booking.id!, data: { status: 'rejected' } },
      {
        onSuccess: () => {
          toast.success(`Solicitud "${booking.title}" rechazada`);
        },
        onError: (error) => {
          toast.error("Error al rechazar la solicitud");
          console.error(error);
        }
      }
    );
  };




  const Day = format(new Date(booking.startTime), 'EEE', { locale: es });
  const DayNumber = format(new Date(booking.startTime), 'd', { locale: es });

  return (
    <>
      <Card variant="accent">
        <CardHeader className='pl-0 px-2 pb-2 pt-1'>
          <CardHeading className="">
            <div className="flex items-start gap-2">
              <div className="">
                <div className="flex flex-col items-start h-fit w-16 rounded-lg border bg-card overflow-hidden">
                  <div className="w-full overflow-hidden flex flex-col items-center pt-1 px-2 bg-destructive">
                    <h1 className="text-xs font-semibold capitalize text-white">{Day}</h1>
                  </div>
                  <div className="w-full overflow-hidden flex flex-col items-center p-2 border-t">
                    <h1 className="text-4xl font-semibold capitalize">{DayNumber}</h1>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-1">
                <CardTitle>{booking.title}</CardTitle>
                <CardDescription className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> {spaces.find(s => s.id === booking.spaceId)?.name || 'Sin espacio'}</CardDescription>
              </div>
            </div>
          </CardHeading>
          <CardToolbar className=''>
            <div>
              {hasBlockingConflicts && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Conflicto
                </Badge>
              )}
              {hasWarnings && !hasBlockingConflicts && (
                <Badge className="gap-1 bg-yellow-500/10 text-yellow-700 border-yellow-500/50">
                  <Clock className="h-3 w-3" />
                  Advertencias
                </Badge>
              )}
            </div>
            Edit
          </CardToolbar>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <h1>Detalles</h1>
            <p className="text-sm text-muted-foreground">{booking.description || 'Sin descripción'}</p>
            <Separator />
            <h1>Responsable/s</h1>
            <BookingUserAvatar
              userId={booking.userId}
              contactId={booking.contactId}
              responsible={booking.responsible}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

{/*       <div className="flex  w-full items-center h-full">
        <div className="flex flex-col items-start h-full w-fit p-2">
          <div className="border-border border-r w-fit overflow-hidden px-4 pr-6 py-1 flex flex-col items-center">
            <h1 className="text-xs font-semibold capitalize">{Day}</h1>
            <h1 className="text-4xl font-semibold capitalize">{DayNumber}</h1>
          </div>
        </div>
        <div className="flex flex-col items-start flex-1 h-full">
          <div className="flex flex-col items-start flex-1 h-full p-2">
            <span className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{booking.title}</h1>
              {hasBlockingConflicts && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Conflicto
                </Badge>
              )}
              {hasWarnings && !hasBlockingConflicts && (
                <Badge className="gap-1 bg-yellow-500/10 text-yellow-700 border-yellow-500/50">
                  <Clock className="h-3 w-3" />
                  Advertencias
                </Badge>
              )}
            </span>
            <p className="text-sm text-muted-foreground">{booking.description || 'Sin descripción'}</p>
            <div className="mt-2">
              <BookingUserAvatar
                userId={booking.userId}
                contactId={booking.contactId}
                responsible={booking.responsible}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div> */}

{/* Header */ }
{/*       <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold">{booking.title}</h3>
            {hasBlockingConflicts && (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Conflicto
              </Badge>
            )}
            {hasWarnings && !hasBlockingConflicts && (
              <Badge className="gap-1 bg-yellow-500/10 text-yellow-700 border-yellow-500/50">
                <Clock className="h-3 w-3" />
                Advertencias
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(booking.startTime), 'PPp', { locale: es })} -
              {format(new Date(booking.endTime), 'p', { locale: es })}
            </div>
            {booking.space && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {booking.space.name}
              </div>
            )}
          </div>
        </div>
      </div> */}

{/* Description */ }
{/*       {booking.description && (
        <p className="text-sm text-muted-foreground mb-4">
          {booking.description}
        </p>
      )} */}

{/* Responsible Users */ }
{/*       {(booking.userId || booking.contactId || (booking.responsible && booking.responsible.length > 0)) && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Responsables
          </p>
          <BookingUserAvatar
            userId={booking.userId}
            contactId={booking.contactId}
            responsible={booking.responsible}
            className="w-full"
          />
        </div>
      )} */}

{/* Conflict Alerts */ }
{/*       {conflicts.length > 0 && (
        <div className="mb-4">
          <ConflictAlerts conflicts={conflicts} />
        </div>
      )} */}

{/* Actions */ }
{/*       {showActions && (
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleApprove}
            disabled={hasBlockingConflicts || updateMutation.isPending}
            className="flex-1 gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Aprobar
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={updateMutation.isPending}
            className="flex-1 gap-2"
          >
            <XCircle className="h-4 w-4" />
            Rechazar
          </Button>
        </div>
      )} */}
