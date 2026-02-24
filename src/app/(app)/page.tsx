import { asc, desc, eq, inArray } from "drizzle-orm";
import { CreateSetDialog } from "@/app/(app)/_components/create-set-dialog";
import { SetGrid } from "@/app/(app)/_components/set-grid";
import { Button } from "@/components/ui/button";
import { getSession } from "@/server/auth";
import { db } from "@/server/db";
import { levels } from "@/server/db/schema/levels";
import { sets } from "@/server/db/schema/sets";

interface HomePageProps {
  searchParams?: Promise<{ welcome?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await getSession();
  const userId = session?.user?.id ?? "";

  const setRows = await db
    .select()
    .from(sets)
    .where(eq(sets.userId, userId))
    .orderBy(desc(sets.createdAt));

  const setIds = setRows.map((set) => set.id);
  const levelRows =
    setIds.length > 0
      ? await db
          .select()
          .from(levels)
          .where(inArray(levels.setId, setIds))
          .orderBy(asc(levels.order))
      : [];

  const params = await searchParams;
  const showWelcome = params?.welcome === "1";

  return (
    <div className="grid gap-8">
      {showWelcome && (
        <div className="border-2 border-border bg-main px-6 py-4 text-main-foreground shadow-shadow">
          <div className="text-xs uppercase tracking-[0.3em]">welcome</div>
          <div className="font-heading text-2xl">Hi, welcome to Markie</div>
          <p className="text-sm">
            An AI-powered platformer. Build your first set below.
          </p>
        </div>
      )}

      {setRows.length === 0 ? (
        <CreateSetDialog
          trigger={
            <button
              className="group flex w-full items-center justify-between gap-6 border-2 border-border bg-secondary-background px-6 py-10 text-left shadow-shadow transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              type="button"
            >
              <div className="grid gap-3">
                <div className="text-xs uppercase tracking-[0.3em]">
                  no sets yet
                </div>
                <div className="font-heading text-2xl">
                  Create your first set
                </div>
                <p className="max-w-lg text-foreground/70 text-sm">
                  Give it a name and describe the theme. The AI will handle the
                  rest.
                </p>
                <span className="inline-flex w-fit items-center gap-2 border-2 border-border bg-background px-3 py-2 text-xs uppercase tracking-[0.2em]">
                  Click to create
                </span>
              </div>
              <div className="flex h-28 w-36 items-center justify-center border-2 border-border bg-background shadow-shadow">
                <div className="text-center text-[10px] text-foreground/60 uppercase tracking-[0.3em]">
                  placeholder
                </div>
              </div>
            </button>
          }
        />
      ) : (
        <div className="grid gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-foreground/60 text-xs uppercase tracking-[0.3em]">
                sets
              </div>
              <h1 className="font-heading text-3xl">Your sets</h1>
            </div>
            <CreateSetDialog
              trigger={<Button type="button">Create set</Button>}
            />
          </div>

          <SetGrid
            levels={levelRows.map((level) => ({
              id: level.id,
              setId: level.setId,
              title: level.title,
              order: level.order,
            }))}
            sets={setRows.map((set) => ({
              id: set.id,
              name: set.name,
              theme: set.theme,
            }))}
          />
        </div>
      )}
    </div>
  );
}
