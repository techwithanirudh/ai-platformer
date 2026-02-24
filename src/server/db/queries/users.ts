import { eq } from 'drizzle-orm'
import { db } from '@/server/db'
import { users } from '@/server/db/schema/auth'

export const updateUserName = async (input: {
  userId: string
  name: string
}) => {
  await db
    .update(users)
    .set({
      name: input.name,
      updatedAt: new Date(),
    })
    .where(eq(users.id, input.userId))
}
