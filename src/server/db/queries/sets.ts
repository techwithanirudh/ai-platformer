import { asc, desc, eq, inArray } from 'drizzle-orm'
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
    {
      tags: ['sets'],
    }
  )()
}
