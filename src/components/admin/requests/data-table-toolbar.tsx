"use client"

import * as React from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group"
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"

const statusDotsVariants = cva("flex items-center w-3.5 shrink-0 h-3.5 border rounded-full gap-2", {
    variants: {
        status: {
            all: "bg-primary",
            pending: "bg-yellow-500",
            approved: "bg-green-500",
            rejected: "bg-red-500",
            cancelled: "bg-gray-500",
        }
    }
})

interface StatusDotsProps {
    status: "all" | "pending" | "approved" | "rejected" | "cancelled";
    className?: string;
}

function StatusDots({
    status,
    className
}: StatusDotsProps) {
    return (
        <div data-slot="status-dots" className={cn(statusDotsVariants({ status }), className)}>
            <span className="sr-only">{status}</span>
        </div>
    )
}



interface DataTableToolbarProps<TData> {
    table: Table<TData>
}

export function DataTableToolbar<TData>({
    table,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    const allStatuses: StatusDotsProps['status'][] = ['pending', 'approved', 'rejected', 'cancelled']

    // Estado local para los checkboxes seleccionados
    const [selectedStatuses, setSelectedStatuses] = React.useState<StatusDotsProps['status'][]>([])

    // Función para manejar el toggle de cada checkbox
    const handleStatusToggle = (status: StatusDotsProps['status']) => {
        const newSelectedStatuses = selectedStatuses.includes(status)
            ? selectedStatuses.filter(s => s !== status)
            : [...selectedStatuses, status]

        setSelectedStatuses(newSelectedStatuses)

        // Actualizar el filtro de la tabla
        // Si no hay selección, mostrar todos
        if (newSelectedStatuses.length === 0) {
            table.getColumn("status")?.setFilterValue(undefined)
        } else {
            // Pasar el array de estados seleccionados como valor del filtro
            table.getColumn("status")?.setFilterValue(newSelectedStatuses)
        }
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por título..."
                        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("title")?.setFilterValue(event.target.value)
                        }
                        className="pl-8 h-9"
                    />
                </div>
                {table.getColumn("status") && (
                    <ButtonGroup>
                        <Button variant="outline" className="max-w-[50px] min-w-[10px]">
                            <div
                                data-slot="status-group-dots"
                                className={cn("flex justify-center relative  items-center",
                                    selectedStatuses.length === 0 ? "gap-2" : "absolute"
                                )}
                            >
                                {selectedStatuses.length === 0 ? (
                                    // Mostrar todos los dots si no hay selección con espacio
                                    allStatuses.map((status) => (
                                        <StatusDots
                                            key={status}
                                            status={status}
                                            className="absolute"
                                        />
                                    ))
                                ) : (
                                    // Mostrar dots seleccionados apilados con overlap
                                    selectedStatuses.map((status, index) => (
                                        <StatusDots
                                            key={status}
                                            status={status}
                                            className={cn(
                                                "ring-2 ring-secondary",
                                                index > 0 && "-ml-1"
                                            )}
                                        />
                                    ))
                                )}
                            </div>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9">
                                    {selectedStatuses.length === 0
                                        ? "Todos"
                                        : `${selectedStatuses.length} seleccionado${selectedStatuses.length > 1 ? 's' : ''}`
                                    }
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                                <DropdownMenuCheckboxItem
                                    checked={selectedStatuses.includes('pending')}
                                    onCheckedChange={() => handleStatusToggle('pending')}
                                >
                                    <StatusDots status="pending" className="mr-2" />
                                    Pendiente
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={selectedStatuses.includes('approved')}
                                    onCheckedChange={() => handleStatusToggle('approved')}
                                >
                                    <StatusDots status="approved" className="mr-2" />
                                    Aprobada
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={selectedStatuses.includes('rejected')}
                                    onCheckedChange={() => handleStatusToggle('rejected')}
                                >
                                    <StatusDots status="rejected" className="mr-2" />
                                    Rechazada
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={selectedStatuses.includes('cancelled')}
                                    onCheckedChange={() => handleStatusToggle('cancelled')}
                                >
                                    <StatusDots status="cancelled" className="mr-2" />
                                    Cancelada
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </ButtonGroup>
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            table.resetColumnFilters()
                            setSelectedStatuses([])
                        }}
                        className="h-9 px-2 lg:px-3"
                    >
                        Limpiar
                        <Cross2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
