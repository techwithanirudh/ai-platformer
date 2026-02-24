'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { authAction } from '@/lib/safe-action'
import { createSetSchema } from '@/lib/validators/sets'
import { createSetForUser, deleteSetForUser } from '@/server/db/queries'

export const createSetAction = authAction
  .schema(createSetSchema)
  .action(async ({ parsedInput, ctx }) => {
    const id = crypto.randomUUID()

    await createSetForUser({
      id,
      userId: ctx.user.id,
      name: parsedInput.name,
      theme: parsedInput.theme,
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
    await deleteSetForUser({ setId: parsedInput.setId, userId: ctx.user.id })

    revalidatePath('/')
    return { ok: true }
  })
