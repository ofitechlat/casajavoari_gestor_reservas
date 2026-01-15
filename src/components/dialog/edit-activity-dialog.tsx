/**
 * Tutorial: Dialog Form correcto con shadcn/ui
 *
 * Principios:
 * - NO usar <Form /> (deprecated)
 * - Usar <Field /> como composición de UI
 * - RHF + Zod como estado y validación
 * - Controller solo cuando es necesario
 *
 * @author Allan Vélez González
 */

"use client";

import { TimePicker } from "@/components/ui/time-picker";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { compressImageToWebP } from "@/lib/image-utils";
import { useUpdateActivity } from "@/hooks/queries/useActivities";
import type { Activity } from "@/types";
import { ContactMultiSelect } from "@/components/ui/contact-multi-select";
import { useSpaces, useVentures, useBookings, useActivities } from "@/hooks/queries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { checkConflicts, type Conflict } from "@/lib/booking-utils";
import { ConflictAlerts } from "@/components/shared/conflict-alerts";
import { useAuth } from "@/contexts/AuthContext";

import {
  editActivitySchema,
  type EditActivityFormValues,
} from "@/schemas/activity-schemas";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "../ui/textarea";
import { ImageIcon, Loader2, Trash2 } from "lucide-react";

interface EditActivityDialogProps {
  activity: Activity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditActivityDialog({
  activity,
  open,
  onOpenChange,
}: EditActivityDialogProps) {
  const updateMutation = useUpdateActivity();
  const { data: spaces = [] } = useSpaces();
  const { data: ventures = [] } = useVentures();
  const { data: allBookings = [] } = useBookings();
  const { data: allActivities = [] } = useActivities();
  const { user } = useAuth();

  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);
  const [bypassWarning, setBypassWarning] = React.useState(false);

  const formatDateForInput = (date?: string | Date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().split("T")[0];
  };

  // Helper to convert array to string (for tags only)
  const arrayToString = (arr?: string[] | string): string => {
    if (!arr) return "";
    if (typeof arr === "string") return arr;
    return arr.join(", ");
  };

  // Helper to convert string to array (for tags only)
  const stringToArray = (str?: string): string[] => {
    if (!str) return [];
    return str.split(",").map(s => s.trim()).filter(Boolean);
  };

  const form = useForm<EditActivityFormValues>({
    resolver: zodResolver(editActivitySchema),
    defaultValues: {
      title: activity.title,
      description: activity.description ?? "",
      startDate: formatDateForInput(activity.startAt),
      endDate: formatDateForInput(activity.endAt),
      startTime: activity.startAt ? new Date(activity.startAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "",
      endTime: activity.endAt ? new Date(activity.endAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "",
      responsibleContactIds: activity.responsibleContactIds ?? [],
      imageUrl: activity.imageUrl ?? "",
      videoUrl: activity.videoUrl ?? "",
      instagram: activity.instagram ?? "",
      email: activity.email ?? "",
      tags: arrayToString(activity.tags),
      spaceIds: activity.spaces?.map((s) => s.id) ?? [],
      ventureId: activity.ventureId ?? "",
    },

  });

  useEffect(() => {
    if (open && activity) {
      form.reset({
        title: activity.title,
        description: activity.description ?? "",
        startDate: formatDateForInput(activity.startAt),
        endDate: formatDateForInput(activity.endAt),
        startTime: activity.startAt ? new Date(activity.startAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "",
        endTime: activity.endAt ? new Date(activity.endAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "",
        responsibleContactIds: activity.responsibleContactIds ?? [],
        imageUrl: activity.imageUrl ?? "",
        videoUrl: activity.videoUrl ?? "",
        instagram: activity.instagram ?? "",
        email: activity.email ?? "",
        tags: arrayToString(activity.tags),
        spaceIds: activity.spaces?.map((s) => s.id) ?? [],
        ventureId: activity.ventureId ?? "",
      });
    }
  }, [open, activity, form]);

  const onSubmit = (values: EditActivityFormValues) => {
    // Combine date and time for startAt and endAt
    const startAt = new Date(`${values.startDate}T${values.startTime || '00:00'}`);
    const endAt = values.endDate
      ? new Date(`${values.endDate}T${values.endTime || values.startTime || '23:59'}`)
      : new Date(startAt.getTime() + 2 * 60 * 60 * 1000); // Default 2h

    updateMutation.mutate(
      {
        id: activity.id,
        data: {
          ...values,
          startAt,
          endAt,
          tags: stringToArray(values.tags),
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  // Check conflicts in real-time
  const watchedValues = form.watch();
  useEffect(() => {
    if (watchedValues.startDate && watchedValues.startTime && watchedValues.spaceIds?.length > 0) {
      const startAt = new Date(`${watchedValues.startDate}T${watchedValues.startTime}`);
      const endAt = watchedValues.endDate
        ? new Date(`${watchedValues.endDate}T${watchedValues.endTime || watchedValues.startTime}`)
        : new Date(startAt.getTime() + 2 * 60 * 60 * 1000);

      const tempActivity = {
        id: activity.id,
        title: watchedValues.title || 'Actividad Editada',
        startAt,
        endAt,
        spaceIds: watchedValues.spaceIds,
      };

      const found = checkConflicts(tempActivity, allBookings, allActivities);
      setConflicts(found);
    } else {
      setConflicts([]);
    }
    setBypassWarning(false);
  }, [watchedValues.startDate, watchedValues.startTime, watchedValues.endDate, watchedValues.endTime, watchedValues.spaceIds, watchedValues.title, allBookings, allActivities, activity.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Actividad</DialogTitle>
        </DialogHeader>

        {/*         <EditActivityForm
          form={form}
          onSubmit={onSubmit}
          isLoading={updateMutation.isPending}
        /> */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="pt-4"
        >
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* EMPRENDIMIENTO (VENTURE) */}
            <Controller
              control={form.control}
              name="ventureId"
              render={({ field }) => (
                <Field className="md:col-span-2">
                  <FieldLabel>Emprendimiento / Artista Responsable</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar emprendimiento..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno (Independiente)</SelectItem>
                      {ventures.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Vincular esta actividad a un emprendimiento registrado
                  </FieldDescription>
                </Field>
              )}
            />

            {/* TÍTULO */}
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field
                  className="md:col-span-2"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor="title">
                    Título de la Actividad
                  </FieldLabel>
                  <Input
                    id="title"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            {/* DESCRIPCIÓN */}
            <Controller
              control={form.control}
              name="description"
              render={({ field }) => (
                <Field className="md:col-span-2">
                  <FieldLabel>Detalles de la Actividad</FieldLabel>
                  <Textarea {...field} />
                </Field>
              )}
            />

            {/* FECHA INICIO */}
            <Controller
              control={form.control}
              name="startDate"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Fecha de Inicio</FieldLabel>
                  <Input type="date" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            {/* FECHA FIN */}
            <Controller
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Fecha de Finalización</FieldLabel>
                  <Input type="date" {...field} />
                </Field>
              )}
            />

            {/* HORA INICIO */}
            <Controller
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Hora de Inicio</FieldLabel>
                  <TimePicker value={field.value} onChange={field.onChange} />
                </Field>
              )}
            />

            {/* RESPONSABLES (CONTACTOS) */}
            <Controller
              control={form.control}
              name="responsibleContactIds"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Responsable(s)</FieldLabel>
                  <ContactMultiSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccionar contactos responsables..."
                  />
                  <FieldDescription>
                    Selecciona los contactos responsables de esta actividad
                  </FieldDescription>
                </Field>
              )}
            />

            {/* VIDEO URL */}
            <Controller
              control={form.control}
              name="videoUrl"
              render={({ field, fieldState }) => (
                <Field className="md:col-span-2" data-invalid={fieldState.invalid}>
                  <FieldLabel>URL del Video</FieldLabel>
                  <Input
                    {...field}
                    type="url"
                    placeholder="https://youtube.com/..."
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            {/* INSTAGRAM */}
            <Controller
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Instagram</FieldLabel>
                  <Input
                    {...field}
                    placeholder="@usuario"
                  />
                </Field>
              )}
            />

            {/* EMAIL */}
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Email de Contacto</FieldLabel>
                  <Input
                    {...field}
                    type="email"
                    placeholder="contacto@ejemplo.com"
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            {/* TAGS */}
            <Controller
              control={form.control}
              name="tags"
              render={({ field }) => (
                <Field className="md:col-span-2">
                  <FieldLabel>Etiquetas</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Separar con comas"
                  />
                  <FieldDescription>
                    Ej: taller, conferencia, networking
                  </FieldDescription>
                </Field>
              )}
            />

            {/* IMAGEN */}
            <Controller
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <Field className="md:col-span-2">
                  <FieldLabel>Imagen</FieldLabel>

                  <div className="border-2 border-dashed rounded-xl p-4 flex justify-center">
                    {field.value ? (
                      <div className="relative w-full aspect-video">
                        <img
                          src={field.value}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => field.onChange("")}
                          className="absolute top-2 right-2 p-2 bg-destructive text-white rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer text-center">
                        <ImageIcon className="w-10 h-10 opacity-30 mx-auto" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            field.onChange(await compressImageToWebP(file));
                          }}
                        />
                      </label>
                    )}
                  </div>
                </Field>
              )}
            />

            {/* ESPACIOS */}
            <Controller
              control={form.control}
              name="spaceIds"
              render={({ field, fieldState }) => (
                <Field
                  className="md:col-span-2"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel>Espacios asignados</FieldLabel>

                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
                    {spaces.map((space) => {
                      const checked = field.value.includes(space.id);
                      return (
                        <label
                          key={space.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              e.target.checked
                                ? field.onChange([...field.value, space.id])
                                : field.onChange(
                                  field.value.filter((id) => id !== space.id)
                                )
                            }
                          />
                          {space.name}
                        </label>
                      );
                    })}
                  </div>

                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <div className="md:col-span-2">
              <ConflictAlerts
                conflicts={conflicts}
                canBypass={user?.user_metadata?.role === 'admin'}
                onBypass={() => setBypassWarning(true)}
                className="my-2"
              />
            </div>
          </FieldGroup>

          <DialogFooter className="pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || conflicts.some(c => c.severity === 'blocking') || (conflicts.length > 0 && !bypassWarning && user?.user_metadata?.role === 'admin')}
            >
              {updateMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}
