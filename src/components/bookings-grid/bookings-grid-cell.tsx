"use client";

import { useBookingsGridContext, BookingGridItem } from "./bookings-grid-context";
import { cn } from "@/lib/utils";

interface BookingsGridBookingsProps {
    className?: string;
    renderBooking?: (booking: BookingGridItem, index: number) => React.ReactNode;
    onBookingClick?: (booking: BookingGridItem) => void;
}

export function BookingsGridBookings({
    className,
    renderBooking,
    onBookingClick,
}: BookingsGridBookingsProps) {
    const { gridBookings } = useBookingsGridContext();

    return (
        <>
            {gridBookings.map((booking, index) => (
                <div
                    key={booking.id}
                    className={cn("relative", className)}
                    style={{
                        gridRow: `${booking.gridRow} / span ${booking.gridRowSpan}`,
                        gridColumn: booking.gridColumn,
                        pointerEvents: "none",
                    }}
                >
                    <div
                        className="absolute inset-1 pointer-events-auto"
                        onClick={() => onBookingClick?.(booking)}
                    >
                        {renderBooking ? (
                            renderBooking(booking, index)
                        ) : (
                            <DefaultBookingCell booking={booking} />
                        )}
                    </div>
                </div>
            ))}
        </>
    );
}

function DefaultBookingCell({ booking }: { booking: BookingGridItem }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-500/20 border-green-500/40";
            case "pending":
                return "bg-yellow-500/20 border-yellow-500/40";
            case "rejected":
                return "bg-red-500/20 border-red-500/40";
            case "cancelled":
                return "bg-gray-500/20 border-gray-500/40";
            default:
                return "bg-blue-500/20 border-blue-500/40";
        }
    };

    return (
        <div
            className={cn(
                "h-full rounded-md border-l-4 p-2 cursor-pointer transition-all hover:opacity-80",
                getStatusColor(booking.status)
            )}
        >
            <div className="flex flex-col h-full overflow-hidden">
                <p className="text-xs font-semibold truncate">{booking.title}</p>
            </div>
        </div>
    );
}
