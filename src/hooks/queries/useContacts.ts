import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import contactsService, {
  type CreateContactData,
  type UpdateContactData,
} from "@/services/contacts.service";
import type { Contact } from "@/types";
import { toast } from "sonner";

// Query Keys
export const contactKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  details: () => [...contactKeys.all, "detail"] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
};

// Queries
export function useContacts() {
  return useQuery({
    queryKey: contactKeys.lists(),
    queryFn: () => contactsService.getContacts(),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => contactsService.getContactById(id),
    enabled: !!id,
  });
}

// Mutations
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactData) => contactsService.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      toast.success("Contacto creado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al crear el contacto");
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactData }) =>
      contactsService.updateContact(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(variables.id) });
      toast.success("Contacto actualizado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al actualizar el contacto");
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactsService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      toast.success("Contacto eliminado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Error al eliminar el contacto");
    },
  });
}
