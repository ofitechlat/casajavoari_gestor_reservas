import { Booking, SpaceId, NoiseLevel } from "@/types";
import {
  areIntervalsOverlapping,
  addDays,
  addMonths,
  format
} from "date-fns";

// Conflict Types
export interface Conflict {
  type: 'overlap' | 'noise' | 'exclusive';
  message: string;
  conflictingBookingId?: string;
}

export function checkConflicts(newBooking: Booking, allBookings: Booking[]): Conflict[] {
  const conflicts: Conflict[] = [];

  // Helper to expand booking into time intervals
  const getInstances = (b: Booking, rangeStart: Date, rangeEnd: Date): { start: Date; end: Date }[] => {
    const instances: { start: Date; end: Date }[] = [];
    const bStart = new Date(b.startTime);
    const bEnd = new Date(b.endTime);
    const duration = bEnd.getTime() - bStart.getTime();

    let rec = b.recurrence;
    if (typeof rec === 'string') {
      try { rec = JSON.parse(rec); } catch (e) { }
    }

    // If no recurrence, just the single instance
    // @ts-ignore
    if (!rec || rec.frequency === 'none') {
      if (areIntervalsOverlapping({ start: bStart, end: bEnd }, { start: rangeStart, end: rangeEnd })) {
        instances.push({ start: bStart, end: bEnd });
      }
      return instances;
    }

    // Recurrence Logic
    let current = new Date(bStart);
    // Normalize recurrence data
    // (already normalized above)

    // @ts-ignore
    const rEnd = rec.endDate ? new Date(rec.endDate) : addMonths(new Date(), 3);
    const effectiveEnd = new Date(Math.min(rEnd.getTime(), rangeEnd.getTime()));

    while (current <= effectiveEnd) {
      let matches = true;

      // @ts-ignore
      if (rec.frequency === 'weekly' && rec.daysOfWeek) {
        const day = current.getDay(); // 0-6
        // @ts-ignore
        if (!rec.daysOfWeek.includes(day)) {
          matches = false;
        }
      }

      if (matches) {
        const instanceStart = new Date(current);
        const instanceEnd = new Date(current.getTime() + duration);

        if (areIntervalsOverlapping({ start: instanceStart, end: instanceEnd }, { start: rangeStart, end: rangeEnd })) {
          instances.push({ start: instanceStart, end: instanceEnd });
        }
      }

      // Advance
      // @ts-ignore
      switch (rec.frequency) {
        case 'daily': current = addDays(current, 1); break;
        case 'weekly': current = addDays(current, 1); break;
        case 'monthly': current = addMonths(current, 1); break;
        default: current = addDays(current, 1); break;
      }
    }
    return instances;
  };

  const checkStart = new Date(newBooking.startTime);
  // Normalize recurrence data for boundary check
  let newRec = newBooking.recurrence;
  if (typeof newRec === 'string') {
    try { newRec = JSON.parse(newRec); } catch (e) { }
  }

  // @ts-ignore
  const checkEnd = newRec?.endDate
    // @ts-ignore
    ? new Date(newRec.endDate)
    : (newRec ? addMonths(checkStart, 3) : new Date(newBooking.endTime));

  const newInstances = getInstances(newBooking, checkStart, checkEnd);

  const activeBookings = allBookings.filter(
    (b) => (b.status === "approved" || b.status === "pending") && b.id !== newBooking.id
  );

  for (const existing of activeBookings) {
    const existingInstances = getInstances(existing, checkStart, checkEnd);

    for (const newInst of newInstances) {
      for (const exInst of existingInstances) {
        if (areIntervalsOverlapping(newInst, exInst)) {
          const dateStr = format(exInst.start, "dd/MM/yyyy HH:mm");

          if (existing.spaceId === newBooking.spaceId) {
            const msg = `El espacio ya está ocupado el ${dateStr}`;
            if (!conflicts.some(c => c.message.includes(dateStr) && c.conflictingBookingId === existing.id)) {
              conflicts.push({
                type: 'overlap',
                message: msg,
                conflictingBookingId: existing.id
              });
            }
          }

          if (newBooking.needsSilence && existing.noiseLevel === 'loud') {
            if (!conflicts.some(c => c.type === 'noise' && c.conflictingBookingId === existing.id)) {
              conflicts.push({
                type: 'noise',
                message: `Ruido (${dateStr}): Tu actividad requiere silencio pero hay otra ruidosa.`,
                conflictingBookingId: existing.id
              });
            }
          }
          if (newBooking.noiseLevel === 'loud' && existing.needsSilence) {
            if (!conflicts.some(c => c.type === 'noise' && c.conflictingBookingId === existing.id)) {
              conflicts.push({
                type: 'noise',
                message: `Ruido (${dateStr}): Tu actividad es ruidosa y choca con una silenciosa.`,
                conflictingBookingId: existing.id
              });
            }
          }

          if ((existing.exclusive || newBooking.exclusive) && existing.spaceId !== newBooking.spaceId) {
            if (!conflicts.some(c => c.type === 'exclusive' && c.conflictingBookingId === existing.id)) {
              conflicts.push({
                type: 'exclusive',
                message: `Exclusividad (${dateStr}): Conflicto de uso exclusivo del lugar.`,
                conflictingBookingId: existing.id
              });
            }
          }
        }
      }
      if (conflicts.length > 5) break;
    }
    if (conflicts.length > 5) break;
  }

  return conflicts;
}
