import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { db } from '@/server/db'
import { levels } from '@/server/db/schema/levels'
import { sets } from '@/server/db/schema/sets'

export const getSetsWithLevels = (userId: string) => {
  return unstable_cache(
    async () => {
      const setRows = await db
        .select()
        .from(sets)
        .where(eq(sets.userId, userId))
        .orderBy(desc(sets.createdAt))

      const setIds = setRows.map((set) => set.id)

      const levelRows =
        setIds.length > 0
          ? await db
              .select()
              .from(levels)
              .where(inArray(levels.setId, setIds))
              .orderBy(asc(levels.order))
          : []

      return {
        sets: setRows,
        levels: levelRows,
      }
    },
    ['sets', userId],
    { tags: ['sets'] }
  )()
}

export const getSetWithLevels = (userId: string, setId: string) => {
  return unstable_cache(
    async () => {
      const setRows = await db
        .select()
        .from(sets)
        .where(and(eq(sets.id, setId), eq(sets.userId, userId)))
        .limit(1)

      if (setRows.length === 0) {
        return null
      }

      const levelRows = await db
        .select()
        .from(levels)
        .where(eq(levels.setId, setId))
        .orderBy(asc(levels.order))

      return {
        set: setRows[0],
        levels: levelRows,
      }
    },
    ['set', userId, setId],
    { tags: ['sets', `set:${setId}`] }
  )()
}

export const createSetForUser = async (input: {
  id: string
  userId: string
  name: string
  theme: string
}) => {
  await db.insert(sets).values({
    id: input.id,
    userId: input.userId,
    name: input.name,
    theme: input.theme,
    description: input.theme,
  })
}

export const deleteSetForUser = async (input: {
  setId: string
  userId: string
}) => {
  await db
    .delete(sets)
    .where(and(eq(sets.id, input.setId), eq(sets.userId, input.userId)))
}
