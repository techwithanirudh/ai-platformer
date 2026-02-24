"use client";

import { Play, SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { deleteLevelAction } from "@/app/(app)/actions/levels";
import { CreateLevelDialog } from "@/app/(app)/_components/create-level-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SetRow = {
  id: string;
  name: string;
  theme: string;
};

type LevelRow = {
  id: string;
  setId: string;
  title: string;
  order: number;
};

interface SetGridProps {
  sets: SetRow[];
  levels: LevelRow[];
}

const GRID_LIMIT = 16;

export function SetGrid({ sets, levels }: SetGridProps) {
  const grouped = useMemo(() => {
    return levels.reduce<Record<string, LevelRow[]>>((acc, level) => {
      acc[level.setId] ??= [];
      acc[level.setId]?.push(level);
      return acc;
    }, {});
  }, [levels]);

  return (
    <TooltipProvider>
      <div className="grid gap-6">
        {sets.map((set) => (
          <SetSection
            key={set.id}
            levels={grouped[set.id] ?? []}
            set={set}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}

function SetSection({ set, levels }: { set: SetRow; levels: LevelRow[] }) {
  const [expanded, setExpanded] = useState(false);
  const visibleLevels = expanded ? levels : levels.slice(0, GRID_LIMIT);
  const hasMore = levels.length > GRID_LIMIT;

  return (
    <section className="grid gap-4 border-2 border-border bg-secondary-background p-6 shadow-shadow">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-foreground/60 text-xs uppercase tracking-[0.25em]">
            {set.theme}
          </div>
          <div className="mt-1 font-heading text-2xl">{set.name}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/play/sets/${set.id}`}>
            <Button className="px-4">Play set</Button>
          </Link>
          <CreateLevelDialog
            setId={set.id}
            trigger={
              <Button type="button" variant="neutral">
                Make level
              </Button>
            }
          />
          {hasMore && (
            <Button
              onClick={() => setExpanded((prev) => !prev)}
              type="button"
              variant="neutral"
            >
              {expanded ? "Collapse" : "View more"}
            </Button>
          )}
        </div>
      </div>

      {levels.length === 0 ? (
        <div className="border-2 border-border bg-background p-6 text-sm text-foreground/70 shadow-shadow">
          No levels yet. Create one to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleLevels.map((level) => (
            <LevelCard
              key={level.id}
              level={level}
              setId={set.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function LevelCard({ level, setId }: { level: LevelRow; setId: string }) {
  const { execute, status } = useAction(deleteLevelAction);
  const isDeleting = status === "executing";

  return (
    <div className="grid gap-4 border-2 border-border bg-background p-5 shadow-shadow">
      <div>
        <div className="text-foreground/60 text-xs uppercase tracking-[0.2em]">
          level {level.order}
        </div>
        <div className="mt-2 font-heading text-lg">{level.title}</div>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/play/levels/${level.id}`}>
              <Button className="h-10 w-10 p-0" type="button">
                <Play className="size-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Play level</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/sets/${setId}/levels/${level.id}`}>
              <Button className="h-10 w-10 p-0" type="button" variant="neutral">
                <SquarePen className="size-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Open editor</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={isDeleting}
              onClick={() => execute({ levelId: level.id, setId })}
              type="button"
              className="h-10 w-10 border-2 border-red-700 bg-red-500 p-0 text-white shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete level</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
