"use server";

import { generateObject } from "ai";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { levelDesignerPrompt } from "@/lib/ai/prompts/level-designer";
import { provider } from "@/lib/ai/providers";
import { levelSchema } from "@/lib/level-schema";
import { authAction } from "@/lib/safe-action";
import {
  createLevelSchema,
  deleteLevelSchema,
  updateLevelSchema,
} from "@/lib/validators/levels";
import { db } from "@/server/db";
import { levels } from "@/server/db/schema/levels";
import { sets } from "@/server/db/schema/sets";

export const createLevelAction = authAction
  .schema(createLevelSchema)
  .action(async ({ parsedInput, ctx }) => {
    const setRecord = await db
      .select()
      .from(sets)
      .where(and(eq(sets.id, parsedInput.setId), eq(sets.userId, ctx.user.id)))
      .limit(1);

    if (setRecord.length === 0) {
      throw new Error("Set not found.");
    }

    const existingLevels = await db
      .select({ order: levels.order })
      .from(levels)
      .where(eq(levels.setId, parsedInput.setId))
      .orderBy(desc(levels.order))
      .limit(1);

    const nextOrder = existingLevels[0]?.order
      ? existingLevels[0].order + 1
      : 1;

    const result = await generateObject({
      model: provider.languageModel("chat-model"),
      schema: levelSchema,
      system: levelDesignerPrompt(),
      prompt: `Create a brand new level titled "${parsedInput.title}". Theme description: ${setRecord[0].theme}. Pick the closest tileset that matches this theme.`,
    });

    const newLevel = result.object;
    const id = crypto.randomUUID();

    await db.insert(levels).values({
      id,
      setId: parsedInput.setId,
      title: parsedInput.title,
      order: nextOrder,
      levelMap: newLevel.levelMap,
      tileset: newLevel.tileset,
      difficulty: newLevel.difficulty,
      backgroundColor: newLevel.backgroundColor,
      hudColor: newLevel.hudColor,
      accentColor: newLevel.accentColor,
      platformTint: newLevel.platformTint,
    });

    revalidatePath(`/sets/${parsedInput.setId}`);
    return { levelId: id, setId: parsedInput.setId };
  });

export const updateLevelAction = authAction
  .schema(updateLevelSchema)
  .action(async ({ parsedInput, ctx }) => {
    const setRecord = await db
      .select()
      .from(sets)
      .where(and(eq(sets.id, parsedInput.setId), eq(sets.userId, ctx.user.id)))
      .limit(1);

    if (setRecord.length === 0) {
      throw new Error("Set not found.");
    }

    const levelData = parsedInput.level;

    await db
      .update(levels)
      .set({
        title: parsedInput.title,
        levelMap: levelData.levelMap,
        tileset: levelData.tileset,
        difficulty: levelData.difficulty,
        backgroundColor: levelData.backgroundColor,
        hudColor: levelData.hudColor,
        accentColor: levelData.accentColor,
        platformTint: levelData.platformTint,
        updatedAt: new Date(),
      })
      .where(
        and(eq(levels.id, parsedInput.id), eq(levels.setId, parsedInput.setId))
      );

    revalidatePath(`/sets/${parsedInput.setId}`);
    revalidatePath(`/sets/${parsedInput.setId}/levels/${parsedInput.id}`);
    return { ok: true };
  });

export const deleteLevelAction = authAction
  .schema(deleteLevelSchema)
  .action(async ({ parsedInput, ctx }) => {
    const setRecord = await db
      .select()
      .from(sets)
      .where(and(eq(sets.id, parsedInput.setId), eq(sets.userId, ctx.user.id)))
      .limit(1);

    if (setRecord.length === 0) {
      throw new Error("Set not found.");
    }

    await db
      .delete(levels)
      .where(
        and(
          eq(levels.id, parsedInput.levelId),
          eq(levels.setId, parsedInput.setId)
        )
      );

    revalidatePath(`/sets/${parsedInput.setId}`);
    return { ok: true };
  });
