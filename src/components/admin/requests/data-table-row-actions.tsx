"use client"

import { useState } from "react"
import { Row } from "@tanstack/react-table"
import { MoreHorizontal, CheckCircle2, XCircle, Eye } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useUpdateBooking, useBookings, useActivities } from "@/hooks/queries"
import { Booking } from "@/types"
import { checkConflicts } from "@/lib/booking-utils"
import { ConflictAlerts } from "../../shared/conflict-alerts"
import { BookingSheet } from "../../dashboard/calendar/components/booking-sheet"

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export function DataTableRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const booking = row.original as Booking
    const updateBooking = useUpdateBooking()
    const { data: allBookings = [] } = useBookings()
    const { data: allActivities = [] } = useActivities()
    const [bypassConflict, setBypassConflict] = useState(false)

    // Calculate conflicts for this specific booking
    const conflicts = checkConflicts(booking, allBookings, allActivities)
    const hasConflicts = conflicts.length > 0
    const hasBlocking = conflicts.some(c => c.severity === 'blocking')

    const [showApproveDialog, setShowApproveDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [showDetailsSheet, setShowDetailsSheet] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")

    const handleApprove = async () => {
        try {
            await updateBooking.mutateAsync({
                id: booking.id,
                data: { status: "approved" }
            })
            setShowApproveDialog(false)
        } catch (error) {
            // Error handled by the hook/toast
        }
    }

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Por favor, ingresa una razón para el rechazo")
            return
        }

        try {
            await updateBooking.mutateAsync({
                id: booking.id,
                data: {
                    status: "rejected",
                    rejectionReason: rejectionReason
                }
            })
            setShowRejectDialog(false)
            setRejectionReason("")
        } catch (error) {
            // Error handled by the hook/toast
        }
    }

    const handleCancel = async () => {
        try {
            await updateBooking.mutateAsync({
                id: booking.id,
                data: { status: "cancelled" }
            })
            setShowCancelDialog(false)
        } catch (error) {
            // Error handled by the hook/toast
        }
    }

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
                    <DropdownMenuSeparator />
                    {booking.status === "pending" && (
                        <>
                            <DropdownMenuItem
                                onSelect={() => setShowApproveDialog(true)}
                                className="text-green-600 focus:text-green-600"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Aprobar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setShowRejectDialog(true)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Rechazar
                            </DropdownMenuItem>
                        </>
                    )}
                    {booking.status === "approved" && (
                        <DropdownMenuItem
                            onSelect={() => setShowCancelDialog(true)}
                            className="text-red-600 focus:text-red-600"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Details Sheet */}
            <BookingSheet
                open={showDetailsSheet}
                onOpenChange={setShowDetailsSheet}
                eventId={booking.id}
            />

            {/* Approve Confirmation */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {hasConflicts ? "⚠️ Conflictos Detectados" : "¿Confirmas la aprobación?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-4">
                                <p>
                                    Esta acción aprobará la reserva para <strong>"{booking.title}"</strong>.
                                </p>

                                {hasConflicts && (
                                    <div className="mt-4 p-3 border rounded-lg bg-muted/30">
                                        <p className="text-sm font-bold mb-2 text-destructive">
                                            {hasBlocking ? "Hay choques directos de horario/espacio:" : "Advertencias de espacio:"}
                                        </p>
                                        <ConflictAlerts conflicts={conflicts} className="text-left" />
                                    </div>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBypassConflict(false)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleApprove()
                            }}
                            disabled={updateBooking.isPending || (hasConflicts && !bypassConflict && !hasBlocking) || (hasBlocking && !bypassConflict)}
                            className={hasConflicts ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}
                        >
                            {hasConflicts ? "Aprobar con Conflictos" : "Confirmar Aprobación"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    {hasConflicts && (
                        <div className="p-4 pt-0 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="bypass-approve"
                                checked={bypassConflict}
                                onChange={(e) => setBypassConflict(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary"
                            />
                            <Label htmlFor="bypass-approve" className="text-xs cursor-pointer">
                                Entiendo los conflictos y deseo proceder de todas formas
                            </Label>
                        </div>
                    )}
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rechazar Solicitud</DialogTitle>
                        <DialogDescription>
                            Ingresa el motivo del rechazo para informar al solicitante.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Motivo</Label>
                            <Textarea
                                id="reason"
                                placeholder="Ej: El espacio no está disponible para el uso solicitado..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={updateBooking.isPending || !rejectionReason.trim()}
                        >
                            Rechazar Solicitud
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Anular esta reserva?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esto marcará la reserva aprobada como cancelada. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Volver</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleCancel()
                            }}
                            disabled={updateBooking.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Anular Reserva
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
