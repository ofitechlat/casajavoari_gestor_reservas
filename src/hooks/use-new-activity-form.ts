import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { activitySchema, ActivityFormValues } from "@/schemas/activity-schemas"
import { checkConflicts, type Conflict } from "@/lib/booking-utils"
import { Activity, Booking } from "@/types"

export function useNewActivityForm({
  bookings,
  activities,
}: {
  bookings: Booking[]
  activities: Activity[]
}) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      spaceIds: [],
      tags: [],
    },
  })

  const watch = form.watch()
  const [bypassWarning, setBypassWarning] = useState(false)

  const conflicts: Conflict[] = useMemo(() => {
    if (
      !watch.startDate ||
      !watch.startTime ||
      watch.spaceIds.length === 0
    ) {
      return []
    }

    const startAt = new Date(`${watch.startDate}T${watch.startTime}`)
    const endAt = watch.endDate
      ? new Date(`${watch.endDate}T${watch.startTime}`)
      : new Date(startAt.getTime() + 2 * 60 * 60 * 1000)

    return checkConflicts(
      {
        id: "new-activity",
        title: watch.title || "Nueva Actividad",
        startAt,
        endAt,
        spaceIds: watch.spaceIds,
      },
      bookings,
      activities
    )
  }, [watch, bookings, activities])

  return {
    form,
    conflicts,
    bypassWarning,
    setBypassWarning,
  }
}
