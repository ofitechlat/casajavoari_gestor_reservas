"use client";

import { useBookingsGridContext } from "./bookings-grid-context";
import { cn } from "@/lib/utils";

interface BookingsGridHeaderProps {
    className?: string;
    renderTimeHeader?: () => React.ReactNode;
    renderSpaceHeader?: (space: any, index: number) => React.ReactNode;
}

export function BookingsGridHeader({
    className,
    renderTimeHeader,
    renderSpaceHeader,
}: BookingsGridHeaderProps) {
    const { spaces } = useBookingsGridContext();

    return (
        <>
            {/* Time column header */}
            <div
                className={cn(
                    "sticky top-0 left-0 z-30 bg-background border-r border-b p-3 flex items-center justify-center",
                    className
                )}
                style={{ gridRow: 1, gridColumn: 1 }}
            >
                {renderTimeHeader ? (
                    renderTimeHeader()
                ) : (
                    <span className="text-sm font-medium text-muted-foreground">Time</span>
                )}
            </div>

            {/* Space column headers */}
            {spaces.map((space, index) => (
                <div
                    key={space.id}
                    className={cn(
                        "sticky top-0 z-20 bg-background border-r border-b last:border-r-0 p-3 flex items-center justify-center",
                        className
                    )}
                    style={{ gridRow: 1, gridColumn: index + 2 }}
                >
                    {renderSpaceHeader ? (
                        renderSpaceHeader(space, index)
                    ) : (
                        <span className="text-sm font-medium truncate">{space.name}</span>
                    )}
                </div>
            ))}
        </>
    );
}
