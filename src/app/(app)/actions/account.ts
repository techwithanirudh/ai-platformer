'use server'

import { revalidatePath } from 'next/cache'
import { authAction } from '@/lib/safe-action'
import { accountSchema } from '@/lib/validators/account'
import { updateUserName } from '@/server/db/queries'

export const updateAccountAction = authAction
  .schema(accountSchema)
  .action(async ({ parsedInput, ctx }) => {
    await updateUserName({ userId: ctx.user.id, name: parsedInput.name })

    revalidatePath('/account')
    revalidatePath('/')
    return { ok: true }
  })
