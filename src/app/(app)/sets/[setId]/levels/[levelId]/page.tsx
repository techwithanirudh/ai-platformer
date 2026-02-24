import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getSession } from "@/server/auth";
import { db } from "@/server/db";
import { levels } from "@/server/db/schema/levels";
import { sets } from "@/server/db/schema/sets";
import { LevelBuilder } from "./_components/level-builder";

interface LevelBuilderPageProps {
  params: Promise<{ setId: string; levelId: string }>;
}

export default async function LevelBuilderPage({
  params,
}: LevelBuilderPageProps) {
  const { setId, levelId } = await params;
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
    .where(and(eq(levels.id, levelId), eq(levels.setId, setId)))
    .limit(1);

  if (levelRows.length === 0) {
    notFound();
  }

  const set = setRows[0];
  const level = levelRows[0];

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-foreground/60 text-xs uppercase tracking-[0.3em]">
          level builder
        </div>
        <h1 className="font-heading text-3xl">{level.title}</h1>
      </div>

      <LevelBuilder
        initialLevel={{
          levelMap: level.levelMap,
          tileset: level.tileset as
            | "jungle"
            | "cave"
            | "castle"
            | "space"
            | "lava",
          difficulty: level.difficulty as "easy" | "medium" | "hard",
          backgroundColor: level.backgroundColor,
          hudColor: level.hudColor,
          accentColor: level.accentColor,
          platformTint: level.platformTint ?? level.accentColor,
        }}
        initialTitle={level.title}
        levelId={level.id}
        setId={setId}
        setTheme={set.theme}
      />
    </div>
  );
}
