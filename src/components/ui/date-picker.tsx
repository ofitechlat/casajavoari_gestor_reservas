"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { es } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface DatePickerProps {
  value?: string | Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Convert string to Date if necessary
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return value
    const parsed = new Date(value)
    return isValid(parsed) ? parsed : undefined
  }, [value])

  const [month, setMonth] = React.useState<Date | undefined>(selectedDate || new Date())
  const [inputValue, setInputValue] = React.useState("")

  // Sync inputValue with external value
  React.useEffect(() => {
    if (selectedDate) {
      setInputValue(format(selectedDate, "PPP", { locale: es }))
    } else {
      setInputValue("")
    }
  }, [selectedDate])

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date)
    setOpen(false)
  }

  const handleCalendarChange = (value: string, onChange: React.ChangeEventHandler<HTMLSelectElement>) => {
    const event = {
      target: { value },
    } as React.ChangeEvent<HTMLSelectElement>
    onChange(event)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInputValue(v)

    // Try to parse partial input? No, typically better to wait for blur or full match
    // For simplicity, if it's a valid date string we update
    const parsed = new Date(v)
    if (isValid(parsed)) {
      onChange?.(parsed)
      setMonth(parsed)
    }
  }

  return (
    <InputGroup className={cn(className)}>
      <InputGroupInput
        id="date"
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        className=" pr-10"
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        <Popover open={open} onOpenChange={setOpen} modal={false}>
          <PopoverTrigger asChild>
            <InputGroupButton
              id="date-picker-trigger"
              variant="ghost"
              disabled={disabled}
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Seleccionar fecha</span>
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent
            className="min-w-(--radix-popover-trigger-width) overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => {
              const target = e.target as HTMLElement
              if (
                target?.closest('[data-radix-portal]') ||
                target?.closest('[data-slot="select-content"]') ||
                target?.closest('[data-slot="select-item"]')
              ) {
                e.preventDefault()
              }
            }}
          >
            <Calendar
              captionLayout="dropdown"
              className="rounded-md border w-full"
              components={{
                MonthCaption: ({ children }) => <>{children}</>,
                DropdownNav: (props) => (
                  <div className="flex w-full items-center justify-between gap-2">{props.children}</div>
                ),
                Dropdown: (props) => (
                  <Select
                    onValueChange={(value) => {
                      if (props.onChange) {
                        handleCalendarChange(value, props.onChange);
                      }
                    }}
                    value={String(props.value)}
                  >
                    <SelectTrigger
                      className="first:flex-1 last:shrink-0"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {props.options?.map((option) => (
                        <SelectItem
                          disabled={option.disabled}
                          key={option.value}
                          value={String(option.value)}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ),
              }}
              hideNavigation
              mode="single"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleSelect}
              selected={selectedDate}
              startMonth={new Date(1900, 0)}
              endMonth={new Date(2100, 11)}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>

    </InputGroup>


  )
}
