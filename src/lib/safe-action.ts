import { createSafeActionClient } from 'next-safe-action'
import { getSession } from '@/server/auth'

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    if (error instanceof Error) {
      return error.message
    }
    return 'Something went wrong.'
  },
})

export const authAction = actionClient.use(async ({ next }) => {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return next({ ctx: { user: session.user } })
})
