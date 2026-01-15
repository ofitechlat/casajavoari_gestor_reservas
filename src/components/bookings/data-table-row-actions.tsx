"use client"

import { useState } from "react"
import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Booking } from "@/types"
import { BookingSheet } from "../dashboard/calendar/components/booking-sheet"
import { EditBookingDialog } from "@/components/dialog/edit-booking-dialog"

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export function DataTableRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const booking = row.original as Booking
    const [showDetailsSheet, setShowDetailsSheet] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => setShowDetailsSheet(true)}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setShowEditDialog(true)}
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Details Sheet */}
            <BookingSheet
                open={showDetailsSheet}
                onOpenChange={setShowDetailsSheet}
                eventId={booking.id}
            />

            {/* Edit Dialog */}
            {showEditDialog && (
                <EditBookingDialog
                    booking={booking}
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                />
            )}
        </>
    )
}
