"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings, useCreateBooking, useSpaces, useContacts, useActivities } from "@/hooks/queries";
import { checkConflicts } from "@/lib/booking-utils";
import { bookingSchema, type BookingFormValues } from "./schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SpaceMap } from "@/components/space-map";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AdminSettingsDialog } from "@/components/dialog/admin-settings-dialog";
import { Settings, AlertCircle, AlertTriangle, CheckCircle2, CalendarDays, Cog, Clock } from "lucide-react";
import { Conflict } from "@/lib/booking-utils";
import { SpaceId } from "@/types";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { DatePicker } from "@/components/ui/date-picker";
import { format, isValid, parseISO } from "date-fns";
import { ContactMultiSelect } from "@/components/ui/contact-multi-select";
import { ConflictAlerts } from "@/components/shared/conflict-alerts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { CheckboxCard } from "@/components/ui/checkbox-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";


export function BookingForm() {
  const { user } = useAuth();
  const { data: bookings = [] } = useBookings();
  const { data: activities = [] } = useActivities();
  const { data: spaces = [] } = useSpaces();
  const { data: contacts = [] } = useContacts();
  const createBookingMutation = useCreateBooking();

  const [isConfigOpen, setIsConfigOpen] = React.useState(false);
  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);
  const [bypassWarning, setBypassWarning] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      userId: user?.id ?? "",
      useManualContact: false,
      contactId: "",
      spaceId: "",
      date: "",
      startTime: "",
      endTime: "",
      title: "",
      description: "",
      responsibleContactIds: [] as string[],
      noiseLevel: "moderate" as const,
      needsSilence: false,
      exclusive: false,
      isRecurring: false,
      recurrenceFreq: "weekly" as const,
      recurrenceDays: [] as number[],
      recurrenceEndDate: "",
    },
  });

  const useManualContact = form.watch("useManualContact");
  const isRecurring = form.watch("isRecurring");
  const isNeedSilence = form.watch("needsSilence")
  const spaceId = form.watch("spaceId");

  // Reset status when inputs change
  React.useEffect(() => {
    setSuccess(false);
  }, [form.watch("date"), form.watch("startTime"), form.watch("endTime"), spaceId, isRecurring, activities, bookings]);

  async function onSubmit(values: BookingFormValues) {
    if (!user) return;

    const start = new Date(`${values.date}T${values.startTime}`);
    const end = new Date(`${values.date}T${values.endTime}`);

    const bookingData: any = {
      userId: values.useManualContact ? null : user.id,
      contactId: (values.useManualContact && values.contactId) ? values.contactId : null,
      spaceId: values.spaceId,
      title: values.title,
      description: values.description || null,
      responsibleContactIds: values.responsibleContactIds,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      noiseLevel: values.noiseLevel,
      needsSilence: values.needsSilence,
      exclusive: values.exclusive,
      status: (user?.user_metadata?.role === "admin") ? "approved" : "pending", // Gestors always create pending
      recurrence: values.isRecurring ? {
        frequency: values.recurrenceFreq,
        daysOfWeek: values.recurrenceDays,
        endDate: values.recurrenceEndDate ? new Date(values.recurrenceEndDate).toISOString() : undefined
      } : undefined
    };

    // Check conflicts
    const foundConflicts = checkConflicts(bookingData, bookings, activities);

    // Separate by severity
    const blockingConflicts = foundConflicts.filter(c => c.severity === 'blocking');
    const warningConflicts = foundConflicts.filter(c => c.severity === 'warning');

    // 1. If there are BLOCKING conflicts → Cannot create
    if (blockingConflicts.length > 0) {
      setConflicts(blockingConflicts);
      setSuccess(false);
      setBypassWarning(false);
      toast.error("No se puede crear la reserva. Hay conflictos que deben resolverse primero.");
      return;
    }

    // 2. If there are WARNING conflicts
    if (warningConflicts.length > 0) {
      setConflicts(warningConflicts);
      setSuccess(false);

      const isAdmin = user?.user_metadata?.role === 'admin';

      if (isAdmin) {
        // Admin can bypass warnings
        if (!bypassWarning) {
          toast.warning("Hay advertencias. Revisa y confirma para aprobar directamente.");
          return;
        }
      } else {
        // Normal user: will be created as pending
        if (!bypassWarning) {
          toast.info("Tu solicitud será revisada por un administrador debido a posibles conflictos. ¿Deseas continuar?");
          setBypassWarning(true); // Allow them to submit on next click
          return;
        }
      }
    }

    createBookingMutation.mutate(bookingData, {
      onSuccess: () => {
        setSuccess(true);
        const isAdmin = user?.user_metadata?.role === 'admin';
        const hasPendingStatus = bookingData.status === 'pending';

        if (isAdmin && bookingData.status === 'approved') {
          toast.success("Reserva aprobada correctamente");
        } else if (hasPendingStatus) {
          toast.success("Solicitud enviada. Un administrador la revisará pronto.");
        } else {
          toast.success("Reserva creada correctamente");
        }

        form.reset();
        setConflicts([]);
        setBypassWarning(false);
      },
      onError: (error) => {
        toast.error("Error al crear la reserva");
        console.error(error);
      }
    });
  }

  const getSpaceName = (id: string) => spaces.find(s => s.id === id)?.name || id;
  const selectedSpace = spaces.find(s => s.id === spaceId);

  return (
    <>




      <div className="flex-1 pb-4">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Información de Reserva</FieldLegend>
              <FieldDescription> Ingresa los detalles de tu solicitud. </FieldDescription>

              {/* Conflict Alerts */}
              <ConflictAlerts
                conflicts={conflicts}
                canBypass={user?.user_metadata?.role === 'admin' || conflicts.every(c => c.severity === 'warning')}
                onBypass={() => setBypassWarning(true)}
                className="mb-4"
              />

              <FieldGroup>

                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="booking-title">Actividad / Título</FieldLabel>
                      <Input {...field} id="booking-title" placeholder="Ej. Taller de Cerámica" />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="responsibleContactIds"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="booking-responsible">Responsables</FieldLabel>
                      <ContactMultiSelect
                        value={field.value as string[]}
                        onChange={field.onChange}
                        placeholder="Seleccionar contactos responsables..."
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />


                <Field>
                  <FieldLabel>Fecha</FieldLabel>
                  <Controller
                    name="date"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col gap-1">
                        <DatePicker
                          value={field.value}
                          onChange={(date) => {
                            field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                          }}
                          placeholder="Selecciona la fecha de reserva"
                        />

                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </div>
                    )}
                  />
                </Field>
                <Field>
                  <FieldLabel className="flex items-center justify-between">
                    <span>Espacio</span>
                    <Button
                      size='icon'
                      variant='ghost'
                      className="size-6 lg:hidden"
                      onClick={() => setIsConfigOpen(true)}
                    >
                      <Cog />
                    </Button>
                  </FieldLabel>
                  <Select value={spaceId} onValueChange={(val) => form.setValue("spaceId", val as SpaceId)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un espacio" />
                    </SelectTrigger>
                    <SelectContent>
                      {spaces.map(s => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Inicio</FieldLabel>

                    <Controller
                      name="startTime"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Hora inicio"
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </>
                      )}
                    />
                    <FieldDescription>
                      Formato de la hora: 12hrs
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel>Fin</FieldLabel>
                    <Controller
                      name="endTime"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Hora fin"
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </>
                      )}
                    />
                    <FieldDescription>
                      Formato de la hora: 12hrs
                    </FieldDescription>
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <FieldLegend>Detalles Adicionales</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="checkout-7j9-optional-comments"> Descripción </FieldLabel>
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Textarea
                        id="checkout-7j9-optional-comments"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Indica de qué se trata la actividad..."
                        className="resize-none h-24" />
                    )}
                  />
                </Field>

                <Field>
                  <FieldLabel>Permisos especiales</FieldLabel>
                  <Controller
                    name="exclusive"
                    control={form.control}
                    render={({ field }) => (
                      <CheckboxCard
                        label="Exclusividad"
                        description="¿Uso exclusivo del espacio?"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Controller
                    name="needsSilence"
                    control={form.control}
                    render={({ field }) => (
                      <CheckboxCard
                        label="Requiere silencio"
                        description="¿Necesitas que no haya ruidos?"
                        checked={field.value}
                        onCheckedChange={field.onChange}>
                        {!isNeedSilence && (
                          <Field>
                            <FieldLabel>Nivel de Ruido Esperado</FieldLabel>
                            <Select value={form.watch("noiseLevel")} onValueChange={(val) => form.setValue("noiseLevel", val as any)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="silent">Silencioso (Estudio, meditación)</SelectItem>
                                <SelectItem value="moderate">Moderado (Conversación, música suave)</SelectItem>
                                <SelectItem value="loud">Alto (Fiesta, amplificación, ensayo)</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                        )}
                      </CheckboxCard>
                    )}
                  />

                  <Controller
                    name="isRecurring"
                    control={form.control}
                    render={({ field }) => (
                      <CheckboxCard
                        label="Recurrencia"
                        description="¿Repetir periodicamente?"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      >
                        {isRecurring && (
                          <>
                            <FieldSet>
                              <Field>
                                <FieldLabel>Frecuencia</FieldLabel>
                                <Controller
                                  name="recurrenceFreq"
                                  control={form.control}
                                  render={({ field, fieldState }) => (
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="daily">Diaria</SelectItem>
                                        <SelectItem value="weekly">Semanal</SelectItem>
                                        <SelectItem value="monthly">Mensual</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </Field>
                              <Field>
                                <FieldLabel>Hasta (Fecha fin)</FieldLabel>
                                <Controller
                                  name="recurrenceEndDate"
                                  control={form.control}
                                  render={({ field, fieldState }) => (
                                    <div>
                                      <DatePicker
                                        value={field.value}
                                        onChange={(date) => {
                                          field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                                        }}
                                        placeholder="Fecha final de repeticion"
                                      />
                                      {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                      )}
                                    </div>
                                  )}
                                />
                              </Field>
                              {form.watch("recurrenceFreq") === "weekly" && (<Field>
                                <FieldLabel>Días que se repite</FieldLabel>
                                <div className="flex flex-wrap gap-2">
                                  {["D", "L", "M", "M", "J", "V", "S"].map((day, i) => {
                                    const days = form.watch("recurrenceDays") || [];
                                    const isSelected = days.includes(i);
                                    return (<Button key={i} type="button" variant={isSelected ? "default" : "outline"} className="w-10 h-10 p-0 rounded-full" onClick={() => {
                                      const next = isSelected ? days.filter(d => d !== i) : [...days, i];
                                      form.setValue("recurrenceDays", next);
                                    }}>
                                      {day}
                                    </Button>);
                                  })}
                                </div>
                              </Field>)}
                            </FieldSet>
                          </>
                        )}
                      </CheckboxCard>
                    )}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
            <Field orientation="horizontal" className="pt-6">
              <Button type="submit" disabled={createBookingMutation.isPending}>
                {createBookingMutation.isPending ? "Creando..." : "Enviar Solicitud"}
              </Button>
              <Button variant="outline" type="button" onClick={() => form.reset()}>
                Limpiar
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>

      {/* MAPA – STICKY */}
      <div className="flex-1 lg:h-full hidden lg:block sticky top-28  lg:p-0 overflow-hidden">
        <div className="relative">
          <SpaceMap
            selectedSpaceId={spaceId}
            spaces={spaces}
            onSelect={(id) => form.setValue("spaceId", id)}
          />
          {user?.user_metadata?.role === "admin" && (
            <Button
              className="absolute top-2 right-2 z-10"
              variant="outline"
              onClick={() => setIsConfigOpen(true)}
            >
              <Cog />
            </Button>
          )}
        </div>
        {spaceId && (
          <div className="mt-4 p-3 bg-muted rounded-md text-sm">
            <span className="font-bold block text-primary">{getSpaceName(spaceId)}</span>
            <span className="text-muted-foreground block text-xs mt-1">
              {selectedSpace?.description}
            </span>
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className="font-mono text-xs">
                Tarifa: ${selectedSpace?.hourlyRate}/hr
              </span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                {selectedSpace?.dimensions}
              </span>
            </div>
          </div>
        )}
        {!spaceId && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm text-center text-muted-foreground italic">
            Selecciona un espacio en el mapa o en el formulario.
          </div>
        )}
      </div>


      <AdminSettingsDialog
        open={isConfigOpen}
        onOpenChange={setIsConfigOpen}
      />
    </>
  );
}


