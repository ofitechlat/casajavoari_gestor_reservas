"use client";

import React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type TimePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function TimePicker({ value, onChange, placeholder }: TimePickerProps) {
  const parseTime = (time?: string) => {
    if (!time) {
      return { hour12: 12, minute: 0, meridiem: "AM" };
    }

    const [h, m] = time.split(":").map(Number);
    const meridiem = h >= 12 ? "PM" : "AM";
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;

    return { hour12, minute: m, meridiem };
  };

  const { hour12, minute, meridiem } = parseTime(value);

  const to24h = (h12: number, m: number, mer: string) => {
    let h24 = h12;

    if (mer === "AM" && h12 === 12) h24 = 0;
    if (mer === "PM" && h12 !== 12) h24 = h12 + 12;

    return `${h24.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}`;
  };

  const updateMeridiem = (newMeridiem: "AM" | "PM") => {
    onChange(to24h(hour12, minute, newMeridiem));
  };

  return (
    <InputGroup>
      <InputGroupInput
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />

      <InputGroupAddon align="inline-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <InputGroupButton variant="secondary" className="uppercase">
              {meridiem} <ChevronDown />
            </InputGroupButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => updateMeridiem("AM")}>
                AM
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateMeridiem("PM")}>
                PM
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </InputGroupAddon>
    </InputGroup>
  );
}
