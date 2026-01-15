"use client";

import { Booking, Space } from "@/types";
import { BookingsGridProvider } from "./bookings-grid-context";
import { BookingsGridRoot } from "./bookings-grid-root";
import { BookingsGridHeader } from "./bookings-grid-header";
import { BookingsGridTimeSlots } from "./bookings-grid-time-column";
import { BookingsGridCells } from "./bookings-grid-cells";
import { BookingsGridBookings } from "./bookings-grid-cell";
import { BookingGridItem } from "./bookings-grid-context";

interface BookingsGridProps {
    date: Date;
    bookings: Booking[];
    spaces: Space[];
    startHour?: number;
    endHour?: number;
    onBookingClick?: (booking: BookingGridItem) => void;
    onBookingNew?: () => void;
    className?: string;
}

/**
 * Composed BookingsGrid component for convenience.
 * For more customization, use the headless primitives directly:
 * 
 * @example
 * <BookingsGridProvider date={date} bookings={bookings} spaces={spaces}>
 *   <BookingsGridRoot>
 *     <BookingsGridHeader />
 *     <BookingsGridTimeSlots />
 *     <BookingsGridCells />
 *     <BookingsGridBookings renderBooking={(booking) => <CustomCell booking={booking} />} />
 *   </BookingsGridRoot>
 * </BookingsGridProvider>
 */
export function BookingsGrid({
    date,
    bookings,
    spaces,
    startHour = 0,  // 12:00 AM - Show all 24 hours
    endHour = 23,   // 11:00 PM
    onBookingClick,
    className,
}: BookingsGridProps) {
    if (spaces.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                No spaces available
            </div>
        );
    }

    return (
        <BookingsGridProvider
            date={date}
            bookings={bookings}
            spaces={spaces}
            startHour={startHour}
            endHour={endHour}
        >
            <BookingsGridRoot className={className}>
                <BookingsGridHeader />
                <BookingsGridTimeSlots />
                <BookingsGridCells />
                <BookingsGridBookings onBookingClick={onBookingClick} />
            </BookingsGridRoot>
        </BookingsGridProvider>
    );
}
