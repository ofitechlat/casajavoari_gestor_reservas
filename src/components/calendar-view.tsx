"use client";

import React, { useState } from "react";
import { useBookings } from "@/contexts/BookingContext";
import { SPACES } from "@/data/mock";
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isSameMonth
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button"; // Assuming relative path works or @
import { cn } from "@/lib/utils";

export function CalendarView() {
    const { bookings } = useBookings();
    const [currentDate, setCurrentDate] = useState(new Date());

    const firstDay = startOfMonth(currentDate);
    const lastDay = endOfMonth(currentDate);

    // Get calendar grid days (including prev/next month days)
    const startDate = startOfWeek(firstDay, { weekStartsOn: 1 }); // Start Monday
    const endDate = endOfWeek(lastDay, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const getDayBookings = (day: Date) => {
        return bookings.filter(b =>
            (b.status === 'approved' || b.status === "pending") &&
            isSameDay(b.startTime, day)
        );
    };

    return (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b">
                <h2 className="text-lg font-bold capitalize">
                    {format(currentDate, "MMMM yyyy", { locale: es })}
                </h2>
                <div className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 bg-muted/50 border-b">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-semibold text-muted-foreground uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 divide-x divide-gray-100 dark:divide-gray-800">
                {days.map((day, idx) => {
                    const dayBookings = getDayBookings(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "min-h-[120px] p-2 border-b bg-background transition-colors hover:bg-accent/50 group flex flex-col gap-1",
                                !isCurrentMonth && "bg-muted/30 text-muted-foreground"
                            )}
                        >
                            <span className={cn(
                                "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                                isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : "text-foreground"
                            )}>
                                {format(day, "d")}
                            </span>

                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[100px] scrollbar-hide">
                                {dayBookings.map(b => (
                                    <div
                                        key={b.id}
                                        className={cn(
                                            "text-[10px] p-1 rounded border-l-2 truncate leading-tight cursor-default",
                                            SPACES.find(s => s.id === b.spaceId)?.color.replace("bg-", "bg-opacity-20 bg-").replace("-500", "-100") || "bg-gray-100",
                                            SPACES.find(s => s.id === b.spaceId)?.color.replace("bg-", "border-") || "border-gray-500",
                                            "text-foreground"
                                        )}
                                        title={`${b.title} (${format(b.startTime, "HH:mm")} - ${format(b.endTime, "HH:mm")})`}
                                    >
                                        {format(b.startTime, "HH:mm")} {b.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
