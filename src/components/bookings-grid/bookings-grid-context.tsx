"use client";

import { createContext, useContext, useMemo } from "react";
import { Booking, Space } from "@/types";
import { startOfDay, endOfDay, isWithinInterval, format } from "date-fns";

export interface TimeSlot {
    time: string;
    hour: number;
    minute: number;
}

export interface BookingGridItem extends Booking {
    gridRow: number;
    gridRowSpan: number;
    gridColumn: number;
}

interface BookingsGridContextValue {
    date: Date;
    bookings: Booking[];
    spaces: Space[];
    timeSlots: TimeSlot[];
    gridBookings: BookingGridItem[];
    startHour: number;
    endHour: number;
    intervalMinutes: number;
    totalRows: number;
    totalColumns: number;
}

const BookingsGridContext = createContext<BookingsGridContextValue | null>(null);

export function useBookingsGridContext() {
    const context = useContext(BookingsGridContext);
    if (!context) {
        throw new Error("useBookingsGridContext must be used within BookingsGridProvider");
    }
    return context;
}

interface BookingsGridProviderProps {
    date: Date;
    bookings: Booking[];
    spaces: Space[];
    startHour?: number;
    endHour?: number;
    intervalMinutes?: number;
    children: React.ReactNode;
}

export function BookingsGridProvider({
    date,
    bookings,
    spaces,
    startHour = 0,  // 12:00 AM - Show all 24 hours
    endHour = 23,   // 11:00 PM
    intervalMinutes = 60,
    children,
}: BookingsGridProviderProps) {
    // Generate time slots
    const timeSlots = useMemo<TimeSlot[]>(() => {
        const slots: TimeSlot[] = [];
        const totalSlots = ((endHour - startHour) * 60) / intervalMinutes;

        for (let i = 0; i <= totalSlots; i++) {
            const totalMinutes = startHour * 60 + i * intervalMinutes;
            const hour = Math.floor(totalMinutes / 60);
            const minute = totalMinutes % 60;

            slots.push({
                time: format(new Date().setHours(hour, minute, 0, 0), "h:mm a"),
                hour,
                minute,
            });
        }
        return slots;
    }, [startHour, endHour, intervalMinutes]);

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

            // Calculate start position in minutes from start hour
            const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
            const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
            const baseMinutes = startHour * 60;

            // Calculate grid row (1-based, +1 for header row)
            const startOffset = (startMinutes - baseMinutes) / intervalMinutes;
            const endOffset = (endMinutes - baseMinutes) / intervalMinutes;

            const gridRow = Math.floor(startOffset) + 2;
            const gridRowEnd = Math.ceil(endOffset) + 2;
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

    const value: BookingsGridContextValue = {
        date,
        bookings: dayBookings,
        spaces,
        timeSlots,
        gridBookings,
        startHour,
        endHour,
        intervalMinutes,
        totalRows: timeSlots.length,
        totalColumns: spaces.length,
    };

    return (
        <BookingsGridContext.Provider value={value}>
            {children}
        </BookingsGridContext.Provider>
    );
}
