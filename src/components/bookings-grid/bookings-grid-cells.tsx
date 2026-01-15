"use client";

import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useBookingsGridContext } from "./bookings-grid-context";
import { cn } from "@/lib/utils";

interface BookingsGridCellsProps {
    className?: string;
}

export function BookingsGridCells({ className }: BookingsGridCellsProps) {
    const { timeSlots, spaces } = useBookingsGridContext();

    return (
        <>
            {timeSlots.slice(0, -1).map((slot, rowIndex) =>
                spaces.map((space, colIndex) => (
                    <div
                        key={`${slot.hour}-${slot.minute}-${space.id}`}
                        className={cn("border-r group hover:bg-accent/10 border-b flex items-center justify-center last:border-r-0 relative", className)}
                        style={{
                            gridRow: rowIndex + 2,
                            gridColumn: colIndex + 2,
                        }}
                    >
                        <Button variant='outline' className='hidden group-hover:flex'>
                            <Plus /> Crear
                        </Button>
                    </div>
                ))
            )}
        </>
    );
}
