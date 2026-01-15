"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Booking, BookingStatus } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    ArrowUpDown,
    Clock,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DataTableRowActions } from "./data-table-row-actions"
import { BookingUserAvatar } from "../dashboard/calendar/components/booking-avatar"

const getStatusBadge = (status: BookingStatus) => {
    const variants = {
        pending: {
            variant: "secondary" as const,
            label: "Pendiente",
            className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
        },
        approved: {
            variant: "default" as const,
            label: "Aprobada",
            className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
        },
        rejected: {
            variant: "destructive" as const,
            label: "Rechazada",
            className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
        },
        cancelled: {
            variant: "outline" as const,
            label: "Cancelada",
            className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
        },
    }

    const config = variants[status] || variants.pending
    return (
        <Badge variant={config.variant} className={config.className}>
            {config.label}
        </Badge>
    )
}

export const columns: ColumnDef<Booking>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Seleccionar todo"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Seleccionar fila"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ml-4"
                >
                    Título
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const booking = row.original
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{booking.title}</span>
                    {booking.description && (
                        <span className="text-sm text-muted-foreground line-clamp-1">
                            {booking.description}
                        </span>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "space",
        header: "Espacio",
        cell: ({ row }) => {
            const booking = row.original
            return (
                <span className="text-sm">
                    {booking.space?.name || "No especificado"}
                </span>
            )
        },
    },
    {
        accessorKey: "startTime",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ml-4"
                >
                    Fecha y Hora
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const booking = row.original
            return (
                <div className="flex flex-col text-sm">
                    <span className="font-medium">
                        {format(new Date(booking.startTime), "PPP", { locale: es })}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(booking.startTime), "h:mm a").toLowerCase()} - {format(new Date(booking.endTime), "h:mm a").toLowerCase()}
                    </span>
                </div>
            )
        },
    },
    {
        id: "responsible",
        header: "Responsables",
        cell: ({ row }) => {
            const booking = row.original
            return (
                <BookingUserAvatar
                    userId={booking.userId}
                    contactId={booking.contactId}
                    responsibleContactIds={booking.responsibleContactIds}
                    showName={false}
                />
            )
        },
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => getStatusBadge(row.getValue("status")),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
