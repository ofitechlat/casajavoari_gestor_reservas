"use client";

import React, { useState } from "react";
import { useBookings, useUpdateBooking, useSpaces, useActivities } from "@/hooks/queries";
import { useAuth } from "@/contexts/AuthContext";
import { checkConflicts } from "@/lib/booking-utils";
import { type Booking } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AlertTriangle, Repeat, Pencil } from "lucide-react";
import { EditBookingDialog } from "@/components/dialog/edit-booking-dialog";

export function BookingList() {
  const { data: bookings = [] } = useBookings();
  const { data: activities = [] } = useActivities();
  const { data: spaces = [] } = useSpaces();
  const updateBookingMutation = useUpdateBooking();
  const { user } = useAuth();
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const pendingBookings = sortedBookings.filter(b => b.status === "pending");
  const approvedBookings = sortedBookings.filter(b => b.status === "approved");
  const rejectedBookings = sortedBookings.filter(b => b.status === "rejected");

  const getSpaceName = (id: string) => spaces.find(s => s.id === id)?.name || id;
  const getUserName = (booking: Booking) => {
    if (booking.user) {
      return (booking.user as any).name || (booking.user as any).email || "Usuario";
    }
    return "Usuario";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRecurrenceText = (booking: Booking) => {
    if (!booking.recurrence) return null;
    let rec = booking.recurrence;

    const r = rec as any;
    if (!r || r.frequency === 'none') return null;

    const freqMap: any = { daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensual' };
    const end = r.endDate ? format(new Date(r.endDate), "dd/MM/yyyy") : "sin fecha fin";
    let days = "";
    if (r.daysOfWeek && r.daysOfWeek.length > 0) {
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      days = r.daysOfWeek.map((d: number) => dayNames[d]).join(", ");
    }
    return `${freqMap[r.frequency]} ${days ? `(${days})` : ''} - Hasta ${end}`;
  }

  const BookingCard = ({ booking }: { booking: Booking }) => {
    // Conflict check only relevant for Pending usually, or if Admin checks for issues
    const conflicts = user?.role === 'admin' && booking.status === 'pending'
      ? checkConflicts(booking, bookings, activities)
      : [];

    const recurrenceText = getRecurrenceText(booking);

    return (
      <Card className="overflow-hidden bg-card/50 hover:bg-card transition-colors relative group">
        <div className="flex md:flex-row flex-col">
          <div className={cn("w-2 md:w-2 md:h-auto h-2", spaces.find(s => s.id === booking.spaceId)?.color || "bg-gray-500")} />

          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {booking.title}
                  {recurrenceText && <span title="Repetitiva"><Repeat className="w-4 h-4 text-muted-foreground" /></span>}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getSpaceName(booking.spaceId)} ({spaces.find(s => s.id === booking.spaceId)?.dimensions || 'N/A'}) • Solicitado por {getUserName(booking)}
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
                <span className="font-medium capitalize">{format(new Date(booking.startTime), "EEEE d 'de' MMMM", { locale: es })}</span>
              </div>
              <div>
                <span className="block text-muted-foreground text-xs uppercase tracking-wider">Horario</span>
                <span className="font-medium">{format(new Date(booking.startTime), "HH:mm")} - {format(new Date(booking.endTime), "HH:mm")}</span>
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
                    disabled={updateBookingMutation.isPending}
                    onClick={() => booking.id && updateBookingMutation.mutate({ id: booking.id, data: { status: 'rejected' } })}
                  >
                    Rechazar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    disabled={updateBookingMutation.isPending}
                    onClick={() => booking.id && updateBookingMutation.mutate({ id: booking.id, data: { status: 'approved' } })}
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
