import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import GameCanvas from "@/components/game-canvas";
import { getSession } from "@/server/auth";
import { db } from "@/server/db";
import { levels } from "@/server/db/schema/levels";
import { sets } from "@/server/db/schema/sets";

interface PlaySetPageProps {
  params: Promise<{ setId: string }>;
}

export default async function PlaySetPage({ params }: PlaySetPageProps) {
  const { setId } = await params;
  const session = await getSession();
  const userId = session?.user?.id ?? "";

  const setRows = await db
    .select()
    .from(sets)
    .where(and(eq(sets.id, setId), eq(sets.userId, userId)))
    .limit(1);

  if (setRows.length === 0) {
    notFound();
  }

  const levelRows = await db
    .select()
    .from(levels)
    .where(eq(levels.setId, setId))
    .orderBy(asc(levels.order));

  if (levelRows.length === 0) {
    notFound();
  }

  const levelList = levelRows.map((level) => ({
    levelMap: level.levelMap,
    tileset: level.tileset as "jungle" | "cave" | "castle" | "space" | "lava",
    difficulty: level.difficulty as "easy" | "medium" | "hard",
    backgroundColor: level.backgroundColor,
    hudColor: level.hudColor,
    accentColor: level.accentColor,
    platformTint: level.platformTint ?? null,
  }));

  return (
    <div className="fixed inset-0 bg-black">
      <GameCanvas levels={levelList} setId={setId} />
    </div>
  );
}
