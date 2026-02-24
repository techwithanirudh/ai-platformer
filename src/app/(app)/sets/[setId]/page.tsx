import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createLevel, deleteLevel } from "@/app/(app)/actions/levels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession } from "@/server/auth";
import { db } from "@/server/db";
import { levels } from "@/server/db/schema/levels";
import { sets } from "@/server/db/schema/sets";

interface SetPageProps {
  params: { setId: string };
}

export default async function SetPage({ params }: SetPageProps) {
  const { setId } = params;
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

  const set = setRows[0];

  const levelRows = await db
    .select()
    .from(levels)
    .where(eq(levels.setId, setId))
    .orderBy(asc(levels.order));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-foreground/60 text-xs uppercase tracking-[0.3em]">
            set
          </div>
          <h1 className="font-heading text-3xl">{set.name}</h1>
          <p className="mt-2 text-foreground/70 text-sm">{set.description}</p>
          <div className="mt-3 inline-flex border-2 border-border bg-background px-3 py-1 text-xs uppercase tracking-[0.25em]">
            {set.theme}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/play/sets/${setId}`}>
            <Button>Play set</Button>
          </Link>
          {levelRows.length > 0 && (
            <Link href={`/play/levels/${levelRows[0].id}`}>
              <Button variant="neutral">Play from level 1</Button>
            </Link>
          )}
        </div>
      </div>

      <form
        action={createLevel}
        className="grid gap-3 border-2 border-border bg-secondary-background p-4 shadow-shadow"
      >
        <input name="setId" type="hidden" value={setId} />
        <div className="text-foreground/60 text-xs uppercase tracking-[0.3em]">
          make level
        </div>
        <Input name="title" placeholder="Level title" required />
        <Button type="submit">Create level</Button>
      </form>

      <div className="grid gap-3">
        {levelRows.length === 0 ? (
          <div className="text-foreground/70 text-sm">No levels yet.</div>
        ) : (
          levelRows.map((level) => (
            <div
              className="flex flex-wrap items-center justify-between gap-3 border-2 border-border bg-background px-4 py-3 shadow-shadow"
              key={level.id}
            >
              <div>
                <div className="font-heading text-lg">{level.title}</div>
                <div className="text-foreground/60 text-xs uppercase tracking-[0.2em]">
                  level {level.order}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/sets/${setId}/levels/${level.id}`}>
                  <Button>Open</Button>
                </Link>
                <Link href={`/play/levels/${level.id}`}>
                  <Button variant="neutral">Play</Button>
                </Link>
                <form action={deleteLevel}>
                  <input name="setId" type="hidden" value={setId} />
                  <input name="levelId" type="hidden" value={level.id} />
                  <Button type="submit" variant="reverse">
                    Delete
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
