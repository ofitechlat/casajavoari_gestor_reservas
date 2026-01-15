"use client";

import { useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCalendarMonth, useCalendarYear, useCalendarContext } from "./context";
import { monthsForLocale } from "./utils";
import { Combobox } from "./combobox";
import type { CalendarState } from "./types";

export const CalendarDateSelect = Select;
export const CalendarDateSelectTrigger = SelectTrigger;
export const CalendarDateSelectValue = SelectValue;
export const CalendarDateSelectContent = SelectContent;
export const CalendarDateSelectItem = SelectItem;

export const CalendarDateDropdownMenu = DropdownMenu;
export const CalendarDateDropdownMenuTrigger = DropdownMenuTrigger;
export const CalendarDateDropdownMenuContent = DropdownMenuContent;
export const CalendarDateDropdownMenuItem = DropdownMenuItem;

export const CalendarDateSelectView = () => {
  const [view, setView] = useState("month");

  const handleViewSelect = (value: string) => {
    setView(value);
  };

  const views = [
    { icon: <CalendarIcon />, value: "month", label: "Month" },
    { icon: <CalendarIcon />, value: "week", label: "Week" },
    { icon: <CalendarIcon />, value: "day", label: "Day" },
  ];

  return (
    <CalendarDateSelect onValueChange={handleViewSelect} value={view}>
      <CalendarDateSelectTrigger>
        <CalendarDateSelectValue placeholder="Select a view" />
      </CalendarDateSelectTrigger>
      <CalendarDateSelectContent>
        {views.map((view) => (
          <CalendarDateSelectItem key={view.value} value={view.value}>
            <div className="flex items-center gap-2">
              {view.icon}
              <span>View {view.label}</span>
            </div>
          </CalendarDateSelectItem>
        ))}
      </CalendarDateSelectContent>
    </CalendarDateSelect>
  );
};

export type CalendarMonthPickerProps = {
  className?: string;
};

export const CalendarMonthPicker = ({
  className,
}: CalendarMonthPickerProps) => {
  const [month, setMonth] = useCalendarMonth();
  const { locale } = useCalendarContext();

  const monthData = useMemo(() => {
    return monthsForLocale(locale).map((month, index) => ({
      value: index.toString(),
      label: month,
    }));
  }, [locale]);

  return (
    <Combobox
      className={className}
      data={monthData}
      labels={{
        button: "Select month",
        empty: "No month found",
        search: "Search month",
      }}
      setValue={(value) =>
        setMonth(Number.parseInt(value, 10) as CalendarState["month"])
      }
      value={month.toString()}
    />
  );
};

export type CalendarYearPickerProps = {
  className?: string;
  start: number;
  end: number;
};

export const CalendarYearPicker = ({
  className,
  start,
  end,
}: CalendarYearPickerProps) => {
  const [year, setYear] = useCalendarYear();

  return (
    <Combobox
      className={className}
      data={Array.from({ length: end - start + 1 }, (_, i) => ({
        value: (start + i).toString(),
        label: (start + i).toString(),
      }))}
      labels={{
        button: "Select year",
        empty: "No year found",
        search: "Search year",
      }}
      setValue={(value) => setYear(Number.parseInt(value, 10))}
      value={year.toString()}
    />
  );
};
