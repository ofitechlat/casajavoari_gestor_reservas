import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TimePicker } from '@/components/ui/time-picker';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Image as ImageIcon,
  Youtube,
  Instagram,
  Mail,
  Tag,
  MapPinIcon,
  Loader2
} from 'lucide-react';
import { useSpaces, useCreateActivity, useContacts, useVentures, useBookings, useActivities } from "@/hooks/queries";
import { checkConflicts, type Conflict } from "@/lib/booking-utils";
import { ConflictAlerts } from "@/components/shared/conflict-alerts";
import { useAuth } from "@/contexts/AuthContext";
import { compressImageToWebP } from "@/lib/image-utils";
import { toast } from "sonner";
import { ContactMultiSelect } from "@/components/ui/contact-multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function NewActivityForm({

}) {
  return (
    <></>
  )
}

function CreateNewActivity({
  isDialogOpen,
  setIsDialogOpen
}: {
  isDialogOpen: boolean,
  setIsDialogOpen: (open: boolean) => void
}) {
  const { data: spaces = [] } = useSpaces();
  const { data: allBookings = [] } = useBookings();
  const { data: allActivities = [] } = useActivities();
  const createMutation = useCreateActivity();
  const { user } = useAuth();

  // Conflict state
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [bypassWarning, setBypassWarning] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [responsibleContactIds, setResponsibleContactIds] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [tags, setTags] = useState("");
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
  const [ventureId, setVentureId] = useState<string>("none");
  const { data: ventures = [] } = useVentures();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageToWebP(file);
        setImageUrl(compressed);
      } catch (error) {
        toast.error("Error al procesar la imagen");
      }
    }
  };

  // Check conflicts in real-time
  React.useEffect(() => {
    if (startDate && startTime && selectedSpaces.length > 0) {
      const startAt = new Date(`${startDate}T${startTime}`);
      const endAt = endDate
        ? new Date(`${endDate}T${startTime}`)
        : new Date(startAt.getTime() + 2 * 60 * 60 * 1000);

      const tempActivity = {
        id: 'new-activity',
        title: title || 'Nueva Actividad',
        startAt,
        endAt,
        spaceIds: selectedSpaces,
      };

      const found = checkConflicts(tempActivity, allBookings, allActivities);
      setConflicts(found);
    } else {
      setConflicts([]);
    }
    setBypassWarning(false);
  }, [startDate, startTime, endDate, selectedSpaces, title, allBookings, allActivities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Combine date and time for startAt and endAt
    const startAt = new Date(`${startDate}T${startTime || '00:00'}`);
    const endAt = endDate
      ? new Date(`${endDate}T${startTime || '23:59'}`)
      : new Date(startAt.getTime() + 2 * 60 * 60 * 1000); // Default 2h

    const activityData = {
      title,
      description,
      startAt,
      endAt,
      responsible_contact_ids: responsibleContactIds.length > 0 ? responsibleContactIds : undefined,
      imageUrl: imageUrl || undefined,
      videoUrl: videoUrl || undefined,
      instagram: instagram || undefined,
      email: email || undefined,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      spaceIds: selectedSpaces,
      venture_id: ventureId !== "none" ? ventureId : undefined
    };

    // Conflict Check
    const blocking = conflicts.filter(c => c.severity === 'blocking');
    const warnings = conflicts.filter(c => c.severity === 'warning');

    if (blocking.length > 0) {
      toast.error("No se puede crear el evento. Hay conflictos de espacio/tiempo.");
      return;
    }

    if (warnings.length > 0 && !bypassWarning) {
      toast.warning("Hay advertencias de espacio. Revisa antes de publicar.");
      return;
    }

    createMutation.mutate(activityData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        // Reset form
        setTitle("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setStartTime("");
        setResponsibleContactIds([]);
        setImageUrl("");
        setVideoUrl("");
        setInstagram("");
        setEmail("");
        setTags("");
        setSelectedSpaces([]);
      }
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className=''>
          <DialogTitle>Publicar Nuevo Evento Cultural</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="md:col-span-2 space-y-2">
            <Label>Título de la Actividad</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Concierto de Invierno" required />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Descripción</Label>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
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
            <TimePicker value={startTime} onChange={setStartTime} />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Emprendimiento / Artista Responsable</Label>
            <Select value={ventureId} onValueChange={setVentureId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar emprendimiento..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguno (Independiente)</SelectItem>
                {ventures.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Responsables</Label>
            <ContactMultiSelect
              value={responsibleContactIds}
              onChange={setResponsibleContactIds}
              placeholder="Seleccionar responsables..."
            />
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
                    <span className="text-primary font-bold">Haz click para subir una foto</span>
                    <p className="text-xs text-muted-foreground">Formato WebP optimizado automáticamente</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </Label>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Youtube className="w-4 h-4 text-red-500" /> YouTube Link</Label>
            <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-500" /> Instagram</Label>
            <Input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@usuario o link" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Correo de contacto</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hola@..." />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Tag className="w-4 h-4" /> Etiquetas</Label>
            <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Música, Taller, Arte..." />
          </div>

          <div className="md:col-span-2">
            <ConflictAlerts
              conflicts={conflicts}
              canBypass={user?.user_metadata?.role === 'admin'}
              onBypass={() => setBypassWarning(true)}
              className="mb-4"
            />
          </div>

          <div className="md:col-span-2 space-y-3 pt-2">
            <Label className="flex items-center gap-2 font-bold text-primary">
              <MapPinIcon className="w-4 h-4" /> Espacios que utilizará el evento
            </Label>
            <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg border">
              {spaces.map(space => (
                <div key={space.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`space-${space.id}`}
                    checked={selectedSpaces.includes(space.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSpaces([...selectedSpaces, space.id]);
                      } else {
                        setSelectedSpaces(selectedSpaces.filter(id => id !== space.id));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={`space-${space.id}`} className="text-xs font-medium cursor-pointer">
                    {space.name}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              * Selecciona los espacios donde se llevará a cabo este evento para mostrarlo en el calendario.
            </p>
          </div>

          <div className="md:col-span-2 pt-4">
            <Button
              className="w-full h-12 text-lg"
              disabled={createMutation.isPending || conflicts.some(c => c.severity === 'blocking') || (conflicts.length > 0 && !bypassWarning && user?.user_metadata?.role === 'admin')}
            >
              {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publicar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateNewActivity;
