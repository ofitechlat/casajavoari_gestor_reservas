"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Users, Clock, Image as ImageIcon, ExternalLink, Loader2, Trash2, Edit2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generateGoogleCalendarUrl } from "@/lib/calendar-utils";
import { formatDate } from "date-fns";
import { es } from "date-fns/locale";
import { useActivities, useDeleteActivity } from "@/hooks/queries/useActivities";
import { EditActivityDialog } from "@/components/dialog/edit-activity-dialog";
import { Activity } from "@/types";
import { ConfirmDeleteActivity } from "@/components/dialog/delete-activity-dialog";
import CreateNewActivity from "@/components/dialog/create-new-activity";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function ActivitiesPage() {
  const { data: activities = [], isLoading } = useActivities();
  const deleteMutation = useDeleteActivity();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);


  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const activity = activities.find((a: Activity) => a.id === id);
    if (activity) {
      setSelectedActivity(activity);
      setIsDeleteOpen(true);
    }
  };

  const handleEdit = (activity: Activity, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedActivity(activity);
    setIsEditOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  /*   if (activities.length === 0) {
      return (
        <div className="text-center p-20 border-2 border-dashed rounded-3xl">
          <p className="text-muted-foreground italic">No hay actividades publicadas aún.</p>
        </div>
      );
    } */

  return (
    <div className="space-y-8 pb-20 p-8 h-full">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Actividades</h1>
          <p className="text-muted-foreground">Gestiona la agenda cultural de Casa Javorai.</p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)}>Publicar Nueva Actividad</Button>
      </header>

      {activities.length === 0 ? (
        <Empty className="border-2 border-dashed rounded-3xl h-[calc(100vh-12rem)]">
          <EmptyMedia>
            <PartyPopper className="w-8 h-8" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No hay actividades publicadas aún.</EmptyTitle>
            <EmptyDescription>No hay actividades publicadas aún.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity: Activity) => (
            <Card key={activity.id} className="overflow-hidden group hover:shadow-xl transition-all border-none shadow-md rounded-3xl relative">
              <header className="aspect-video relative overflow-hidden bg-accent border-b">
                {activity.imageUrl ? (
                  <img src={activity.imageUrl} alt={activity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-secondary px-3 py-1 rounded-full text-xs text-foreground font-bold shadow-sm">
                    {formatDate(new Date(activity.startAt), "d MMM", { locale: es })}
                  </span>
                </div>

                {/* toolbar */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="rounded-full w-8 h-8" onClick={(e) => handleEdit(activity, e)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="rounded-full w-8 h-8" onClick={(e) => handleDelete(activity.id, e)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

              </header>

              <main className="p-5 space-y-3">
                <h3 className="font-bold text-xl line-clamp-1">{activity.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">{activity.description}</p>

                <div className="flex flex-wrap gap-2 pt-2 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" /> {formatDate(new Date(activity.startAt), "h:mm a", { locale: es }).toLowerCase()}
                  </span>
                  {activity.venture && (
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <ImageIcon className="w-3 h-3" /> {activity.venture.name}
                    </span>
                  )}
                  {activity.responsible && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3" /> {activity.responsible}
                    </span>
                  )}
                </div>

                {activity.spaces && activity.spaces.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 w-full">
                    {activity.spaces.map((s: any) => (
                      <span key={s.id} className="px-1.5 py-0.5 bg-primary/5 text-primary rounded-sm text-[9px] font-bold">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </main>
              <footer className="pt-4 space-y-4 px-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl"
                  onClick={() => window.open(generateGoogleCalendarUrl({
                    title: activity.title,
                    description: activity.description,
                    startDate: new Date(activity.startAt),
                    endDate: new Date(activity.endAt)
                  }), '_blank')}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" /> Google
                </Button>

                {(activity.videoUrl || activity.instagram) && (
                  <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                    <a title={activity.videoUrl || activity.instagram} href={activity.videoUrl || activity.instagram} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </footer>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDeleteActivity
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        activityId={selectedActivity?.id || ""}
      />

      <CreateNewActivity
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />

      {
        selectedActivity && (
          <EditActivityDialog
            activity={selectedActivity}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
          />
        )
      }
    </div >
  );
}
