"use client";

import { useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useCalendarContext } from "./context";
import { daysForLocale } from "./utils";

export type CalendarHeaderProps = {
  className?: string;
};

export const CalendarHeader = ({ className }: CalendarHeaderProps) => {
  const { locale, startDay } = useCalendarContext();

  const daysData = useMemo(() => {
    return daysForLocale(locale, startDay);
  }, [locale, startDay]);

  return (
    <div className={cn("grid grow grid-cols-7 border-t", className)}>
      {daysData.map((day) => (
        <div className="p-3 text-right text-muted-foreground border-r last:border-r-0 text-xs" key={day}>
          {day}
        </div>
      ))}
    </div>
  );
};

export type CalendarDateProps = {
  children: ReactNode;
  className?: string;
};

export const CalendarDate = ({ children, className }: CalendarDateProps) => (
  <div className={cn("flex items-center justify-between p-3", className)}>{children}</div>
);
