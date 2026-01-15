import { areIntervalsOverlapping, addDays, addMonths, format } from "date-fns";
import { Booking, Activity } from "@/types";

// Conflict Types
export type ConflictSeverity = 'blocking' | 'warning' | 'info';

export interface Conflict {
  severity: ConflictSeverity;
  type: 'overlap' | 'noise' | 'exclusive';
  message: string;
  conflictingEventId?: string;
  conflictingEventTitle?: string;
  conflictingEventType?: 'booking' | 'activity';
  suggestion?: string;
}

export interface ConflictEvent {
  id: string;
  title: string;
  startTime: string | Date;
  endTime: string | Date;
  spaceIds: string[];
  noiseLevel?: string;
  needsSilence?: boolean;
  exclusive?: boolean;
  recurrence?: any;
  status: string;
  type: 'booking' | 'activity';
}

/**
 * Maps a Booking or Activity to a unified ConflictEvent for comparison
 */
export const mapToConflictEvent = (item: Booking | Activity | any): ConflictEvent => {
  if ('startAt' in item) {
    // It's an Activity
    return {
      id: item.id,
      title: item.title,
      startTime: item.startAt,
      endTime: item.endAt,
      spaceIds: item.spaceIds || item.spaces?.map((s: any) => s.id) || [],
      status: 'approved', // Activities are always considered "active"
      type: 'activity',
      // Activities are generally considered loud/exclusive for the spaces they occupy?
      // For now, let's treat them as standard overlaps
      noiseLevel: 'moderate',
      needsSilence: false,
      exclusive: false,
    };
  }

  // It's a Booking
  return {
    id: item.id,
    title: item.title,
    startTime: item.startTime,
    endTime: item.endTime,
    spaceIds: item.spaceId ? [item.spaceId] : [],
    noiseLevel: item.noiseLevel,
    needsSilence: item.needsSilence,
    exclusive: item.exclusive,
    recurrence: item.recurrence,
    status: item.status,
    type: 'booking',
  };
};

/**
 * Expand a conflict event into multiple time intervals based on its recurrence rules
 */
export const getEventInstances = (
  e: ConflictEvent,
  rangeStart: Date,
  rangeEnd: Date
): { start: Date; end: Date }[] => {
  const instances: { start: Date; end: Date }[] = [];
  const bStart = new Date(e.startTime);
  const bEnd = new Date(e.endTime);
  const duration = bEnd.getTime() - bStart.getTime();

  // Parse recurrence if it's a string
  let recurrence: any = e.recurrence;
  if (typeof recurrence === 'string') {
    try {
      recurrence = JSON.parse(recurrence);
    } catch (err) {
      recurrence = null;
    }
  }

  // If no recurrence, just the single instance
  if (!recurrence || recurrence.frequency === 'none') {
    if (areIntervalsOverlapping({ start: bStart, end: bEnd }, { start: rangeStart, end: rangeEnd })) {
      instances.push({ start: bStart, end: bEnd });
    }
    return instances;
  }

  // Recurrence Logic
  let current = new Date(bStart);
  const rEnd = recurrence.endDate ? new Date(recurrence.endDate) : addMonths(new Date(), 3);
  const effectiveEnd = new Date(Math.min(rEnd.getTime(), rangeEnd.getTime()));

  while (current <= effectiveEnd) {
    let matches = true;

    if (recurrence.frequency === 'weekly' && recurrence.daysOfWeek) {
      const day = current.getDay(); // 0-6
      if (!recurrence.daysOfWeek.includes(day)) {
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
    switch (recurrence.frequency) {
      case 'daily': current = addDays(current, 1); break;
      case 'weekly': current = addDays(current, 1); break;
      case 'monthly': current = addMonths(current, 1); break;
      default: current = addDays(current, 1); break;
    }
  }
  return instances;
};

/**
 * Unified conflict check for both Bookings and Activities
 */
export const checkConflicts = (
  newItem: any,
  allBookings: Booking[],
  allActivities: Activity[]
): Conflict[] => {
  const conflicts: Conflict[] = [];
  const newEvent = mapToConflictEvent(newItem);

  // 1. Determine Check Range
  const checkStart = new Date(newEvent.startTime);
  let newRecurrence: any = newEvent.recurrence;
  if (typeof newRecurrence === 'string') {
    try { newRecurrence = JSON.parse(newRecurrence); } catch (e) { }
  }

  const checkEnd = newRecurrence?.endDate
    ? new Date(newRecurrence.endDate)
    : (newRecurrence ? addMonths(checkStart, 3) : new Date(newEvent.endTime));

  // 2. Expand New Event Instances
  const newInstances = getEventInstances(newEvent, checkStart, checkEnd);

  // 3. Combine and Filter Existing Events
  const otherEvents = [
    ...allBookings.map(b => mapToConflictEvent(b)),
    ...allActivities.map(a => mapToConflictEvent(a))
  ].filter(
    (e) => (e.status === "approved" || e.status === "pending") && e.id !== newEvent.id
  );

  for (const existing of otherEvents) {
    const existingInstances = getEventInstances(existing, checkStart, checkEnd);

    for (const newInst of newInstances) {
      for (const exInst of existingInstances) {
        if (areIntervalsOverlapping(newInst, exInst)) {
          const dateStr = format(exInst.start, "dd/MM/yyyy HH:mm");
          const hasCommonSpace = existing.spaceIds.some(id => newEvent.spaceIds.includes(id));

          // A. Same Space Overlap - BLOCKING
          if (hasCommonSpace) {
            const prefix = existing.type === 'activity' ? 'Evento' : 'Reserva';
            const msg = `⛔ ${prefix} "${existing.title}" ya ocupa este lugar el ${dateStr}`;
            if (!conflicts.some(c => c.message.includes(dateStr) && c.conflictingEventId === existing.id)) {
              conflicts.push({
                severity: 'blocking',
                type: 'overlap',
                message: msg,
                conflictingEventId: existing.id,
                conflictingEventTitle: existing.title,
                conflictingEventType: existing.type,
                suggestion: 'Elige otro horario o espacio para tu solicitud'
              });
            }
          }

          // B. Noise / Silence / Exclusive (Only between bookings or contextually)
          // B.1 Noise Check - WARNING
          if (newEvent.needsSilence && existing.noiseLevel === 'loud') {
            if (!conflicts.some(c => c.type === 'noise' && c.conflictingEventId === existing.id)) {
              conflicts.push({
                severity: 'warning',
                type: 'noise',
                message: `⚠️ Hay una actividad ruidosa ("${existing.title}") el ${dateStr}`,
                conflictingEventId: existing.id,
                suggestion: 'Considera otro horario si necesitas silencio absoluto. Un admin revisará tu solicitud.'
              });
            }
          }
          if (newEvent.noiseLevel === 'loud' && existing.needsSilence) {
            if (!conflicts.some(c => c.type === 'noise' && c.conflictingEventId === existing.id)) {
              conflicts.push({
                severity: 'warning',
                type: 'noise',
                message: `⚠️ Tu actividad ruidosa coincide con "${existing.title}" que requiere silencio el ${dateStr}`,
                conflictingEventId: existing.id,
                suggestion: 'Un administrador revisará esta solicitud antes de aprobarla.'
              });
            }
          }

          // C. Exclusive - WARNING
          if ((existing.exclusive || newEvent.exclusive) && !hasCommonSpace) {
            if (!conflicts.some(c => c.type === 'exclusive' && c.conflictingEventId === existing.id)) {
              conflicts.push({
                severity: 'warning',
                type: 'exclusive',
                message: `⚠️ Conflicto de exclusividad con "${existing.title}" el ${dateStr}`,
                conflictingEventId: existing.id,
                suggestion: 'Hay una solicitud que requiere uso exclusivo del lugar. Un admin la revisará.'
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
};
