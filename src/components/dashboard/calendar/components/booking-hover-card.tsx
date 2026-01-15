import { useBooking } from "@/hooks/queries/useBookings";
import { HoverCardContent } from "@/components/ui/hover-card";
import { BookingUserAvatar } from "./booking-avatar";
import { Feature } from "@/components/kibo-ui/calendar";

export function BookingCalendarHoverCard({ feature }: { feature: Feature }) {
  const { data: booking } = useBooking(feature.id);

  return (
    <HoverCardContent
      align="center"
      side="right"
      className="w-[300px]"
      style={{
        borderLeftColor: feature.status.color,
        borderLeftWidth: '2px',
      }}
    >
      <p className="text-xs font-bold">{booking?.title}</p>
      <p className="text-xs">{booking?.description}</p>
      {booking?.userId || booking?.contactId || (booking?.responsible && booking.responsible.length > 0) ? (
        <div className="mt-2 pt-2 border-t border-primary/10">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 opacity-70">Responsables</p>
          <BookingUserAvatar 
            userId={booking.userId} 
            contactId={booking.contactId} 
            responsible={booking.responsible} 
          />
        </div>
      ) : null}
    </HoverCardContent>
  );
}
