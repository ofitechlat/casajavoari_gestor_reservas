"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings, Conflict } from "@/contexts/BookingContext";
import { SPACES } from "@/data/mock";
import { SpaceId, NoiseLevel } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SpaceMap } from "@/components/space-map";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, CalendarDays, Settings } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { AdminSettingsDialog } from "@/components/admin-settings-dialog";

export function BookingForm() {
    const { user } = useAuth();
    const { addBooking, checkConflicts, bookings } = useBookings();

    const [isConfigOpen, setIsConfigOpen] = useState(false);

    const [spaceId, setSpaceId] = useState<SpaceId | "">("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [noiseLevel, setNoiseLevel] = useState<NoiseLevel>("moderate");
    const [needsSilence, setNeedsSilence] = useState(false);
    const [exclusive, setExclusive] = useState(false);

    // Recurrence State
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceFreq, setRecurrenceFreq] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
    const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]); // 0=Sun, 1=Mon

    // Reset status when inputs change
    React.useEffect(() => {
        setConflicts([]);
        setBypassWarning(false);
        setSuccess(false);
    }, [date, startTime, endTime, spaceId, isRecurring, recurrenceFreq, recurrenceEndDate, recurrenceDays, noiseLevel, needsSilence, exclusive]);

    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const [success, setSuccess] = useState(false);
    const [bypassWarning, setBypassWarning] = useState(false);

    const toggleDay = (day: number) => {
        setRecurrenceDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!spaceId || !date || !startTime || !endTime || !user) return;

        const start = new Date(`${date}T${startTime}`);
        const end = new Date(`${date}T${endTime}`);

        if (end <= start) {
            alert("La hora de fin debe ser después de la hora de inicio.");
            return;
        }

        const newBooking = {
            id: crypto.randomUUID(),
            userId: user.id,
            spaceId: spaceId as SpaceId,
            title,
            description,
            startTime: start,
            endTime: end,
            activityType: "Generic",
            noiseLevel,
            needsSilence,
            exclusive,
            status: user.role === 'admin' ? 'approved' : 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            recurrence: isRecurring ? {
                frequency: recurrenceFreq,
                daysOfWeek: recurrenceDays,
                endDate: recurrenceEndDate ? new Date(recurrenceEndDate) : undefined
            } : undefined
        };

        // @ts-ignore
        const foundConflicts = checkConflicts(newBooking as any);

        const hasErrors = foundConflicts.some(c => c.type === 'overlap');
        const hasWarnings = foundConflicts.length > 0 && !hasErrors;

        if (hasErrors) {
            setConflicts(foundConflicts);
            setSuccess(false);
            setBypassWarning(false);
        } else if (hasWarnings && !bypassWarning) {
            setConflicts(foundConflicts);
            setSuccess(false);
        } else {
            setConflicts([]);
            addBooking(newBooking as any);
            setSuccess(true);

            // Reset crucial fields
            setTitle("");
            setDescription("");
            setStartTime("");
            setEndTime("");
            setBypassWarning(false);
            setConflicts([]);
            // Don't reset space/date immediately for UX (easier for sequential bookings)
        }
    };

    // Fetch spaces on mount
    const [spaces, setSpaces] = React.useState<any[]>(SPACES);
    React.useEffect(() => {
        fetch('/api/spaces')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setSpaces(data);
            })
            .catch(err => console.error(err));
    }, []);

    // Helper to refresh spaces when dialog closes (in case updates occurred)
    const onDialogClose = (open: boolean) => {
        setIsConfigOpen(open);
        if (!open) {
            fetch('/api/spaces')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) setSpaces(data);
                });
        }
    }

    const getSpaceName = (id: string) => spaces.find(s => s.id === id)?.name || id;

    const daysOfWeek = [
        { id: 1, label: 'L' }, { id: 2, label: 'M' }, { id: 3, label: 'M' },
        { id: 4, label: 'J' }, { id: 5, label: 'V' }, { id: 6, label: 'S' }, { id: 0, label: 'D' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto my-8">
            {/* Left Column: Map & Space Info */}
            <div className="md:col-span-1 space-y-4">
                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Mapa de Espacios</CardTitle>
                        {user?.role === 'admin' && (
                            <Button variant="ghost" size="icon" title="Configurar Mapa" onClick={() => setIsConfigOpen(true)}>
                                <Settings className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <SpaceMap
                            spaces={spaces}
                            selectedSpaceId={spaceId as SpaceId}
                            onSelect={(id) => setSpaceId(id)}
                        />
                        {spaceId && (
                            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                                <span className="font-bold block text-primary">{getSpaceName(spaceId)}</span>
                                <span className="text-muted-foreground block text-xs mt-1">
                                    {SPACES.find(s => s.id === spaceId)?.description}
                                </span>
                                <span className="font-mono block mt-2 text-xs">
                                    Tarifa: ${SPACES.find(s => s.id === spaceId)?.hourlyRate}/hr
                                </span>
                            </div>
                        )}
                        {!spaceId && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm text-center text-muted-foreground italic">
                                Selecciona un espacio en el mapa o en el formulario.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Booking Form */}
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Nueva Solicitud</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Space & Date Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Espacio</label>
                                    <Select value={spaceId} onChange={(e) => setSpaceId(e.target.value as SpaceId)}>
                                        <option value="" disabled>Seleccionar...</option>
                                        {SPACES.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} (${s.hourlyRate}/hr)</option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Fecha Inicio</label>
                                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                                </div>
                            </div>

                            {/* Time Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Hora Inicio</label>
                                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Hora Fin</label>
                                    <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                                </div>
                            </div>

                            {/* Recurrence Section */}
                            <div className="border rounded-md p-3 bg-muted/20">
                                <div className="flex items-center space-x-2 mb-3">
                                    <input
                                        type="checkbox"
                                        id="recurring"
                                        checked={isRecurring}
                                        onChange={e => setIsRecurring(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="recurring" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                                        <CalendarDays className="w-4 h-4" />
                                        Repetir periodicamente
                                    </label>
                                </div>

                                {isRecurring && (
                                    <div className="space-y-3 pl-6 border-l-2 ml-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold uppercase text-muted-foreground">Frecuencia</label>
                                                <Select value={recurrenceFreq} onChange={(e) => setRecurrenceFreq(e.target.value as any)}>
                                                    <option value="weekly">Semanal</option>
                                                    <option value="daily">Diaria</option>
                                                    <option value="monthly">Mensual</option>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold uppercase text-muted-foreground">Hasta</label>
                                                <Input type="date" value={recurrenceEndDate} onChange={(e) => setRecurrenceEndDate(e.target.value)} required={isRecurring} />
                                            </div>
                                        </div>

                                        {recurrenceFreq === 'weekly' && (
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Días de la semana</label>
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

                            {/* Info */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Actividad / Título</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ej. Ensayo de Danza"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Descripción</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Detalles adicionales..."
                                    className="h-20"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Ruido</label>
                                    <Select value={noiseLevel} onChange={(e) => setNoiseLevel(e.target.value as NoiseLevel)}>
                                        <option value="silent">Silencioso</option>
                                        <option value="moderate">Moderado</option>
                                        <option value="loud">Ruidoso</option>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2 pt-8">
                                    <input
                                        type="checkbox"
                                        id="needsSilence"
                                        checked={needsSilence}
                                        onChange={e => setNeedsSilence(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="needsSilence" className="text-sm font-medium cursor-pointer">Requiere Silencio</label>
                                </div>
                                <div className="flex items-center space-x-2 pt-8">
                                    <input
                                        type="checkbox"
                                        id="exclusive"
                                        checked={exclusive}
                                        onChange={e => setExclusive(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="exclusive" className="text-sm font-medium cursor-pointer">Exclusividad</label>
                                </div>
                            </div>

                            {/* Conflicts Display */}
                            {conflicts.length > 0 && (
                                <div className={cn(
                                    "p-4 rounded-md space-y-3 mt-4",
                                    conflicts.some(c => c.type === 'overlap') ? "bg-red-50 text-red-900 border border-red-200" : "bg-yellow-50 text-yellow-900 border border-yellow-200"
                                )}>
                                    <div className="flex items-center gap-2 font-bold mb-2">
                                        {conflicts.some(c => c.type === 'overlap') ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                        <span>{conflicts.some(c => c.type === 'overlap') ? "No se puede agendar" : "Advertencia de Conflicto"}</span>
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
                                                Sopesar y Enviar de todos modos
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* If warning bypassed, show small reminder */}
                            {bypassWarning && conflicts.length > 0 && (
                                <div className="p-2 bg-yellow-100 text-yellow-800 text-sm rounded flex items-center gap-2 mt-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Se enviará a pesar de las advertencias.
                                </div>
                            )}

                            {success && (
                                <div className="p-4 bg-green-500/10 text-green-600 rounded-md flex items-center gap-2 mt-4">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Solicitud enviada correctamente.</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full mt-4"
                                disabled={conflicts.some(c => c.type === 'overlap') || (conflicts.length > 0 && !bypassWarning)}
                            >
                                {conflicts.length > 0 && bypassWarning ? "Confirmar Envío" : "Enviar Solicitud"}
                            </Button>

                        </form>
                    </CardContent >
                </Card >
            </div >
            <AdminSettingsDialog open={isConfigOpen} onOpenChange={setIsConfigOpen} />
        </div >
    );
}
