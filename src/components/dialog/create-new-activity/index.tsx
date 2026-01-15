import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSpaces, useBookings, useActivities, useCreateActivity } from "@/hooks/queries"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

import { useNewActivityForm } from "@/hooks/use-new-activity-form"
import { NewActivityForm } from "./new-activity-form"

export default function CreateNewActivity({
  isDialogOpen,
  setIsDialogOpen,
}: {
  isDialogOpen: boolean
  setIsDialogOpen: (open: boolean) => void
}) {
  const { data: spaces = [] } = useSpaces()
  const { data: bookings = [] } = useBookings()
  const { data: activities = [] } = useActivities()
  const createMutation = useCreateActivity()
  const { user } = useAuth()

  const {
    form,
    conflicts,
    bypassWarning,
    setBypassWarning,
  } = useNewActivityForm({ bookings, activities })

  const onSubmit = (values: any) => {
    const blocking = conflicts.some(c => c.severity === "blocking")
    const warning = conflicts.some(c => c.severity === "warning")

    if (blocking) {
      toast.error("Hay conflictos que impiden publicar")
      return
    }

/*     if (warning && !bypassWarning) {
      toast.warning("Hay advertencias, confirma para continuar", {
        style: {{
            
        }}
      })
      return
    } */

    createMutation.mutate(values, {
      onSuccess: () => {
        form.reset()
        setIsDialogOpen(false)
      },
    })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo Evento Cultural</DialogTitle>
        </DialogHeader>

        <NewActivityForm
          form={form}
          spaces={spaces}
          conflicts={conflicts}
          isSubmitting={createMutation.isPending}
          canBypass={user?.user_metadata?.role === "admin"}
          onBypass={() => setBypassWarning(true)}
          onSubmit={onSubmit}
        />

      </DialogContent>
    </Dialog>
  )
}
