"use client";

import { TimePicker } from "@/components/ui/time-picker";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, AlertTriangle, CheckCircle2, CalendarDays, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookings, useUpdateBooking, useSpaces, useActivities } from "@/hooks/queries";
import { checkConflicts, type Conflict } from "@/lib/booking-utils";
import { ConflictAlerts } from "@/components/shared/conflict-alerts";
import type { Booking } from "@/services/bookings.service";

interface EditBookingDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBookingDialog({ booking, open, onOpenChange }: EditBookingDialogProps) {
  const { user } = useAuth();
  const { data: allBookings = [] } = useBookings();
  const { data: allActivities = [] } = useActivities();
  const { data: spaces = [] } = useSpaces();
  const updateBookingMutation = useUpdateBooking();

  // Form State
  const [title, setTitle] = useState(booking.title);
  const [spaceId, setSpaceId] = useState(booking.spaceId);
  const [description, setDescription] = useState(booking.description || "");
  const [date, setDate] = useState(format(new Date(booking.startTime), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState(format(new Date(booking.startTime), "HH:mm"));
  const [endTime, setEndTime] = useState(format(new Date(booking.endTime), "HH:mm"));

  const [noiseLevel, setNoiseLevel] = useState(booking.noiseLevel);
  const [needsSilence, setNeedsSilence] = useState(booking.needsSilence || false);
  const [exclusive, setExclusive] = useState(booking.exclusive || false);

  // Recurrence State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFreq, setRecurrenceFreq] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);

  // Logic State
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [bypassWarning, setBypassWarning] = useState(false);

  const toggleDay = (day: number) => {
    setRecurrenceDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const daysOfWeek = [
    { id: 1, label: 'L' }, { id: 2, label: 'M' }, { id: 3, label: 'M' },
    { id: 4, label: 'J' }, { id: 5, label: 'V' }, { id: 6, label: 'S' }, { id: 0, label: 'D' }
  ];

  // Reset state when booking prop changes
  useEffect(() => {
    if (booking) {
      setTitle(booking.title);
      setSpaceId(booking.spaceId);
      setDescription(booking.description || "");
      const s = new Date(booking.startTime);
      const e = new Date(booking.endTime);
      setDate(format(s, "yyyy-MM-dd"));
      setStartTime(format(s, "HH:mm"));
      setEndTime(format(e, "HH:mm"));
      setNoiseLevel(booking.noiseLevel);
      setNeedsSilence(booking.needsSilence || false);
      setExclusive(booking.exclusive || false);

      // Parse recurrence
      if (booking.recurrence) {
        let rec = booking.recurrence;
        if (typeof rec === 'string') {
          try { rec = JSON.parse(rec); } catch (e) { }
        }

        if (rec && typeof rec === 'object') {
          const r = rec as any;
          setIsRecurring(true);
          setRecurrenceFreq(r.frequency || 'weekly');
          setRecurrenceDays(r.daysOfWeek || []);
          if (r.endDate) {
            setRecurrenceEndDate(format(new Date(r.endDate), "yyyy-MM-dd"));
          }
        }
      } else {
        setIsRecurring(false);
        setRecurrenceFreq('weekly');
        setRecurrenceDays([]);
        setRecurrenceEndDate("");
      }
    }
  }, [booking]);

  // Reset validation state when inputs change
  useEffect(() => {
    setConflicts([]);
    setBypassWarning(false);
  }, [spaceId, date, startTime, endTime, noiseLevel, needsSilence, exclusive, isRecurring, recurrenceFreq, recurrenceEndDate, recurrenceDays]);

  const isValidDate = (d: Date) => d instanceof Date && !isNaN(d.getTime());

  // Check conflicts logic 
  useEffect(() => {
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (isValidDate(start) && isValidDate(end) && end > start && spaceId) {
      const tempBooking: Booking = {
        ...booking,
        title,
        spaceId,
        description,
        startTime: start,
        endTime: end,
        noiseLevel,
        needsSilence,
        exclusive,
        recurrence: isRecurring ? {
          frequency: recurrenceFreq,
          daysOfWeek: recurrenceDays,
          endDate: recurrenceEndDate ? new Date(recurrenceEndDate) : undefined
        } : undefined
      };

      let found = checkConflicts(tempBooking, allBookings, allActivities);
      setConflicts(found);
    }
  }, [spaceId, date, startTime, endTime, noiseLevel, needsSilence, exclusive, booking, title, description, isRecurring, recurrenceFreq, recurrenceDays, recurrenceEndDate, allBookings, allActivities]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (end <= start) {
      alert("La hora de fin debe ser después de la hora de inicio.");
      return;
    }

    const hasOverlap = conflicts.some(c => c.type === 'overlap');
    if (hasOverlap) return;

    // Determine status logic here
    const newStatus = user?.role === 'admin' ? booking.status : 'pending';

    updateBookingMutation.mutate({
      id: booking.id,
      data: {
        title,
        spaceId,
        description,
        startTime: start,
        endTime: end,
        noiseLevel,
        needsSilence,
        exclusive,
        status: newStatus,
        recurrence: isRecurring ? {
          frequency: recurrenceFreq,
          daysOfWeek: recurrenceDays,
          endDate: recurrenceEndDate ? new Date(recurrenceEndDate) : undefined
        } : undefined,
      }
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Solicitud</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title & Space */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Actividad / Título</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Espacio</Label>
              <Select value={spaceId} onValueChange={(val) => setSpaceId(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {spaces.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {spaceId && (
                <div className="text-[10px] text-muted-foreground mt-1 flex justify-between">
                  <span>Capacidad: {spaces.find(s => s.id === spaceId)?.capacity || 'N/A'} pers.</span>
                  <span className="font-bold">Dim: {spaces.find(s => s.id === spaceId)?.dimensions}</span>
                </div>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Inicio</Label>
              <TimePicker value={startTime} onChange={setStartTime} />
            </div>
            <div className="space-y-2">
              <Label>Fin</Label>
              <TimePicker value={endTime} onChange={setEndTime} />
            </div>
          </div>

          {/* Recurrence Section */}
          <div className="border rounded-md p-3 bg-muted/20">
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                id="edit-recurring"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="edit-recurring" className="flex items-center gap-2 cursor-pointer">
                <CalendarDays className="w-4 h-4" />
                Repetir periodicamente
              </Label>
            </div>

            {isRecurring && (
              <div className="space-y-3 pl-6 border-l-2 ml-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Frecuencia</Label>
                    <Select value={recurrenceFreq} onValueChange={(val) => setRecurrenceFreq(val as any)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="daily">Diaria</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Hasta</Label>
                    <Input type="date" value={recurrenceEndDate} onChange={(e) => setRecurrenceEndDate(e.target.value)} required={isRecurring} />
                  </div>
                </div>

                {recurrenceFreq === 'weekly' && (
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground block mb-1">Días de la semana</Label>
                    <div className="flex gap-2 flex-wrap">
                      {daysOfWeek.map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleDay(d.id)}
                          className={cn(
                            "w-8 h-8 rounded-full text-xs font-bold transition-colors border",
                            recurrenceDays.includes(d.id)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-muted text-muted-foreground border-input"
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="h-20"
            />
          </div>

          {/* Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-2">
              <Label>Nivel de Ruido</Label>
              <Select value={noiseLevel} onValueChange={(val: any) => setNoiseLevel(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="silent">Silencioso</SelectItem>
                  <SelectItem value="moderate">Moderado</SelectItem>
                  <SelectItem value="loud">Ruidoso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="edit-needsSilence"
                checked={needsSilence}
                onChange={e => setNeedsSilence(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="edit-needsSilence" className="cursor-pointer">Requiere Silencio</Label>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="edit-exclusive"
                checked={exclusive}
                onChange={e => setExclusive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="edit-exclusive" className="cursor-pointer">Exclusividad</Label>
            </div>
          </div>

          {/* Conflicts Display Section */}
          <ConflictAlerts
            conflicts={conflicts}
            canBypass={user?.role === 'admin' || conflicts.every(c => c.severity === 'warning')}
            onBypass={() => setBypassWarning(true)}
            className="mt-4"
          />

          {/* Friendly Reminder if Bypassed */}
          {bypassWarning && conflicts.length > 0 && (
            <div className="p-2 bg-yellow-100 text-yellow-800 text-sm rounded flex items-center gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4" />
              Se guardará a pesar de las advertencias.
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateBookingMutation.isPending}>Cancelar</Button>
            <Button
              type="submit"
              disabled={updateBookingMutation.isPending || conflicts.some(c => c.type === 'overlap') || (conflicts.length > 0 && !bypassWarning)}
            >
              {updateBookingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {conflicts.length > 0 && bypassWarning ? "Confirmar Cambio" : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
