import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import GameCanvas from "@/components/game-canvas";
import { getSession } from "@/server/auth";
import { db } from "@/server/db";
import { levels } from "@/server/db/schema/levels";
import { sets } from "@/server/db/schema/sets";

interface PlayLevelPageProps {
  params: Promise<{ levelId: string }>;
}

export default async function PlayLevelPage({ params }: PlayLevelPageProps) {
  const { levelId } = await params;
  const session = await getSession();
  const userId = session?.user?.id ?? "";

  const levelRows = await db
    .select()
    .from(levels)
    .where(eq(levels.id, levelId))
    .limit(1);

  if (levelRows.length === 0) {
    notFound();
  }

  const level = levelRows[0];

  const setRows = await db
    .select()
    .from(sets)
    .where(and(eq(sets.id, level.setId), eq(sets.userId, userId)))
    .limit(1);

  if (setRows.length === 0) {
    notFound();
  }

  const orderedLevels = await db
    .select()
    .from(levels)
    .where(eq(levels.setId, level.setId))
    .orderBy(asc(levels.order));

  const levelList = orderedLevels.map((row) => ({
    levelMap: row.levelMap,
    tileset: row.tileset as "jungle" | "cave" | "castle" | "space" | "lava",
    difficulty: row.difficulty as "easy" | "medium" | "hard",
    backgroundColor: row.backgroundColor,
    hudColor: row.hudColor,
    accentColor: row.accentColor,
    platformTint: row.platformTint ?? null,
  }));

  const startIndex = Math.max(
    0,
    orderedLevels.findIndex((row) => row.id === levelId)
  );

  return (
    <div className="fixed inset-0 bg-black">
      <GameCanvas
        levels={levelList}
        setId={level.setId}
        startIndex={startIndex}
      />
    </div>
  );
}
