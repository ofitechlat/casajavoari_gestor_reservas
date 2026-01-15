"use client";

import { useBookingsGridContext } from "./bookings-grid-context";
import { cn } from "@/lib/utils";

interface BookingsGridTimeSlotsProps {
    className?: string;
    renderTimeSlot?: (slot: any, index: number) => React.ReactNode;
}

export function BookingsGridTimeSlots({
    className,
    renderTimeSlot,
}: BookingsGridTimeSlotsProps) {
    const { timeSlots } = useBookingsGridContext();

    return (
        <>
            {timeSlots.slice(0, -1).map((slot, index) => (
                <div
                    key={`${slot.hour}-${slot.minute}`}
                    className={cn(
                        "sticky left-0 z-10 bg-background border-r border-b p-3 flex items-center justify-center",
                        className
                    )}
                    style={{
                        gridRow: index + 2,
                        gridColumn: 1,
                    }}
                >
                    {renderTimeSlot ? (
                        renderTimeSlot(slot, index)
                    ) : (
                        <span className="text-xs text-muted-foreground font-medium">
                            {slot.time}
                        </span>
                    )}
                </div>
            ))}
        </>
    );
}
