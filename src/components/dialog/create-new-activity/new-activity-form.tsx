import { Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TimePicker } from "@/components/ui/time-picker"
import { ConflictAlerts } from "@/components/shared/conflict-alerts"
import { Loader2 } from "lucide-react"

export function NewActivityForm({
  form,
  spaces,
  conflicts,
  isSubmitting,
  canBypass,
  onBypass,
  onSubmit,
}: any) {
  const { register, control } = form

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div className="md:col-span-2 space-y-2">
        <Label>Título</Label>
        <Input {...register("title")} />
      </div>

      <div className="space-y-2">
        <Label>Fecha inicio</Label>
        <Input type="date" {...register("startDate")} />
      </div>

      <div className="space-y-2">
        <Label>Hora</Label>
        <Controller
          name="startTime"
          control={control}
          render={({ field }) => <TimePicker {...field} />}
        />
      </div>

      <div className="md:col-span-2">
        <ConflictAlerts
          conflicts={conflicts}
          canBypass={canBypass}
          onBypass={onBypass}
        />
      </div>

      <div className="md:col-span-2">
        <Button className="w-full h-12" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Publicar Evento"
          )}
        </Button>
      </div>
    </form>
  )
}
