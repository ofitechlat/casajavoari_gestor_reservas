import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import bookingsService, {
  type Booking,
  type CreateBookingData,
  type UpdateBookingData,
  type BookingFilters,
} from "@/services/bookings.service";
import { toast } from "sonner";

// Query Keys
export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (filters?: BookingFilters) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  availability: (startDate: string, endDate: string) =>
    [...bookingKeys.all, "availability", startDate, endDate] as const,
};

// Queries
export function useBookings(filters?: BookingFilters) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => bookingsService.getBookings(filters),
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"] as const,
    queryFn: () => bookingsService.getUsersMap(),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingsService.getBookingById(id),
    enabled: !!id,
  });
}

export function useCheckAvailability(startDate: string, endDate: string) {
  return useQuery({
    queryKey: bookingKeys.availability(startDate, endDate),
    queryFn: () => bookingsService.checkAvailability(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// Mutations
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingData) => bookingsService.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      toast.success("Reserva creada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al crear la reserva");
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingData }) =>
      bookingsService.updateBooking(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
      toast.success("Reserva actualizada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al actualizar la reserva");
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsService.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      toast.success("Reserva eliminada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al eliminar la reserva");
    },
  });
}
