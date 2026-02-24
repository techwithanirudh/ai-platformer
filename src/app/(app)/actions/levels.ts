'use server'

import { generateObject } from 'ai'
import { revalidatePath } from 'next/cache'
import { levelDesignerPrompt } from '@/lib/ai/prompts/level-designer'
import { provider } from '@/lib/ai/providers'
import { levelSchema } from '@/lib/level-schema'
import { authAction } from '@/lib/safe-action'
import {
  createLevelSchema,
  deleteLevelSchema,
  updateLevelSchema,
} from '@/lib/validators/levels'
import {
  createLevelForSet,
  deleteLevelForSet,
  getNextLevelOrder,
  getOwnedSetTheme,
  updateLevelForSet,
} from '@/server/db/queries'

export const createLevelAction = authAction
  .schema(createLevelSchema)
  .action(async ({ parsedInput, ctx }) => {
    const setRecord = await getOwnedSetTheme({
      setId: parsedInput.setId,
      userId: ctx.user.id,
    })

    if (!setRecord) {
      throw new Error('Set not found.')
    }

    const nextOrder = await getNextLevelOrder(parsedInput.setId)

    const result = await generateObject({
      model: provider.languageModel('chat-model'),
      schema: levelSchema,
      system: levelDesignerPrompt(),
      prompt: `Create a brand new level titled "${parsedInput.title}". Theme description: ${setRecord.theme}. Target difficulty: ${parsedInput.difficulty}. Pick the closest tileset that matches this theme.`,
    })

    const newLevel = {
      ...result.object,
      difficulty: parsedInput.difficulty,
    }
    const id = crypto.randomUUID()

    await createLevelForSet({
      id,
      setId: parsedInput.setId,
      title: parsedInput.title,
      order: nextOrder,
      level: newLevel,
    })

    revalidatePath('/')
    revalidatePath(`/sets/${parsedInput.setId}/levels/${id}`)
    return { levelId: id, setId: parsedInput.setId }
  })

export const updateLevelAction = authAction
  .schema(updateLevelSchema)
  .action(async ({ parsedInput, ctx }) => {
    const setRecord = await getOwnedSetTheme({
      setId: parsedInput.setId,
      userId: ctx.user.id,
    })

    if (!setRecord) {
      throw new Error('Set not found.')
    }

    await updateLevelForSet({
      levelId: parsedInput.id,
      setId: parsedInput.setId,
      title: parsedInput.title,
      level: parsedInput.level,
    })

    revalidatePath('/')
    revalidatePath(`/sets/${parsedInput.setId}/levels/${parsedInput.id}`)
    return { ok: true }
  })

export const deleteLevelAction = authAction
  .schema(deleteLevelSchema)
  .action(async ({ parsedInput, ctx }) => {
    const setRecord = await getOwnedSetTheme({
      setId: parsedInput.setId,
      userId: ctx.user.id,
    })

    if (!setRecord) {
      throw new Error('Set not found.')
    }

    await deleteLevelForSet({
      levelId: parsedInput.levelId,
      setId: parsedInput.setId,
    })

    revalidatePath('/')
    return { ok: true }
  })
