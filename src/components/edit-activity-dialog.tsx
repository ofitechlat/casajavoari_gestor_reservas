"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Youtube, Instagram, Mail, Tag, Users, Clock, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { compressImageToWebP } from "@/lib/image-utils";
import { useUpdateActivity } from "@/hooks/queries/useActivities";
import type { Activity } from "@/services/activities.service";

interface EditActivityDialogProps {
  activity: Activity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditActivityDialog({ activity, open, onOpenChange }: EditActivityDialogProps) {
  const updateMutation = useUpdateActivity();

  // Form State
  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description || "");
  const [startDate, setStartDate] = useState(activity.startDate?.split('T')[0] || "");
  const [endDate, setEndDate] = useState(activity.endDate?.split('T')[0] || "");
  const [startTime, setStartTime] = useState(activity.startTime || "");
  const [responsible, setResponsible] = useState(activity.responsible || "");
  const [imageUrl, setImageUrl] = useState(activity.imageUrl || "");
  const [videoUrl, setVideoUrl] = useState(activity.videoUrl || "");
  const [instagram, setInstagram] = useState(activity.instagram || "");
  const [email, setEmail] = useState(activity.email || "");
  const [tags, setTags] = useState(activity.tags || "");

  useEffect(() => {
    if (open) {
      setTitle(activity.title);
      setDescription(activity.description || "");
      setStartDate(activity.startDate?.split('T')[0] || "");
      setEndDate(activity.endDate?.split('T')[0] || "");
      setStartTime(activity.startTime || "");
      setResponsible(activity.responsible || "");
      setImageUrl(activity.imageUrl || "");
      setVideoUrl(activity.videoUrl || "");
      setInstagram(activity.instagram || "");
      setEmail(activity.email || "");
      setTags(activity.tags || "");
    }
  }, [open, activity]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageToWebP(file);
      setImageUrl(compressed);
    } catch (error) {
      alert("Error al procesar la imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData = {
      title,
      description,
      startDate,
      endDate: endDate || undefined,
      startTime: startTime || '00:00',
      responsible: responsible || 'Casa Javorai',
      imageUrl: imageUrl || undefined,
      videoUrl: videoUrl || undefined,
      instagram: instagram || undefined,
      email: email || undefined,
      tags: tags || 'general'
    };

    updateMutation.mutate({ id: activity.id, data: updatedData }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Actividad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="md:col-span-2 space-y-2">
            <Label>Título de la Actividad</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Concierto de Invierno" required />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Descripción</Label>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Cuéntanos de qué trata..."
            />
          </div>

          <div className="space-y-2">
            <Label>Fecha de Inicio</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Fecha de Finalización (Opcional)</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Hora</Label>
            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Responsables</Label>
            <Input value={responsible} onChange={e => setResponsible(e.target.value)} placeholder="Nombres o colectivo" />
          </div>

          <div className="md:col-span-2 space-y-4 pt-2">
            <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-accent transition-colors">
              {imageUrl ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 p-2 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-12 h-12 text-muted-foreground opacity-30" />
                  <Label className="cursor-pointer text-center">
                    <span className="text-primary font-bold text-sm">Haz click para subir una foto</span>
                    <p className="text-[10px] text-muted-foreground">Formato WebP optimizado automáticamente</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </Label>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs"><Youtube className="w-3 h-3 text-red-500" /> YouTube Link</Label>
            <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." className="text-sm" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs"><Instagram className="w-3 h-3 text-pink-500" /> Instagram</Label>
            <Input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@usuario o link" className="text-sm" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs"><Mail className="w-3 h-3 text-primary" /> Correo de contacto</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hola@..." className="text-sm" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs"><Tag className="w-3 h-3" /> Etiquetas</Label>
            <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Música, Taller, Arte..." className="text-sm" />
          </div>

          <DialogFooter className="md:col-span-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
