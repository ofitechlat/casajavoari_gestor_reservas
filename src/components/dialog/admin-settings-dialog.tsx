"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Space, SpaceId } from "@/types";
import { SpaceMap, SpaceMapCanvas, SpaceMapSpaces, SpaceMapGrid, SpaceMapLabel } from "@/components/space-map";
import { Trash2, Plus, Save } from "lucide-react";
import { useSpaces, useCreateSpace, useUpdateSpace, useDeleteSpace } from "@/hooks/queries/useSpaces";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { z } from "zod";

interface AdminSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: SpaceId | null;
  onConfirm: () => void;
  isPending: boolean;
}

function ConfirmDeleteDialog({
  open,
  onOpenChange,
  spaceId,
  onConfirm,
  isPending
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Espacio</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de eliminar este espacio? Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type SpaceFormData = Omit<Space, 'id'>;

export function AdminSettingsDialog({ open, onOpenChange }: AdminSettingsDialogProps) {
  const { data: spaces = [], isLoading: isLoadingSpaces } = useSpaces();
  const createSpaceMutation = useCreateSpace();
  const updateSpaceMutation = useUpdateSpace();
  const deleteSpaceMutation = useDeleteSpace();

  const [selectedId, setSelectedId] = useState<SpaceId | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<SpaceId | null>(null);

  // Track temporary mapConfig changes during drag/resize
  const [tempMapConfigs, setTempMapConfigs] = useState<Record<SpaceId, Partial<Space['mapConfig']>>>({});

  // Merge spaces with temporary changes for live preview
  const displaySpaces: Space[] = spaces.map(space => {
    const tempConfig = tempMapConfigs[space.id];
    if (tempConfig) {
      return {
        ...space,
        mapConfig: {
          ...space.mapConfig,
          ...tempConfig
        } as Space['mapConfig']
      };
    }
    return space;
  });

  const selectedSpace = spaces.find(s => s.id === selectedId);

  // Initialize form with selected space data
  const form = useForm<SpaceFormData>({
    defaultValues: {
      slug: "",
      name: "",
      description: "",
      dimensions: "0x0m",
      type: "indoor",
      hourlyRate: 0,
      color: "bg-gray-500",
      mapConfig: { x: 10, y: 10, width: 50, height: 50, borderRadius: 0 }
    }
  });

  // Update form when selected space changes
  useEffect(() => {
    if (selectedSpace) {
      // Clear temporary changes when switching spaces
      setTempMapConfigs({});

      form.reset({
        slug: selectedSpace.slug,
        name: selectedSpace.name,
        description: selectedSpace.description,
        dimensions: selectedSpace.dimensions,
        type: selectedSpace.type,
        hourlyRate: selectedSpace.hourlyRate,
        color: selectedSpace.color,
        mapConfig: selectedSpace.mapConfig || { x: 10, y: 10, width: 50, height: 50, borderRadius: 0 }
      });
    }
  }, [selectedSpace, form]);

  const handleAddSpace = () => {
    const timestamp = Date.now();
    const newSpace: SpaceFormData = {
      slug: `nuevo-espacio-${timestamp}`,
      name: "Nuevo Espacio",
      description: "",
      dimensions: "0x0m",
      type: "indoor",
      hourlyRate: 0,
      color: "bg-gray-500",
      mapConfig: { x: 10, y: 10, width: 50, height: 50, borderRadius: 0 }
    };

    createSpaceMutation.mutate(newSpace, {
      onSuccess: (createdSpace) => {
        setSelectedId(createdSpace.id);
        form.reset(newSpace);
      }
    });
  };

  const handleSaveSpace = async () => {
    if (!selectedSpace) return;

    const formData = form.getValues();

    updateSpaceMutation.mutate({
      id: selectedSpace.id,
      data: formData
    }, {
      onSuccess: () => {
        // Clear temporary changes after successful save
        setTempMapConfigs({});
      }
    });
  };

  const handleDeleteClick = (id: SpaceId) => {
    setSpaceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!spaceToDelete) return;

    deleteSpaceMutation.mutate(spaceToDelete, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSpaceToDelete(null);
        if (selectedId === spaceToDelete) {
          setSelectedId(null);
        }
      },
      onError: (error: any) => {
        // Check if it's a 409 conflict error (foreign key constraint)
        if (error?.response?.status === 409) {
          toast.error("No se puede eliminar este espacio porque está siendo usado en reservas o actividades. Elimina primero las referencias.");
        }
      }
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl! md:w-4xl max-h-[calc(100vh-10rem)] overflow-y-auto flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10 text-start">
            <DialogTitle>Configuración de Espacios</DialogTitle>
            <DialogDescription>
              Administra los espacios y su ubicación en el mapa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-sidebar p-4">
            {/* Left: Map Preview & List */}
            <div className="space-y-4">
              <div className="border rounded-md p-2 bg-muted/20">
                <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Vista Previa</label>
                <SpaceMap
                  spaces={displaySpaces}
                  selectedId={selectedId || undefined}
                  onSelect={setSelectedId}
                  onSpaceChange={(id: SpaceId, updates: Partial<Space['mapConfig']>) => {
                    // Only update if the changed space is the currently selected one
                    if (id !== selectedId || !updates) return;

                    // Update temporary state for live preview
                    setTempMapConfigs(prev => ({
                      ...prev,
                      [id]: {
                        ...(prev[id] || {}),
                        ...updates
                      }
                    }));

                    // Update form values
                    Object.entries(updates).forEach(([key, value]) => {
                      form.setValue(`mapConfig.${key}` as any, value, { shouldDirty: true });
                    });
                  }}
                  editable
                >
                  <SpaceMapCanvas>
                    <SpaceMapGrid />
                    <SpaceMapSpaces draggable resizable />
                  </SpaceMapCanvas>
                  <SpaceMapLabel />
                </SpaceMap>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Arrastra para mover • Usa los puntos para redimensionar
                </p>
              </div>

              <div className="border rounded-md">
                <div className="flex justify-between items-center mb-2 p-2 sticky top-0 border-b">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Lista de Espacios</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleAddSpace}
                    disabled={createSpaceMutation.isPending}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <ScrollArea className="h-45 pr-4 pl-2 pb-2 bg-sidebar">
                  <div className="flex flex-col gap-1">
                    {spaces.map(s => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedId(s.id)}
                        className={`p-2 rounded text-sm cursor-pointer flex justify-between items-center ${selectedId === s.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      >
                        <span>{s.name}</span>
                        {selectedId === s.id && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(s.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <ScrollBar />
                </ScrollArea>
              </div>
            </div>

            {/* Right: Edit Form */}
            <div className="space-y-4 border-l pl-6">
              {selectedSpace ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Editar: {selectedSpace.name}</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Nombre</label>
                      <Input {...form.register("name")} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Descripción</label>
                      <Textarea {...form.register("description")} className="h-20" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Tarifa ($/hr)</label>
                        <Input
                          type="number"
                          {...form.register("hourlyRate", { valueAsNumber: true })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Tipo</label>
                        <Input {...form.register("type")} disabled />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-sm mb-3">Posición en Mapa</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Posición X</label>
                          <Input
                            type="number"
                            {...form.register("mapConfig.x", { valueAsNumber: true })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Posición Y</label>
                          <Input
                            type="number"
                            {...form.register("mapConfig.y", { valueAsNumber: true })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Ancho</label>
                          <Input
                            type="number"
                            {...form.register("mapConfig.width", { valueAsNumber: true })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Alto</label>
                          <Input
                            type="number"
                            {...form.register("mapConfig.height", { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveSpace}
                    className="w-full mt-4 gap-2"
                    disabled={updateSpaceMutation.isPending}
                  >
                    <Save className="w-4 h-4" />
                    {updateSpaceMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <p>Selecciona un espacio para editar</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-auto p-4 border-t sticky bottom-0 bg-background z-10">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar Panel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        spaceId={spaceToDelete}
        onConfirm={handleConfirmDelete}
        isPending={deleteSpaceMutation.isPending}
      />
    </>
  );
}
