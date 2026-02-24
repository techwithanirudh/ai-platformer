'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { authAction } from '@/lib/safe-action'
import { createSetSchema } from '@/lib/validators/sets'
import { db } from '@/server/db'
import { sets } from '@/server/db/schema/sets'

export const createSetAction = authAction
  .schema(createSetSchema)
  .action(async ({ parsedInput, ctx }) => {
    const id = crypto.randomUUID()

    await db.insert(sets).values({
      id,
      userId: ctx.user.id,
      name: parsedInput.name,
      theme: parsedInput.theme,
      description: parsedInput.theme,
    })

    revalidatePath('/')
    return { setId: id }
  })

const deleteSetSchema = z.object({
  setId: z.string().min(1),
})

export const deleteSetAction = authAction
  .schema(deleteSetSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .delete(sets)
      .where(and(eq(sets.id, parsedInput.setId), eq(sets.userId, ctx.user.id)))

    revalidatePath('/')
    return { ok: true }
  })
