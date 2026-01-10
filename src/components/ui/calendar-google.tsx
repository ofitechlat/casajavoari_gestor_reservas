"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { useCalendar, UseCalendarReturn } from "@/hooks/use-calendar";

/* -------------------------------------------------------------------------- */
/*                                    CONTEXT                                 */
/* -------------------------------------------------------------------------- */

interface CalendarGoogleContextValue extends UseCalendarReturn {
  renderDay?: (props: { day: Date }) => React.ReactNode;
}

const CalendarGoogleContext =
  React.createContext<CalendarGoogleContextValue | null>(null);

export function useCalendarGoogle() {
  const context = React.useContext(CalendarGoogleContext);
  if (!context) {
    throw new Error("useCalendarGoogle must be used within CalendarGoogle");
  }
  return context;
}

/* -------------------------------------------------------------------------- */
/*                                   ROOT                                     */
/* -------------------------------------------------------------------------- */

interface CalendarGoogleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline";
  renderDay?: (props: { day: Date }) => React.ReactNode;
}

function CalendarGoogle({
  className,
  variant = "default",
  renderDay,
  ...props
}: CalendarGoogleProps) {
  const calendar = useCalendar();

  return (
    <CalendarGoogleContext.Provider value={{ ...calendar, renderDay }}>
      <div
        data-slot="calendar-google"
        className={cn(
          "bg-card text-card-foreground flex flex-col border shadow-sm rounded-xl overflow-hidden",
          className
        )}
        {...props}
      >
        <CalendarGoogleHeader />
        <CalendarGoogleWeekDays />
        <CalendarGoogleMonthGrid />
      </div>
    </CalendarGoogleContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   HEADER                                   */
/* -------------------------------------------------------------------------- */

const calendarGoogleHeaderVariants = cva(
  "p-4 flex items-center justify-between border-b"
);

function CalendarGoogleHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { currentDate, prevMonth, nextMonth } = useCalendarGoogle();

  return (
    <div
      className={cn(calendarGoogleHeaderVariants(), className)}
      {...props}
    >
      <CalendarGoogleTitle month={currentDate} />
      <CalendarGoogleToolbar>
        <CalendarGoogleMonthButton onClick={prevMonth}>
          <ChevronLeft className="w-4 h-4" />
        </CalendarGoogleMonthButton>
        <CalendarGoogleMonthButton onClick={nextMonth}>
          <ChevronRight className="w-4 h-4" />
        </CalendarGoogleMonthButton>
      </CalendarGoogleToolbar>
    </div>
  );
}

function CalendarGoogleTitle({
  month,
  className,
}: {
  month: Date;
  className?: string;
}) {
  return (
    <h2 className={cn("text-lg font-bold capitalize", className)}>
      {format(month, "MMMM yyyy", { locale: es })}
    </h2>
  );
}

function CalendarGoogleToolbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex gap-1", className)} {...props} />;
}

function CalendarGoogleMonthButton(
  props: React.ComponentProps<typeof Button>
) {
  return <Button size="icon" variant="outline" {...props} />;
}

/* -------------------------------------------------------------------------- */
/*                                WEEK DAYS                                   */
/* -------------------------------------------------------------------------- */

function CalendarGoogleWeekDays() {
  return (
    <div className="grid grid-cols-7 bg-muted/50 border-b">
      {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
        <div
          key={day}
          className="p-2 text-center text-xs font-semibold text-muted-foreground uppercase"
        >
          {day}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 MONTH GRID                                 */
/* -------------------------------------------------------------------------- */

function CalendarGoogleMonthGrid({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { days, isToday, isCurrentMonth } = useCalendarGoogle();

  return (
    <div
      data-slot="calendar-google-month-grid"
      className={cn(
        "grid grid-cols-7 divide-x divide-y divide-gray-100 dark:divide-gray-800",
        className
      )}
      {...props}
    >
      {days.map((day) => (
        <CalendarGoogleDayCell
          key={day.toISOString()}
          day={day}
          today={isToday(day)}
          inMonth={isCurrentMonth(day)}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  DAY CELL                                  */
/* -------------------------------------------------------------------------- */

interface CalendarGoogleDayCellProps {
  day: Date;
  today: boolean;
  inMonth: boolean;
}

function CalendarGoogleDayCell({
  day,
  today,
  inMonth,
}: CalendarGoogleDayCellProps) {
  const { renderDay } = useCalendarGoogle();

  return (
    <div
      className={cn(
        "min-h-[120px] p-2 border-b bg-background transition-colors hover:bg-accent/50 flex flex-col gap-1",
        !inMonth && "bg-muted/30 text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
          today
            ? "bg-primary text-primary-foreground"
            : "text-foreground"
        )}
      >
        {format(day, "d")}
      </span>

      <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[100px] scrollbar-hide">
        {renderDay?.({ day })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   EXPORTS                                  */
/* -------------------------------------------------------------------------- */

export { CalendarGoogle };
