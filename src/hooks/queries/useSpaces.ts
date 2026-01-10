import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import spacesService, {
  type CreateSpaceData,
  type UpdateSpaceData,
} from "@/services/spaces.service";
import { toast } from "sonner";

export const spaceKeys = {
  all: ["spaces"] as const,
  lists: () => [...spaceKeys.all, "list"] as const,
  details: () => [...spaceKeys.all, "detail"] as const,
  detail: (id: string) => [...spaceKeys.details(), id] as const,
};

export function useSpaces() {
  return useQuery({
    queryKey: spaceKeys.lists(),
    queryFn: () => spacesService.getSpaces(),
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSpaceData) => spacesService.createSpace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      toast.success("Espacio creado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al crear el espacio");
    },
  });
}

export function useUpdateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSpaceData }) =>
      spacesService.updateSpace(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: spaceKeys.detail(variables.id) });
      toast.success("Espacio actualizado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al actualizar el espacio");
    },
  });
}

export function useDeleteSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => spacesService.deleteSpace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      toast.success("Espacio eliminado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al eliminar el espacio");
    },
  });
}
