"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBookings } from "@/hooks/queries";
import { useQuery } from "@tanstack/react-query";
import spacesService from "@/services/spaces.service";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "@/components/bookings/columns";
import { DataTableToolbar } from "@/components/bookings/data-table-toolbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingsGrid } from "@/components/bookings-grid";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";

export default function BookingsPage() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState<string>("grid");

    const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
    const { data: spaces = [], isLoading: spacesLoading } = useQuery({
        queryKey: ["spaces"],
        queryFn: () => spacesService.getSpaces(),
    });

    const isLoading = bookingsLoading || spacesLoading;

    const handlePreviousDay = () => {
        setSelectedDate((prev) => subDays(prev, 1));
    };

    const handleNextDay = () => {
        setSelectedDate((prev) => addDays(prev, 1));
    };

    const handleBookingClick = (booking: any) => {
        // TODO: Open booking details modal or navigate to details page
        console.log("Booking clicked:", booking);
    };

    const handleCreateBooking = () => {
        router.push("/dashboard/create-booking");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1 className="text-3xl font-bold">Bookings</h1>
                    <p className="text-xs">(in progress)</p>
                </div>


                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Date Navigation (Only for Grid) */}
                    {view === "grid" && (
                        <ButtonGroup>
                            <Button variant="outline" onClick={handlePreviousDay}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <ButtonGroupText className="text-sm font-semibold capitalize min-w-[140px]">
                                {format(selectedDate, "EEEE, d MMM", { locale: es })}
                            </ButtonGroupText>
                            <Button variant="outline" onClick={handleNextDay}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </ButtonGroup>
                    )}

                    {/* Create Booking Button */}
                    <Button onClick={handleCreateBooking}>
                        <Plus className="h-4 w-4 mr-2" />
                        Booking Room
                    </Button>
                </div>
            </header>

            <Tabs value={view} onValueChange={setView} className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="grid" className="gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        Grid
                    </TabsTrigger>
                    <TabsTrigger value="table" className="gap-2">
                        <List className="h-4 w-4" />
                        Table
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <Tabs value={view} onValueChange={setView} className="w-full">
                <TabsContent value="grid" className="mt-0 border rounded-xl overflow-hidden bg-background shadow-sm">
                    <BookingsGrid
                        date={selectedDate}
                        bookings={bookings}
                        spaces={spaces}
                        onBookingClick={handleBookingClick}
                        className="h-[700px]"
                    />
                </TabsContent>
                <TabsContent value="table" className="mt-0">
                    <DataTable
                        columns={columns}
                        data={bookings}
                        toolbar={DataTableToolbar}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
