import { z } from 'zod'
import { levelSchema } from '@/lib/level-schema'

export const createLevelSchema = z.object({
  setId: z.string().min(1),
  title: z.string().min(1).max(64),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
})

export const updateLevelSchema = z.object({
  id: z.string().min(1),
  setId: z.string().min(1),
  title: z.string().min(1).max(64),
  level: levelSchema,
})

export const deleteLevelSchema = z.object({
  setId: z.string().min(1),
  levelId: z.string().min(1),
})

export type CreateLevelInput = z.infer<typeof createLevelSchema>
export type UpdateLevelInput = z.infer<typeof updateLevelSchema>
export type DeleteLevelInput = z.infer<typeof deleteLevelSchema>
