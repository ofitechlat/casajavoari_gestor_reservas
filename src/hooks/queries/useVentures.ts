import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import venturesService, {
  type CreateVentureData,
  type UpdateVentureData,
  type CreateProductData,
  type UpdateProductData,
} from "@/services/ventures.service";
import type { Venture, Product } from "@/types";
import { toast } from "sonner";

// Query Keys
export const ventureKeys = {
  all: ["ventures"] as const,
  lists: () => [...ventureKeys.all, "list"] as const,
  list: (category?: string) => [...ventureKeys.lists(), category] as const,
  details: () => [...ventureKeys.all, "detail"] as const,
  detail: (id: string) => [...ventureKeys.details(), id] as const,
  search: (query: string) => [...ventureKeys.all, "search", query] as const,
};

// Queries
export function useVentures() {
  return useQuery({
    queryKey: ventureKeys.lists(),
    queryFn: () => venturesService.getVentures(),
  });
}

export function useVenture(id: string, includeProducts = true) {
  return useQuery({
    queryKey: ventureKeys.detail(id),
    queryFn: () => venturesService.getVentureById(id),
    enabled: !!id,
  });
}



export function useSearchVentures(query: string) {
  return useQuery({
    queryKey: ventureKeys.search(query),
    queryFn: () => venturesService.searchVentures(query),
    enabled: query.length > 2, // Only search if query is at least 3 characters
  });
}

// Mutations
export function useCreateVenture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVentureData) => venturesService.createVenture(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
      toast.success("Emprendimiento registrado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al registrar el emprendimiento");
    },
  });
}

export function useUpdateVenture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVentureData }) =>
      venturesService.updateVenture(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ventureKeys.detail(variables.id) });
      toast.success("Emprendimiento actualizado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al actualizar el emprendimiento");
    },
  });
}

export function useDeleteVenture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => venturesService.deleteVenture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
      toast.success("Emprendimiento eliminado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al eliminar el emprendimiento");
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => venturesService.createProduct(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.detail(variables.ventureId) });
      toast.success("Producto agregado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al agregar el producto");
    },
  });
}

export function useUpdateProduct(ventureId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) =>
      venturesService.updateProduct(id, data),
    onSuccess: () => {
      if (ventureId) {
        queryClient.invalidateQueries({ queryKey: ventureKeys.detail(ventureId) });
      } else {
        queryClient.invalidateQueries({ queryKey: ventureKeys.all });
      }
      toast.success("Producto actualizado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al actualizar el producto");
    },
  });
}

export function useDeleteProduct(ventureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => venturesService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.detail(ventureId) });
      toast.success("Producto eliminado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al eliminar el producto");
    },
  });
}
