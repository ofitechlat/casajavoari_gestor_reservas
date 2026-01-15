"use client";

import { useQuery } from "@tanstack/react-query";
import bookingsService from "@/services/bookings.service";
import spacesService from "@/services/spaces.service";
import { useMemo } from "react";

export interface DashboardKpis {
    totalBookings: number;
    pendingRequests: number;
    activeSpaces: number;
    totalRevenue: number;
    loading: boolean;
}

export function useDashboardKpis(): DashboardKpis {
    // Fetch all bookings
    const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
        queryKey: ["bookings"],
        queryFn: () => bookingsService.getBookings(),
    });

    // Fetch all spaces
    const { data: spaces = [], isLoading: spacesLoading } = useQuery({
        queryKey: ["spaces"],
        queryFn: () => spacesService.getSpaces(),
    });

    // Calculate KPIs
    const kpis = useMemo(() => {
        const totalBookings = bookings.length;
        const pendingRequests = bookings.filter(
            (b) => b.status === "pending"
        ).length;
        const activeSpaces = spaces.length;
        const totalRevenue = bookings
            .filter((b) => b.status === "approved")
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        return {
            totalBookings,
            pendingRequests,
            activeSpaces,
            totalRevenue,
        };
    }, [bookings, spaces]);

    return {
        ...kpis,
        loading: bookingsLoading || spacesLoading,
    };
}
