"use client";

import { useCallback, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { useCalendarMonth, useCalendarYear } from "./context";
import type { CalendarState } from "./types";

export type CalendarDatePaginationProps = {
  className?: string;
};

export const CalendarDatePagination = ({
  className,
}: CalendarDatePaginationProps) => {
  const [month, setMonth] = useCalendarMonth();
  const [year, setYear] = useCalendarYear();

  const handlePreviousMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth((month - 1) as CalendarState["month"]);
    }
  }, [month, year, setMonth, setYear]);

  const handleNextMonth = useCallback(() => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth((month + 1) as CalendarState["month"]);
    }
  }, [month, year, setMonth, setYear]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button onClick={handlePreviousMonth} size="icon" variant="ghost">
        <ChevronLeftIcon size={16} />
      </Button>
      <Button onClick={handleNextMonth} size="icon" variant="ghost">
        <ChevronRightIcon size={16} />
      </Button>
    </div>
  );
};

export type CalendarDatePaginationLeftProps = {
  className?: string;
  variant?: "default" | "ghost" | "outline";
};

export const CalendarDatePaginationLeft = ({
  variant = "ghost",
  className,
  ...props
}: CalendarDatePaginationLeftProps) => {
  const [month, setMonth] = useCalendarMonth();
  const [year, setYear] = useCalendarYear();

  const handlePreviousMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth((month - 1) as CalendarState["month"]);
    }
  }, [month, year, setMonth, setYear]);

  return (
    <Button onClick={handlePreviousMonth} size="icon" variant={variant} className={cn(className)} {...props}>
      <ChevronLeftIcon size={16} />
    </Button>
  );
};

export type CalendarDatePaginationRightProps = {
  className?: string;
  variant?: "default" | "ghost" | "outline";
};

export const CalendarDatePaginationRight = ({
  className,
  variant = "ghost",
  ...props
}: CalendarDatePaginationRightProps) => {
  const [month, setMonth] = useCalendarMonth();
  const [year, setYear] = useCalendarYear();

  const handleNextMonth = useCallback(() => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth((month + 1) as CalendarState["month"]);
    }
  }, [month, year, setMonth, setYear]);

  return (
    <Button onClick={handleNextMonth} size="icon" variant={variant} className={cn(className)} {...props}>
      <ChevronRightIcon size={16} />
    </Button>
  );
};

export type CalendarDatePaginationTodayProps = {
  className?: string;
  variant?: "default" | "ghost" | "outline";
};

export const CalendarDatePaginationToday = ({
  className,
  variant = "ghost",
  ...props
}: CalendarDatePaginationTodayProps) => {
  const [, setMonth] = useCalendarMonth();
  const [, setYear] = useCalendarYear();

  const handleToday = useCallback(() => {
    setMonth(new Date().getMonth() as CalendarState["month"]);
    setYear(new Date().getFullYear());
  }, [setMonth, setYear]);

  return (
    <Button onClick={handleToday} variant={variant} className={cn("w-16", className)} {...props}>
      Hoy
    </Button>
  );
};

export type CalendarDatePaginationGroupProps = {
  className?: string;
  children: ReactNode;
};

export const CalendarDatePaginationGroup = ({
  className,
  children,
  ...props
}: CalendarDatePaginationGroupProps) => {
  return (
    <ButtonGroup {...props} className={cn(className)}>
      {children}
    </ButtonGroup>
  );
};
