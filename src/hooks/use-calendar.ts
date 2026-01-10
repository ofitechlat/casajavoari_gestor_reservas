import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
} from "date-fns";

export function useCalendar(initialDate: Date = new Date()) {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);

  // Get calendar grid days (including prev/next month days)
  const startDate = startOfWeek(firstDay, { weekStartsOn: 1 }); // Start Monday
  const endDate = endOfWeek(lastDay, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const isToday = (day: Date) => isSameDay(day, new Date());
  const isCurrentMonth = (day: Date) => isSameMonth(day, currentDate);

  return {
    currentDate,
    setCurrentDate,
    days,
    nextMonth,
    prevMonth,
    firstDay,
    lastDay,
    isToday,
    isCurrentMonth,
  };
}

export type UseCalendarReturn = ReturnType<typeof useCalendar>;
