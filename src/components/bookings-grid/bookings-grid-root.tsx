"use client";

import { useBookingsGridContext } from "./bookings-grid-context";
import { cn } from "@/lib/utils";

interface BookingsGridRootProps {
    children: React.ReactNode;
    className?: string;
}

export function BookingsGridRoot({ children, className }: BookingsGridRootProps) {
    const { totalColumns, totalRows } = useBookingsGridContext();

    return (
        <div className={cn("w-full overflow-auto border rounded-lg", className)}>
            <div
                className="grid relative min-w-max"
                style={{
                    gridTemplateColumns: `80px repeat(${totalColumns}, minmax(150px, 1fr))`,
                    gridTemplateRows: `auto repeat(${totalRows - 1}, 80px)`,
                }}
            >
                {children}
            </div>
        </div>
    );
}
