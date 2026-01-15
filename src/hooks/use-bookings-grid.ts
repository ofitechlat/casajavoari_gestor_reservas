"use client";

import { useMemo } from "react";
import { Booking, Space } from "@/types";
import { startOfDay, endOfDay, isWithinInterval, format } from "date-fns";

export interface TimeSlot {
    time: string;
    hour: number;
}

export interface BookingGridItem extends Booking {
    gridRow: number;
    gridRowSpan: number;
    gridColumn: number;
}

export interface UseBookingsGridProps {
    date: Date;
    bookings: Booking[];
    spaces: Space[];
    startHour?: number;
    endHour?: number;
    intervalMinutes?: number;
}

export function useBookingsGrid({
    date,
    bookings,
    spaces,
    startHour = 7,
    endHour = 20,
    intervalMinutes = 60,
}: UseBookingsGridProps) {
    // Generate time slots
    const timeSlots = useMemo<TimeSlot[]>(() => {
        const slots: TimeSlot[] = [];
        for (let hour = startHour; hour <= endHour; hour++) {
            slots.push({
                time: format(new Date().setHours(hour, 0, 0, 0), "HH:mm a"),
                hour,
            });
        }
        return slots;
    }, [startHour, endHour]);

    // Filter bookings for the selected date
    const dayBookings = useMemo(() => {
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        return bookings.filter((booking) => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);

            return (
                isWithinInterval(bookingStart, { start: dayStart, end: dayEnd }) ||
                isWithinInterval(bookingEnd, { start: dayStart, end: dayEnd }) ||
                (bookingStart < dayStart && bookingEnd > dayEnd)
            );
        });
    }, [bookings, date]);

    // Calculate grid positions for bookings
    const gridBookings = useMemo<BookingGridItem[]>(() => {
        return dayBookings.map((booking) => {
            const startTime = new Date(booking.startTime);
            const endTime = new Date(booking.endTime);

            // Calculate grid row (1-based, +1 for header row)
            const startHourDecimal = startTime.getHours() + startTime.getMinutes() / 60;
            const endHourDecimal = endTime.getHours() + endTime.getMinutes() / 60;

            const gridRow = Math.floor((startHourDecimal - startHour) * (60 / intervalMinutes)) + 2;
            const gridRowEnd = Math.ceil((endHourDecimal - startHour) * (60 / intervalMinutes)) + 2;
            const gridRowSpan = Math.max(1, gridRowEnd - gridRow);

            // Calculate grid column (1-based, +1 for time column)
            const spaceIndex = spaces.findIndex((s) => s.id === booking.spaceId);
            const gridColumn = spaceIndex >= 0 ? spaceIndex + 2 : 2;

            return {
                ...booking,
                gridRow,
                gridRowSpan,
                gridColumn,
            };
        });
    }, [dayBookings, spaces, startHour, intervalMinutes]);

    return {
        timeSlots,
        dayBookings,
        gridBookings,
        totalRows: timeSlots.length,
        totalColumns: spaces.length,
    };
}
