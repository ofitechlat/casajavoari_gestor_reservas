import { Booking, Activity } from "@/types";
import { Feature } from "@/components/kibo-ui/calendar";

export interface CalendarFeature extends Feature {
  type: 'rental' | 'activity_independent';
  spaceId: string;
  spaceName: string;
  nestedActivities?: Activity[];
  booking?: Booking;
  activity?: Activity;
}

export type BookingUserAvatarProps = {
  userId?: string;
  contactId?: string;
  responsible?: string[];
  responsibleContactIds?: string[];
  name?: string | string[];
  showName?: boolean;
  className?: string;
};
