import * as z from "zod";

export const bookingSchema = z.object({
  userId: z.string(),
  contactId: z.string().optional(),
  useManualContact: z.boolean(),
  spaceId: z.string().min(1, "Selecciona un espacio"),
  date: z.string().min(1, "Fecha requerida"),
  startTime: z.string().min(1, "Hora inicio requerida"),
  endTime: z.string().min(1, "Hora fin requerida"),
  title: z.string().min(3, "Título de actividad requerido"),
  description: z.string().optional(),
  responsibleContactIds: z.array(z.string()).min(1, "Selecciona al menos un responsable"),
  noiseLevel: z.enum(["silent", "moderate", "loud"]),
  needsSilence: z.boolean(),
  exclusive: z.boolean(),
  isRecurring: z.boolean(),
  recurrenceFreq: z.enum(["daily", "weekly", "monthly"]).optional(),
  recurrenceEndDate: z.string().optional(),
  recurrenceDays: z.array(z.number()),
}).refine((data) => {
  if (data.useManualContact && !data.contactId) return false;
  return true;
}, {
  message: "Selecciona un contacto registrado",
  path: ["contactId"]
}).refine((data) => {
  if (data.startTime && data.endTime) {
    const start = new Date(`1970-01-01T${data.startTime}`);
    const end = new Date(`1970-01-01T${data.endTime}`);
    return end > start;
  }
  return true;
}, {
  message: "La hora de fin debe ser posterior",
  path: ["endTime"]
}).refine((data) => {
  if (data.isRecurring && !data.recurrenceEndDate) return false;
  return true;
}, {
  message: "La fecha de fin de recurrencia es requerida",
  path: ["recurrenceEndDate"]
});

export type BookingFormValues = z.infer<typeof bookingSchema>;


