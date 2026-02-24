import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { CreateSetForm } from "@/app/(app)/_components/create-set-form";
import { getSession } from "@/server/auth";
import { db } from "@/server/db";
import { sets } from "@/server/db/schema/sets";

interface HomePageProps {
  searchParams?: { welcome?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await getSession();
  const userId = session?.user?.id ?? "";

  const setRows = await db
    .select()
    .from(sets)
    .where(eq(sets.userId, userId))
    .orderBy(desc(sets.createdAt));

  const showWelcome = searchParams?.welcome === "1";

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

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="border-2 border-border bg-secondary-background p-6 shadow-shadow">
          <div className="mb-4 text-foreground/60 text-xs uppercase tracking-[0.3em]">
            your sets
          </div>
          {setRows.length === 0 ? (
            <div className="text-foreground/70 text-sm">
              No sets yet. Create one to get started.
            </div>
          ) : (
            <div className="grid gap-3">
              {setRows.map((set) => (
                <Link
                  className="flex items-center justify-between border-2 border-border bg-background px-4 py-3 shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  href={`/sets/${set.id}`}
                  key={set.id}
                >
                  <div>
                    <div className="font-heading text-lg">{set.name}</div>
                    <div className="text-foreground/60 text-xs uppercase tracking-[0.2em]">
                      {set.theme}
                    </div>
                  </div>
                  <div className="text-foreground/50 text-xs">Open</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <CreateSetForm />
      </div>
    </div>
  );
}
