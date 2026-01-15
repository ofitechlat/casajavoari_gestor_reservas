import { useMemo } from "react";
import { Booking, Activity, Space } from "@/types";
import { CalendarFeature } from "../types";
import { COLOR_MAP, DEFAULT_COLOR } from "../constants";

export function useCalendarFeatures(
  bookings: Booking[],
  activities: Activity[],
  spaces: Space[],
  search: string = ""
) {
  return useMemo<CalendarFeature[]>(() => {
    let features: CalendarFeature[] = [];

    // 1. Process all explicit Bookings (Space Rentals)
    bookings
      .filter(b => b.status === 'approved' || b.status === 'pending')
      .forEach(booking => {
        const space = spaces.find(s => s.id === booking.spaceId);
        let color = DEFAULT_COLOR;

        if (space?.color) {
          color = COLOR_MAP[space.color] || color;
        }

        if (booking.status === 'pending') color = color + 'CC';

        const relatedActivities = activities.filter(act => {
          const usesSpace = act.spaces?.some(s => s.id === booking.spaceId);
          if (!usesSpace) return false;

          const bookingStart = new Date(booking.startTime).getTime();
          const bookingEnd = new Date(booking.endTime).getTime();
          const activityStart = new Date(act.startAt).getTime();
          const activityEnd = new Date(act.endAt).getTime();

          return (activityStart < bookingEnd && activityEnd > bookingStart);
        });

        features.push({
          id: booking.id || crypto.randomUUID(),
          name: booking.title,
          startAt: new Date(booking.startTime),
          endAt: new Date(booking.endTime),
          status: {
            id: booking.status,
            name: booking.status === 'approved' ? 'Aprobado' : 'Pendiente',
            color: color,
          },
          type: 'rental',
          spaceId: booking.spaceId,
          spaceName: space?.name || 'Espacio desconocido',
          nestedActivities: relatedActivities,
          booking: booking
        });
      });

    // 2. Process Activities
    activities.forEach(activity => {
      const startAt = new Date(activity.startAt);
      const endAt = new Date(activity.endAt);

      // Determine which spaces to show it in
      const activitySpaces = activity.spaces && activity.spaces.length > 0
        ? activity.spaces
        : [{ id: 'general', name: 'Casa Javorai' } as unknown as Space];

      activitySpaces.forEach(space => {
        const isCovered = features.some(f => {
          return f.type === 'rental' &&
            f.spaceId === space.id &&
            f.nestedActivities?.some((a) => a.id === activity.id);
        });

        if (!isCovered) {
          features.push({
            id: `agenda-${activity.id}-${space.id}`,
            name: activity.title,
            startAt,
            endAt,
            status: {
              id: 'activity',
              name: 'Evento Cultural',
              color: '#7c3aed', // Purple
            },
            type: 'activity_independent',
            spaceId: space.id,
            spaceName: space.name,
            activity: activity
          });
        }
      });
    });

    // 3. Apply Search Filtering
    if (search.trim()) {
      const searchTerms = search.toLowerCase().trim().split(/\s+/);
      features = features.filter(f => {
        const nameMatch = searchTerms.every(term => f.name.toLowerCase().includes(term));
        const spaceMatch = searchTerms.every(term => f.spaceName.toLowerCase().includes(term));
        const activityMatch = f.nestedActivities?.some(act =>
          searchTerms.every(term => act.title.toLowerCase().includes(term))
        );

        return nameMatch || spaceMatch || activityMatch;
      });
    }

    return features;
  }, [bookings, spaces, activities, search]);
}
