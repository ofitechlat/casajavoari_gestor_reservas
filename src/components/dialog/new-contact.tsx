"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCreateContact, useUpdateContact, useContact } from "@/hooks/queries";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Ingresa un correo válido").optional().or(z.literal("")),
  phone: z.string().optional(),
});

type NewContactSchema = z.infer<typeof schema>;

interface NewContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId?: string;
}

export function NewContactModal({
  open,
  onOpenChange,
  contactId,
}: NewContactModalProps) {
  const isEditing = !!contactId;

  const { data: existingContact, isLoading: isLoadingContact } = useContact(contactId || "");
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewContactSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Reset form when modal opens or contact data is fetched
  useEffect(() => {
    if (open) {
      if (isEditing && existingContact) {
        reset({
          name: existingContact.name,
          email: existingContact.email || "",
          phone: existingContact.phone || "",
        });
      } else if (!isEditing) {
        reset({
          name: "",
          email: "",
          phone: "",
        });
      }
    }
  }, [open, existingContact, isEditing, reset]);

  const onSubmit = (data: NewContactSchema) => {
    // Convert empty strings back to undefined for the API if necessary
    const cleanedData = {
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
    };

    if (isEditing && contactId) {
      updateMutation.mutate(
        { id: contactId, data: cleanedData },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    } else {
      createMutation.mutate(cleanedData, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Contacto" : "Registrar Nuevo Contacto"}
          </DialogTitle>
        </DialogHeader>

        {isEditing && isLoadingContact ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ej: Juan Pérez"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico (Opcional)</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="juan@gmail.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono / WhatsApp (Opcional)</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+506 8888-8888"
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {isEditing ? "Guardar Cambios" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
