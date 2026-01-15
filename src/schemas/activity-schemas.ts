import { z } from 'zod'

/**-----------------------
 * Types                 *
 *----------------------*/
export type ActivityFormValues = z.infer<typeof activitySchema>
export type EditActivityFormValues = z.infer<typeof editActivitySchema>


/**-----------------------
 * Schemas               *
 *----------------------*/

export const activitySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  startTime: z.string(),
  spaceIds: z.array(z.string()).min(1),
  ventureId: z.string().optional(),
  responsibleContactIds: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  instagram: z.string().optional(),
  email: z.string().email().optional(),
  tags: z.array(z.string()).optional(),
})

export const editActivitySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  spaceIds: z.array(z.string()).min(1),
  ventureId: z.string().optional(),
  responsibleContactIds: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  instagram: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  tags: z.string().optional(),
})




