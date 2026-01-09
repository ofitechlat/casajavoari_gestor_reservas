"use client";

import React, { useState, useEffect } from "react";
import { Booking, SpaceId, NoiseLevel } from "@/types";
import { useBookings, Conflict } from "@/contexts/BookingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, AlertTriangle, CheckCircle2, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SPACES } from "@/data/mock";

interface EditBookingDialogProps {
    booking: Booking;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditBookingDialog({ booking, open, onOpenChange }: EditBookingDialogProps) {
    const { user } = useAuth();
    const { checkConflicts, updateBookingStatus, bookings } = useBookings();

    // Form State
    const [title, setTitle] = useState(booking.title);
    const [spaceId, setSpaceId] = useState<SpaceId>(booking.spaceId);
    const [description, setDescription] = useState(booking.description || "");
    const [date, setDate] = useState(format(booking.startTime ? new Date(booking.startTime) : new Date(), "yyyy-MM-dd"));
    const [startTime, setStartTime] = useState(format(booking.startTime ? new Date(booking.startTime) : new Date(), "HH:mm"));
    const [endTime, setEndTime] = useState(format(booking.endTime ? new Date(booking.endTime) : new Date(), "HH:mm"));

    const [noiseLevel, setNoiseLevel] = useState<NoiseLevel>(booking.noiseLevel);
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
            if (booking.startTime) {
                const s = new Date(booking.startTime);
                const e = new Date(booking.endTime);
                setDate(format(s, "yyyy-MM-dd"));
                setStartTime(format(s, "HH:mm"));
                setEndTime(format(e, "HH:mm"));
            }
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
                    setIsRecurring(true);
                    // @ts-ignore
                    setRecurrenceFreq(rec.frequency || 'weekly');
                    // @ts-ignore
                    setRecurrenceDays(rec.daysOfWeek || []);
                    // @ts-ignore
                    if (rec.endDate) {
                        setRecurrenceEndDate(format(new Date(rec.endDate), "yyyy-MM-dd"));
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
            const tempBooking = {
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

            // @ts-ignore
            let found = checkConflicts(tempBooking);

            // Remove conflicts with itself
            found = found.filter(c => c.conflictingBookingId !== booking.id);

            setConflicts(found);
        }
    }, [spaceId, date, startTime, endTime, noiseLevel, needsSilence, exclusive, booking, title, description, isRecurring, recurrenceFreq, recurrenceDays, recurrenceEndDate]);


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

        // Determine status logic here as well
        const newStatus = user?.role === 'admin' ? booking.status : 'pending';

        const updatedBooking = {
            ...booking,
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
            } : null,
            updatedAt: new Date()
        };

        try {
            const res = await fetch(`/api/bookings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedBooking)
            });

            if (res.ok) {
                onOpenChange(false);
                window.location.reload();
            } else {
                alert("Error al actualizar");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }
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
                            <Select value={spaceId} onChange={(e) => setSpaceId(e.target.value as SpaceId)}>
                                {SPACES.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (${s.hourlyRate}/hr)</option>
                                ))}
                            </Select>
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
                            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Fin</Label>
                            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
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
                                        <Select value={recurrenceFreq} onChange={(e) => setRecurrenceFreq(e.target.value as any)}>
                                            <option value="weekly">Semanal</option>
                                            <option value="daily">Diaria</option>
                                            <option value="monthly">Mensual</option>
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
                            <Select value={noiseLevel} onChange={(e) => setNoiseLevel(e.target.value as NoiseLevel)}>
                                <option value="silent">Silencioso</option>
                                <option value="moderate">Moderado</option>
                                <option value="loud">Ruidoso</option>
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
                    {conflicts.length > 0 && (
                        <div className={cn(
                            "p-4 rounded-md space-y-3 mt-4",
                            conflicts.some(c => c.type === 'overlap') ? "bg-red-50 text-red-900 border border-red-200" : "bg-yellow-50 text-yellow-900 border border-yellow-200"
                        )}>
                            <div className="flex items-center gap-2 font-bold mb-2">
                                {conflicts.some(c => c.type === 'overlap') ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                <span>{conflicts.some(c => c.type === 'overlap') ? "Conflicto: No se puede guardar" : "Advertencia de Conflicto"}</span>
                            </div>

                            <ul className="list-disc pl-5 text-sm space-y-2">
                                {conflicts.map((c, i) => {
                                    const bookingTitle = bookings && c.conflictingBookingId
                                        ? bookings.find(b => b.id === c.conflictingBookingId)?.title
                                        : c.conflictingBookingId;

                                    return (
                                        <li key={i} className={c.type === 'overlap' ? "text-red-700 font-medium" : "text-yellow-700"}>
                                            <div>
                                                <span className="font-semibold block">{c.message}</span>
                                                {bookingTitle && (
                                                    <div className="text-xs opacity-90 mt-1 pl-2 border-l-2 border-current">
                                                        <p>Choca con: <strong>{bookingTitle}</strong></p>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            {!conflicts.some(c => c.type === 'overlap') && !bypassWarning && (
                                <div className="pt-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={(e) => { e.preventDefault(); setBypassWarning(true); }}
                                        className="w-full bg-yellow-200 hover:bg-yellow-300 text-yellow-900 border-none"
                                    >
                                        Sopesar y Guardar de todos modos
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Friendly Reminder if Bypassed */}
                    {bypassWarning && conflicts.length > 0 && (
                        <div className="p-2 bg-yellow-100 text-yellow-800 text-sm rounded flex items-center gap-2 mt-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Se guardará a pesar de las advertencias.
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button
                            type="submit"
                            disabled={conflicts.some(c => c.type === 'overlap') || (conflicts.length > 0 && !bypassWarning)}
                        >
                            {conflicts.length > 0 && bypassWarning ? "Confirmar Cambio" : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
