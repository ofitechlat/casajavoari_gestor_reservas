"use client";

import { useMemo, type ReactNode } from "react";
import { getDay, getDaysInMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { useCalendarMonth, useCalendarYear, useCalendarContext } from "./context";
import type { Feature } from "./types";

type OutOfBoundsDayProps = {
  day: number;
};

const OutOfBoundsDay = ({ day }: OutOfBoundsDayProps) => (
  <div className="relative h-full w-full bg-secondary p-1 text-muted-foreground text-xs">
    {day}
  </div>
);

export type CalendarBodyProps = {
  features: Feature[];
  children?: (props: { feature: Feature }) => ReactNode;
  renderDay?: (props: { day: number, features: Feature[] }) => ReactNode;
};

export const CalendarBody = ({ features, children, renderDay }: CalendarBodyProps) => {
  const [month] = useCalendarMonth();
  const [year] = useCalendarYear();
  const { startDay } = useCalendarContext();

  // Memoize expensive date calculations
  const currentMonthDate = useMemo(
    () => new Date(year, month, 1),
    [year, month]
  );
  const daysInMonth = useMemo(
    () => getDaysInMonth(currentMonthDate),
    [currentMonthDate]
  );
  const firstDay = useMemo(
    () => (getDay(currentMonthDate) - startDay + 7) % 7,
    [currentMonthDate, startDay]
  );

  // Memoize previous month calculations
  const prevMonthData = useMemo(() => {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthDays = getDaysInMonth(new Date(prevMonthYear, prevMonth, 1));
    const prevMonthDaysArray = Array.from(
      { length: prevMonthDays },
      (_, i) => i + 1
    );
    return { prevMonthDays, prevMonthDaysArray };
  }, [month, year]);

  // Memoize next month calculations
  const nextMonthData = useMemo(() => {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonthDays = getDaysInMonth(new Date(nextMonthYear, nextMonth, 1));
    const nextMonthDaysArray = Array.from(
      { length: nextMonthDays },
      (_, i) => i + 1
    );
    return { nextMonthDaysArray };
  }, [month, year]);

  // Memoize features filtering by day
  const featuresByDay = useMemo(() => {
    const result: { [day: number]: Feature[] } = {};
    for (let day = 1; day <= daysInMonth; day++) {
      result[day] = features.filter((feature) => {
        const start = new Date(feature.startAt);
        const end = new Date(feature.endAt);

        const compareDate = new Date(year, month, day).setHours(0, 0, 0, 0);
        const startDate = new Date(start).setHours(0, 0, 0, 0);
        const endDate = new Date(end).setHours(0, 0, 0, 0);

        return compareDate >= startDate && compareDate <= endDate;
      });
    }
    return result;
  }, [features, daysInMonth, year, month]);

  const days: ReactNode[] = [];

  for (let i = 0; i < firstDay; i++) {
    const day =
      prevMonthData.prevMonthDaysArray[
      prevMonthData.prevMonthDays - firstDay + i
      ];

    if (day) {
      days.push(<OutOfBoundsDay day={day} key={`prev-${i}`} />);
    }
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const featuresForDay = featuresByDay[day] || [];

    days.push(
      <div
        className="relative flex h-full w-full flex-col gap-1 p-1 text-muted-foreground text-xs overflow-y-auto"
        key={day}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold">{day}</span>
        </div>

        {renderDay ? (
          renderDay({ day, features: featuresForDay })
        ) : (
          <>
            <div>
              {featuresForDay.slice(0, 3).map((feature) => children?.({ feature }))}
            </div>
            {featuresForDay.length > 3 && (
              <span className="block text-muted-foreground  text-[10px]">
                +{featuresForDay.length - 3} más
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  const remainingDays = 7 - ((firstDay + daysInMonth) % 7);
  if (remainingDays < 7) {
    for (let i = 0; i < remainingDays; i++) {
      const day = nextMonthData.nextMonthDaysArray[i];

      if (day) {
        days.push(<OutOfBoundsDay day={day} key={`next-${i}`} />);
      }
    }
  }

  return (
    <div className="grid grow grid-cols-7 bg-muted/20">
      {days.map((day, index) => (
        <div
          className={cn(
            "relative aspect-square overflow-hidden  border-t border-r bg-card",
            index % 7 === 6 && "border-r-0"
          )}
          key={index}
        >
          {day}
        </div>
      ))}
    </div>
  );
};
