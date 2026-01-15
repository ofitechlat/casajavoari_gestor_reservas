"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useCalendarMonth, useCalendarYear, useCalendarContext } from "./context";
import { monthsForLocale, daysForLocale } from "./utils";

export const CalendarMonthTitle = () => {
  const [month] = useCalendarMonth();
  const { locale } = useCalendarContext();

  const monthName = monthsForLocale(locale, "short")[month].replace(/\.$/, "");

  return (
    <div className="flex items-center px-4 pb-1 gap-1 bg-sidebar border-b rounded-b">
      <h1 className="text-base font-bold uppercase">{monthName}</h1>
    </div>
  );
};

export const CalendarDayTitle = () => {
  const { locale, startDay } = useCalendarContext();

  const days = daysForLocale(locale, startDay);

  return (
    <div className="flex items-center gap-1 border-b">
      {days.map((day: string) => (
        <h2 key={day} className="text-xs font-bold uppercase">
          {day.slice(0, 3)}
        </h2>
      ))}
    </div>
  );
};

export const CalendarCurrentDay = () => {
  return (
    <div className="flex items-center py-2 justify-center">
      <span className="text-xl font-black tabular-nums tracking-tighter">
        {new Date().getDate()}
      </span>
    </div>
  );
};

export const CalendarDateRangeTitle = () => {
  const [month] = useCalendarMonth();
  const [year] = useCalendarYear();
  const { locale } = useCalendarContext();

  const date = new Date(year, month, 1);
  const formatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });

  return (
    <h1 className="text-xl font-bold capitalize">
      {formatter.format(date).replace(/ de /g, " ")}
    </h1>
  );
};

export const CalendarDateRangeDescription = () => {
  const [month] = useCalendarMonth();
  const [year] = useCalendarYear();
  const { locale } = useCalendarContext();

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const formatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formatDate = (date: Date) => {
    return formatter.format(date).replace(/\./g, "").replace(/ (\d{4})$/, ", $1");
  };

  return (
    <p className="text-sm text-muted-foreground">
      {formatDate(startDate)} - {formatDate(endDate)}
    </p>
  );
};

export type CalendarDatePickerProps = {
  className?: string;
  children: ReactNode;
};

export const CalendarDatePicker = ({
  className,
  children,
}: CalendarDatePickerProps) => (
  <div className={cn("flex items-center gap-1", className)}>{children}</div>
);
