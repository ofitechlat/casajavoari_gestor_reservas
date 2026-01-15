"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Space, SpaceId } from "@/types";
import { SPACES } from "@/data/mock";
import { SpaceMap } from "@/components/space-map";
import { Trash2, Plus, Save } from "lucide-react";

interface SpaceConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SpaceConfigDialog({ open, onOpenChange }: SpaceConfigDialogProps) {
    const [spaces, setSpaces] = useState<Space[]>(SPACES);
    const [selectedId, setSelectedId] = useState<SpaceId | null>(null);

    const selectedSpace = spaces.find(s => s.id === selectedId);

    const updateSpace = (id: SpaceId, updates: Partial<Space> | Partial<Space["mapConfig"]>) => {
        if (!updates) return;

        setSpaces(prev => prev.map(s => {
            if (s.id !== id) return s;

            // Check if updates belong to mapConfig or root
            const isMapConfig = 'x' in updates || 'y' in updates || 'width' in updates || 'height' in updates;

            if (isMapConfig) {
                return { ...s, mapConfig: { ...s.mapConfig, ...updates as Partial<Space["mapConfig"]> } } as Space;
            }
            return { ...s, ...updates } as Space;
        }));
    };

    const handleAddSpace = () => {
        const newId = `space-${Date.now()}` as SpaceId;
        const newSpace: Space = {
            id: newId,
            slug: newId,
            name: "Nuevo Espacio",
            description: "",
            dimensions: "0x0m",
            type: "indoor",
            hourlyRate: 0,
            color: "bg-gray-500",
            mapConfig: { x: 10, y: 10, width: 50, height: 50, borderRadius: 0 }
        };
        setSpaces([...spaces, newSpace]);
        setSelectedId(newId);
    };

    const handleDeleteSpace = (id: SpaceId) => {
        if (confirm("¿Estás seguro de eliminar este espacio?")) {
            setSpaces(spaces.filter(s => s.id !== id));
            if (selectedId === id) setSelectedId(null);
        }
    };

    const handleSave = () => {
        // In a real app, this would save to API/DB
        console.log("Saving spaces configuration:", spaces);
        alert("Configuración simulada guardada. (En producción esto actualizaría la base de datos)");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Configuración de Espacios</DialogTitle>
                    <DialogDescription>
                        Administra los espacios disponibles y su ubicación en el mapa.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

                    {/* Left: Map Preview & List */}
                    <div className="space-y-4">
                        <div className="border rounded-md p-2 bg-muted/20">
                            <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Vista Previa del Mapa</label>
                            <SpaceMap spaces={spaces} selectedSpaceId={selectedId || undefined} onSelect={setSelectedId} />
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                Haz clic en un espacio para editarlo
                            </p>
                        </div>

                        <div className="border rounded-md p-2 h-48 overflow-y-auto">
                            <div className="flex justify-between items-center mb-2 px-2">
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Lista de Espacios</label>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleAddSpace}><Plus className="w-4 h-4" /></Button>
                            </div>
                            <div className="space-y-1">
                                {spaces.map(s => (
                                    <div
                                        key={s.id}
                                        onClick={() => setSelectedId(s.id)}
                                        className={`p-2 rounded text-sm cursor-pointer flex justify-between items-center ${selectedId === s.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                    >
                                        <span>{s.name}</span>
                                        {selectedId === s.id && <Trash2 className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleDeleteSpace(s.id); }} />}
                                    </div>
                                ))}
                            </div>
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
                                        <Input value={selectedSpace.name} onChange={e => updateSpace(selectedSpace.id, { name: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium">Descripción</label>
                                        <Textarea value={selectedSpace.description} onChange={e => updateSpace(selectedSpace.id, { description: e.target.value })} className="h-20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium">Tarifa ($/hr)</label>
                                            <Input type="number" value={selectedSpace.hourlyRate} onChange={e => updateSpace(selectedSpace.id, { hourlyRate: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium">Tipo</label>
                                            <Input value={selectedSpace.type} disabled />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <h4 className="font-semibold text-sm mb-3">Configuración de Mapa (Posición)</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium">Posición X</label>
                                                <Input type="number" value={selectedSpace.mapConfig?.x || 0} onChange={e => updateSpace(selectedSpace.id, { x: Number(e.target.value) })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium">Posición Y</label>
                                                <Input type="number" value={selectedSpace.mapConfig?.y || 0} onChange={e => updateSpace(selectedSpace.id, { y: Number(e.target.value) })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium">Ancho</label>
                                                <Input type="number" value={selectedSpace.mapConfig?.width || 0} onChange={e => updateSpace(selectedSpace.id, { width: Number(e.target.value) })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium">Alto</label>
                                                <Input type="number" value={selectedSpace.mapConfig?.height || 0} onChange={e => updateSpace(selectedSpace.id, { height: Number(e.target.value) })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <p>Selecciona un espacio para editar</p>
                            </div>
                        )}
                    </div>

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" /> Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
