"use client";

import React, { useState } from "react";
import { useBookings } from "@/contexts/BookingContext";
import { useAuth } from "@/contexts/AuthContext";
import { SPACES, MOCK_USERS } from "@/data/mock";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AlertTriangle, Repeat, Pencil } from "lucide-react";
import { EditBookingDialog } from "@/components/edit-booking-dialog";
import { Booking } from "@/types";

export function BookingList() {
    const { bookings, updateBookingStatus, checkConflicts } = useBookings();
    const { user } = useAuth();
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

    const sortedBookings = [...bookings].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const pendingBookings = sortedBookings.filter(b => b.status === "pending");
    const approvedBookings = sortedBookings.filter(b => b.status === "approved");
    const rejectedBookings = sortedBookings.filter(b => b.status === "rejected");

    const getSpaceName = (id: string) => SPACES.find(s => s.id === id)?.name || id;
    const getUserName = (id: string) => MOCK_USERS.find(u => u.id === id)?.name || "Usuario Desconocido";

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getRecurrenceText = (booking: Booking) => {
        if (!booking.recurrence || booking.recurrence.frequency === 'none') return null;
        const freqMap: any = { daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensual' };
        const end = booking.recurrence.endDate ? format(new Date(booking.recurrence.endDate), "dd/MM/yyyy") : "sin fecha fin";
        let days = "";
        if (booking.recurrence.daysOfWeek && booking.recurrence.daysOfWeek.length > 0) {
            const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            days = booking.recurrence.daysOfWeek.map(d => dayNames[d]).join(", ");
        }
        return `${freqMap[booking.recurrence.frequency]} ${days ? `(${days})` : ''} - Hasta ${end}`;
    }

    const BookingCard = ({ booking }: { booking: Booking }) => {
        // Conflict check only relevant for Pending usually, or if Admin checks for issues
        const conflicts = user?.role === 'admin' && booking.status === 'pending'
            ? checkConflicts(booking)
            : [];

        const recurrenceText = getRecurrenceText(booking);

        return (
            <Card className="overflow-hidden bg-card/50 hover:bg-card transition-colors relative group">
                <div className="flex md:flex-row flex-col">
                    <div className={cn("w-2 md:w-2 md:h-auto h-2", SPACES.find(s => s.id === booking.spaceId)?.color || "bg-gray-500")} />

                    <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    {booking.title}
                                    {recurrenceText && <span title="Repetitiva"><Repeat className="w-4 h-4 text-muted-foreground" /></span>}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {getSpaceName(booking.spaceId)} • Solicitado por {getUserName(booking.userId)}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", getStatusColor(booking.status))}>
                                    {booking.status === 'approved' ? 'Aprobado' : booking.status === 'pending' ? 'Pendiente' : booking.status}
                                </span>
                            </div>
                        </div>

                        {recurrenceText && (
                            <div className="mb-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                                ↺ Repetición: {recurrenceText}
                            </div>
                        )}

                        {booking.description && (
                            <div className="mb-4 text-sm bg-muted/30 p-3 rounded-md italic text-muted-foreground">
                                "{booking.description}"
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                            <div>
                                <span className="block text-muted-foreground text-xs uppercase tracking-wider">Fecha Inicio</span>
                                <span className="font-medium capitalize">{format(booking.startTime, "EEEE d 'de' MMMM", { locale: es })}</span>
                            </div>
                            <div>
                                <span className="block text-muted-foreground text-xs uppercase tracking-wider">Horario</span>
                                <span className="font-medium">{format(booking.startTime, "HH:mm")} - {format(booking.endTime, "HH:mm")}</span>
                            </div>
                            <div>
                                <span className="block text-muted-foreground text-xs uppercase tracking-wider">Ruido</span>
                                <span className="font-medium capitalize">{booking.noiseLevel === 'loud' ? 'Alto 🔊' : booking.noiseLevel === 'silent' ? 'Silencio 🤫' : 'Moderado'}</span>
                            </div>
                            <div>
                                <span className="block text-muted-foreground text-xs uppercase tracking-wider">Exclusividad</span>
                                <span className="font-medium">{booking.exclusive ? "Sí ⭐" : "No"}</span>
                            </div>
                        </div>

                        {/* Conflicts */}
                        {conflicts.length > 0 && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md">
                                <p className="text-red-800 font-bold text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Conflictos Detectados:
                                </p>
                                <ul className="list-disc list-inside text-xs text-red-700 mt-1">
                                    {conflicts.map((c, i) => (
                                        <li key={i}>{c.message}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 justify-end pt-4 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mr-auto text-muted-foreground hover:text-foreground"
                                onClick={() => setEditingBooking(booking)}
                            >
                                <Pencil className="w-4 h-4 mr-2" /> Editar / Ver Detalles
                            </Button>

                            {user?.role === 'admin' && booking.status === 'pending' && (
                                <>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => updateBookingStatus(booking.id, 'rejected')}
                                    >
                                        Rechazar
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => updateBookingStatus(booking.id, 'approved')}
                                    >
                                        Aprobar Solicitud
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <>
            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="pending">Pendientes ({pendingBookings.length})</TabsTrigger>
                    <TabsTrigger value="approved">Aprobadas ({approvedBookings.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {pendingBookings.length === 0 && <div className="text-center py-10 text-muted-foreground">No hay solicitudes pendientes.</div>}
                    {pendingBookings.map(b => <BookingCard key={b.id} booking={b} />)}
                </TabsContent>

                <TabsContent value="approved" className="space-y-4">
                    {approvedBookings.length === 0 && <div className="text-center py-10 text-muted-foreground">No hay reservas aprobadas.</div>}
                    {approvedBookings.map(b => <BookingCard key={b.id} booking={b} />)}
                </TabsContent>
            </Tabs>

            {editingBooking && (
                <EditBookingDialog
                    booking={editingBooking}
                    open={!!editingBooking}
                    onOpenChange={(open) => !open && setEditingBooking(null)}
                />
            )}
        </>
    );
}
