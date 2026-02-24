import { z } from 'zod'

export const createSetSchema = z.object({
  name: z.string().min(1).max(64),
  theme: z.string().min(1),
})

export type CreateSetInput = z.infer<typeof createSetSchema>
