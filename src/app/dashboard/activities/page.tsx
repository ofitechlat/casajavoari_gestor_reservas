"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, Youtube, Instagram, Mail, Tag, Users, Clock, Image as ImageIcon, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { compressImageToWebP } from "@/lib/image-utils";
import { generateGoogleCalendarUrl } from "@/lib/calendar-utils";
import { formatDate } from "date-fns";
import { es } from "date-fns/locale";

interface Activity {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    startTime?: string;
    responsible?: string;
    imageUrl?: string;
    videoUrl?: string;
    instagram?: string;
    email?: string;
    tags?: string;
}

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [responsible, setResponsible] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [instagram, setInstagram] = useState("");
    const [email, setEmail] = useState("");
    const [tags, setTags] = useState("");

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const res = await fetch('/api/activities');
            const data = await res.json();
            if (Array.isArray(data)) {
                setActivities(data);
            } else {
                console.error("API response is not an array:", data);
                setActivities([]);
            }
        } catch (error) {
            console.error(error);
            setActivities([]);
        } finally {
            setIsLoading(false);
        }
    };

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
        setIsSaving(true);

        const newActivity = {
            title,
            description,
            startDate,
            endDate: endDate || null,
            startTime,
            responsible,
            imageUrl,
            videoUrl,
            instagram,
            email,
            tags
        };

        try {
            const res = await fetch('/api/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newActivity)
            });

            if (res.ok) {
                setIsDialogOpen(false);
                fetchActivities();
                // Reset form
                setTitle("");
                setDescription("");
                setStartDate("");
                setEndDate("");
                setStartTime("");
                setResponsible("");
                setImageUrl("");
                setVideoUrl("");
                setInstagram("");
                setEmail("");
                setTags("");
            }
        } catch (error) {
            alert("Error al guardar actividad");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Actividades</h1>
                    <p className="text-muted-foreground">Gestiona la agenda cultural de Casa Javorai.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full shadow-lg hover:shadow-xl transition-all gap-2">
                            <Plus className="w-4 h-4" /> Nueva Actividad
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Subir Nueva Actividad</DialogTitle>
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

                            <div className="md:col-span-2 pt-4">
                                <Button className="w-full h-12 text-lg" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publicar Actividad"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
                </div>
            ) : activities.length === 0 ? (
                <div className="text-center p-20 border-2 border-dashed rounded-3xl">
                    <p className="text-muted-foreground italic">No hay actividades publicadas aún.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map(activity => (
                        <Card key={activity.id} className="overflow-hidden group hover:shadow-xl transition-all border-none shadow-md rounded-3xl">
                            <div className="aspect-video relative overflow-hidden bg-accent">
                                {activity.imageUrl ? (
                                    <img src={activity.imageUrl} alt={activity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <ImageIcon className="w-8 h-8 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                        {formatDate(new Date(activity.startDate), "d MMM", { locale: es })}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 space-y-3">
                                <h3 className="font-bold text-xl line-clamp-1">{activity.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{activity.description}</p>

                                <div className="flex flex-wrap gap-2 pt-2 text-xs">
                                    {activity.startTime && (
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <Clock className="w-3 h-3" /> {activity.startTime}
                                        </span>
                                    )}
                                    {activity.responsible && (
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <Users className="w-3 h-3" /> {activity.responsible}
                                        </span>
                                    )}
                                </div>

                                <div className="pt-4 flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 rounded-xl"
                                        onClick={() => window.open(generateGoogleCalendarUrl({
                                            title: activity.title,
                                            description: activity.description,
                                            startDate: new Date(activity.startDate),
                                            endDate: activity.endDate ? new Date(activity.endDate) : undefined,
                                            startTime: activity.startTime
                                        }), '_blank')}
                                    >
                                        <CalendarIcon className="w-4 h-4 mr-2" /> Google
                                    </Button>

                                    {(activity.videoUrl || activity.instagram) && (
                                        <Button variant="ghost" size="icon" className="rounded-xl">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
