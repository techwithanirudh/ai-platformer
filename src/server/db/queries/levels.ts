import { and, asc, desc, eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import type { Level } from '@/lib/level-schema'
import { db } from '@/server/db'
import { levels } from '@/server/db/schema/levels'
import { sets } from '@/server/db/schema/sets'

export const getLevelWithSet = (userId: string, levelId: string) => {
  return unstable_cache(
    async () => {
      const levelRows = await db
        .select()
        .from(levels)
        .where(eq(levels.id, levelId))
        .limit(1)

      if (levelRows.length === 0) {
        return null
      }

      const level = levelRows[0]
      const setRows = await db
        .select()
        .from(sets)
        .where(and(eq(sets.id, level.setId), eq(sets.userId, userId)))
        .limit(1)

      if (setRows.length === 0) {
        return null
      }

      const orderedLevels = await db
        .select()
        .from(levels)
        .where(eq(levels.setId, level.setId))
        .orderBy(asc(levels.order))

      return {
        set: setRows[0],
        level,
        levels: orderedLevels,
      }
    },
    ['level', userId, levelId],
    { tags: ['sets', `level:${levelId}`] }
  )()
}

export const getLevelForUser = async (input: {
  levelId: string
  userId: string
}) => {
  const levelRows = await db
    .select()
    .from(levels)
    .where(eq(levels.id, input.levelId))
    .limit(1)

  if (levelRows.length === 0) {
    return null
  }

  const level = levelRows[0]
  const setRows = await db
    .select({ id: sets.id })
    .from(sets)
    .where(and(eq(sets.id, level.setId), eq(sets.userId, input.userId)))
    .limit(1)

  if (setRows.length === 0) {
    return null
  }

  return level
}

export const getOwnedSetTheme = async (input: {
  setId: string
  userId: string
}) => {
  const setRows = await db
    .select({ id: sets.id, theme: sets.theme })
    .from(sets)
    .where(and(eq(sets.id, input.setId), eq(sets.userId, input.userId)))
    .limit(1)

  return setRows[0] ?? null
}

export const getNextLevelOrder = async (setId: string) => {
  const rows = await db
    .select({ order: levels.order })
    .from(levels)
    .where(eq(levels.setId, setId))
    .orderBy(desc(levels.order))
    .limit(1)

  return rows[0]?.order ? rows[0].order + 1 : 1
}

export const createLevelForSet = async (input: {
  id: string
  setId: string
  title: string
  order: number
  level: Level
}) => {
  await db.insert(levels).values({
    id: input.id,
    setId: input.setId,
    title: input.title,
    order: input.order,
    levelMap: input.level.levelMap,
    tileset: input.level.tileset,
    difficulty: input.level.difficulty,
    backgroundColor: input.level.backgroundColor,
    hudColor: input.level.hudColor,
    accentColor: input.level.accentColor,
    platformTint: input.level.platformTint,
  })
}

export const updateLevelForSet = async (input: {
  levelId: string
  setId: string
  title: string
  level: Level
}) => {
  await db
    .update(levels)
    .set({
      title: input.title,
      levelMap: input.level.levelMap,
      tileset: input.level.tileset,
      difficulty: input.level.difficulty,
      backgroundColor: input.level.backgroundColor,
      hudColor: input.level.hudColor,
      accentColor: input.level.accentColor,
      platformTint: input.level.platformTint,
      updatedAt: new Date(),
    })
    .where(and(eq(levels.id, input.levelId), eq(levels.setId, input.setId)))
}

export const deleteLevelForSet = async (input: {
  levelId: string
  setId: string
}) => {
  await db
    .delete(levels)
    .where(and(eq(levels.id, input.levelId), eq(levels.setId, input.setId)))
}
