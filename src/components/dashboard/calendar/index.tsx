"use client";

import { useBookings } from "@/hooks/queries/useBookings";
import { useSpaces } from "@/hooks/queries";
import { useActivities } from "@/hooks/queries";
import {
  CalendarBody,
  CalendarHeader,
  CalendarProvider,
  CalendarDatePagination,
  CalendarDate,
  CalendarMonthTitle,
  CalendarDatePaginationLeft,
  CalendarDatePaginationRight,
  CalendarDatePaginationGroup,
  CalendarDatePaginationToday,
  CalendarDateDropdownMenu,
  CalendarDateDropdownMenuTrigger,
  CalendarDateDropdownMenuContent,
  CalendarDateDropdownMenuItem,
  CalendarDateSelect,
  CalendarDateSelectTrigger,
  CalendarDateSelectValue,
  CalendarDateSelectContent,
  CalendarDateSelectItem,
  CalendarDateSelectView,
  CalendarDayTitle,
  CalendarCurrentDay,
  CalendarDateRangeTitle,
  CalendarDateRangeDescription
} from "@/components/kibo-ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";

import { useCalendarFeatures } from "./hooks/use-calendar-features";
import { BookingUserAvatar } from "./components/booking-avatar";
import { BookingCalendarHoverCard } from "./components/booking-hover-card";
import { BookingSheet } from "./components/booking-sheet";
import { CalendarFeature } from "./types";
import { Activity } from "@/types";
import { SearchInput } from "@/components/ui/search-input";



export default function CalendarView() {
  const { data: bookings = [] } = useBookings();
  const { data: activities = [] } = useActivities();
  const { data: spaces = [] } = useSpaces();

  const [openModal, setOpenModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [view, setView] = useState("month");
  const [search, setSearch] = useState("");

  const bookingFeatures = useCalendarFeatures(bookings, activities, spaces, search);

  const handleViewSelect = (value: string) => {
    setView(value);
  }

  const handleSearch = (value: string) => {
    setSearch(value);
  }

  return (
    <>

      <CalendarProvider className=" shadow-sm h-full border rounded-md overflow-hidden bg-card" locale="es-ES" startDay={1}>
        <CalendarDate className="items-start w-full ">
          {/*           <div data-slot='month-title'>
            <CalendarMonthTitle />
          </div> */}

          {/* container month */}
          <div className="flex gap-2 w-full">
            <div className="border-border border w-fit overflow-hidden rounded">
              <div className="flex flex-col items-center">
                <CalendarMonthTitle />
                <CalendarCurrentDay />
              </div>
            </div>
            <div className="flex items-start gap-2 w-full">
              <div className="flex flex-col gap-1 w-full">
                <CalendarDateRangeTitle />
                <CalendarDateRangeDescription />
              </div>
            </div>
          </div>


          <div className="flex items-start pt-2 gap-4 justify-between h-full">
            <SearchInput value={search} onChange={handleSearch} onSubmit={() => { }} />
            <CalendarDatePaginationGroup data-slot='pagination-group'>
              <CalendarDatePaginationLeft variant="outline" />
              <CalendarDatePaginationToday className="w-16" variant="outline" />
              <CalendarDatePaginationRight variant="outline" />
            </CalendarDatePaginationGroup>

            <CalendarDateSelectView />

          </div>

        </CalendarDate>
        <CalendarHeader />
        <CalendarBody
          features={bookingFeatures}
          renderDay={({ features }) => {
            if (features.length === 0) return null;

            return (
              <div className="flex flex-col gap-1.5 mt-1">
                {features.map((feature: any) => {
                  // Determine background color based on type
                  const bgClass = feature.type === 'activity_independent'
                    ? "bg-purple-100/80 dark:bg-purple-950/40"
                    : "bg-blue-100/80 dark:bg-blue-950/40";

                  return (
                    <HoverCard key={feature.id}>
                      <HoverCardTrigger asChild>
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedBookingId(feature.id);
                            setOpenModal(true);
                          }}
                          className={cn(
                            "flex flex-col gap-0.5 p-2 rounded-md border-l-4 shadow-sm cursor-pointer hover:opacity-80 transition-all text-left overflow-hidden",
                            bgClass
                          )}
                          style={{
                            borderColor: feature.status.color
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold opacity-70" style={{ color: feature.status.color }}>
                              {format(feature.startAt, "h:mm a").toLowerCase()}
                            </span>
                            <span className="text-[9px] font-medium text-muted-foreground">
                              {feature.spaceName}
                            </span>
                          </div>
                          <div className="text-sm font-bold leading-tight truncate">
                            {feature.name}
                          </div>
                          {feature.activity?.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {feature.activity.description}
                            </div>
                          )}
                        </div>
                      </HoverCardTrigger>
                      <BookingCalendarHoverCard feature={feature} />
                    </HoverCard>
                  );
                })}
              </div>
            );
          }}
        />
      </CalendarProvider>

      <BookingSheet
        open={openModal}
        onOpenChange={setOpenModal}
        eventId={selectedBookingId}
      />
    </>
  );
}
