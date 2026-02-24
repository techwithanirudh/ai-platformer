"use server";

import { generateObject } from "ai";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { levelDesignerPrompt } from "@/lib/ai/prompts/level-designer";
import { provider } from "@/lib/ai/providers";
import type { Level } from "@/lib/level-schema";
import { levelSchema } from "@/lib/level-schema";
import { getSession } from "@/server/auth";
import { db } from "@/server/db";
import { levels } from "@/server/db/schema/levels";
import { sets } from "@/server/db/schema/sets";

const createLevelSchema = z.object({
  setId: z.string().min(1),
  title: z.string().min(1).max(64),
});

export async function createLevel(formData: FormData) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const parsed = createLevelSchema.safeParse({
    setId: formData.get("setId"),
    title: formData.get("title") ?? "New Level",
  });

  if (!parsed.success) {
    return;
  }

  const setRecord = await db
    .select()
    .from(sets)
    .where(
      and(eq(sets.id, parsed.data.setId), eq(sets.userId, session.user.id))
    )
    .limit(1);

  if (setRecord.length === 0) {
    return;
  }

  const existingLevels = await db
    .select({ order: levels.order })
    .from(levels)
    .where(eq(levels.setId, parsed.data.setId))
    .orderBy(desc(levels.order))
    .limit(1);

  const nextOrder = existingLevels[0]?.order ? existingLevels[0].order + 1 : 1;

  const result = await generateObject({
    model: provider.languageModel("chat-model"),
    schema: levelSchema,
    system: levelDesignerPrompt(),
    prompt: `Create a brand new ${setRecord[0].theme} level titled "${parsed.data.title}".`,
  });

  const newLevel: Level = result.object;
  const id = crypto.randomUUID();

  await db.insert(levels).values({
    id,
    setId: parsed.data.setId,
    title: parsed.data.title,
    order: nextOrder,
    levelMap: newLevel.levelMap,
    tileset: newLevel.tileset,
    difficulty: newLevel.difficulty,
    backgroundColor: newLevel.backgroundColor,
    hudColor: newLevel.hudColor,
    accentColor: newLevel.accentColor,
    platformTint: newLevel.platformTint ?? null,
  });

  revalidatePath(`/sets/${parsed.data.setId}`);
  redirect(`/sets/${parsed.data.setId}/levels/${id}`);
}

const updateLevelSchema = z.object({
  id: z.string().min(1),
  setId: z.string().min(1),
  title: z.string().min(1).max(64),
  level: z.custom<Level>(),
});

export async function updateLevel(data: {
  id: string;
  setId: string;
  title: string;
  level: Level;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const parsed = updateLevelSchema.safeParse(data);
  if (!parsed.success) {
    return;
  }

  const setRecord = await db
    .select()
    .from(sets)
    .where(
      and(eq(sets.id, parsed.data.setId), eq(sets.userId, session.user.id))
    )
    .limit(1);

  if (setRecord.length === 0) {
    return;
  }

  const levelData = parsed.data.level;

  await db
    .update(levels)
    .set({
      title: parsed.data.title,
      levelMap: levelData.levelMap,
      tileset: levelData.tileset,
      difficulty: levelData.difficulty,
      backgroundColor: levelData.backgroundColor,
      hudColor: levelData.hudColor,
      accentColor: levelData.accentColor,
      platformTint: levelData.platformTint ?? null,
      updatedAt: new Date(),
    })
    .where(
      and(eq(levels.id, parsed.data.id), eq(levels.setId, parsed.data.setId))
    );

  revalidatePath(`/sets/${parsed.data.setId}`);
  revalidatePath(`/sets/${parsed.data.setId}/levels/${parsed.data.id}`);
  return;
}

export async function deleteLevel(formData: FormData) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const setId = formData.get("setId");
  const levelId = formData.get("levelId");

  if (typeof setId !== "string" || typeof levelId !== "string") {
    return;
  }

  const setRecord = await db
    .select()
    .from(sets)
    .where(and(eq(sets.id, setId), eq(sets.userId, session.user.id)))
    .limit(1);

  if (setRecord.length === 0) {
    return;
  }

  await db
    .delete(levels)
    .where(and(eq(levels.id, levelId), eq(levels.setId, setId)));

  revalidatePath(`/sets/${setId}`);
}
