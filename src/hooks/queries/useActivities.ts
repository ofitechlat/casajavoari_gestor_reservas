import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import activitiesService, {
  type Activity,
  type CreateActivityData,
  type UpdateActivityData,
} from "@/services/activities.service";
import { toast } from "sonner";

// Query Keys
export const activityKeys = {
  all: ["activities"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (tag?: string) => [...activityKeys.lists(), tag] as const,
  details: () => [...activityKeys.all, "detail"] as const,
  detail: (id: string) => [...activityKeys.details(), id] as const,
  upcoming: () => [...activityKeys.all, "upcoming"] as const,
};

// Queries
export function useActivities() {
  return useQuery({
    queryKey: activityKeys.lists(),
    queryFn: () => activitiesService.getActivities(),
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: () => activitiesService.getActivityById(id),
    enabled: !!id,
  });
}

export function useUpcomingActivities() {
  return useQuery({
    queryKey: activityKeys.upcoming(),
    queryFn: () => activitiesService.getUpcomingActivities(),
  });
}

export function useActivitiesByTag(tag: string) {
  return useQuery({
    queryKey: activityKeys.list(tag),
    queryFn: () => activitiesService.getActivitiesByTag(tag),
    enabled: !!tag,
  });
}

// Mutations
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityData) => activitiesService.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.upcoming() });
      toast.success("Actividad creada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al crear la actividad");
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActivityData }) =>
      activitiesService.updateActivity(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.upcoming() });
      toast.success("Actividad actualizada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al actualizar la actividad");
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activitiesService.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.upcoming() });
      toast.success("Actividad eliminada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al eliminar la actividad");
    },
  });
}
