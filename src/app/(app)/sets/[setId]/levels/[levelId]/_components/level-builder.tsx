"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { updateLevel } from "@/app/(app)/actions/levels";
import GameCanvas from "@/components/game-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Level } from "@/lib/level-schema";
import { levelSchema } from "@/lib/level-schema";

interface LevelBuilderProps {
  initialLevel: Level;
  initialTitle: string;
  levelId: string;
  setId: string;
  setTheme: string;
}

export function LevelBuilder({
  levelId,
  setId,
  setTheme,
  initialLevel,
  initialTitle,
}: LevelBuilderProps) {
  const [draftLevel, setDraftLevel] = useState<Level>(initialLevel);
  const [title, setTitle] = useState(initialTitle);
  const [prompt, setPrompt] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isSaving, startTransition] = useTransition();

  const { object, submit, isLoading } = useObject({
    api: "/api/levels/edit",
    schema: levelSchema,
  });

  useEffect(() => {
    if (!object || isLoading) {
      return;
    }

    const parsed = levelSchema.safeParse(object);
    if (!parsed.success) {
      return;
    }

    setDraftLevel(parsed.data);
  }, [object, isLoading]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadIdeas() {
      try {
        const res = await fetch("/api/levels/ideas", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ theme: setTheme, prompt: title }),
          signal: controller.signal,
        });

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        if (Array.isArray(data?.ideas)) {
          setIdeas(data.ideas);
        }
      } catch {
        // ignore
      }
    }

    loadIdeas();
    return () => controller.abort();
  }, [setTheme, title]);

  const canSubmit = prompt.trim().length > 0 && !isLoading;

  const previewLevel = useMemo(() => draftLevel, [draftLevel]);

  const handleApply = () => {
    if (!canSubmit) {
      return;
    }
    submit({
      instruction: prompt.trim(),
      level: draftLevel,
    });
  };

  const handleIdea = (idea: string) => {
    setPrompt(idea);
    submit({
      instruction: idea,
      level: draftLevel,
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateLevel({
        id: levelId,
        setId,
        title,
        level: draftLevel,
      });
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="aspect-video w-full overflow-hidden border-2 border-border bg-black shadow-shadow">
        <GameCanvas level={previewLevel} />
      </div>

      <div className="grid gap-4 border-2 border-border bg-secondary-background p-4 shadow-shadow">
        <div>
          <div className="text-foreground/60 text-xs uppercase tracking-[0.3em]">
            ai editor
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {ideas.map((idea) => (
              <button
                className="border-2 border-border bg-background px-3 py-2 text-left text-xs"
                key={idea}
                onClick={() => handleIdea(idea)}
                type="button"
              >
                {idea}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Input
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Level title"
            value={title}
          />
          <textarea
            className="min-h-[120px] w-full border-2 border-border bg-background p-3 text-sm"
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask the AI to edit this level..."
            value={prompt}
          />
          <div className="flex flex-wrap gap-2">
            <Button disabled={!canSubmit} onClick={handleApply}>
              {isLoading ? "Updating..." : "Apply edits"}
            </Button>
            <Button disabled={isSaving} onClick={handleSave} variant="neutral">
              {isSaving ? "Saving..." : "Save level"}
            </Button>
            <Link href={`/play/levels/${levelId}`}>
              <Button variant="reverse">Play level</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-foreground/60 text-xs uppercase tracking-[0.3em]">
            colors
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center justify-between gap-2 text-xs">
              Background
              <input
                className="h-9 w-12 border-2 border-border"
                onChange={(event) =>
                  setDraftLevel({
                    ...draftLevel,
                    backgroundColor: event.target.value,
                  })
                }
                type="color"
                value={draftLevel.backgroundColor}
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-xs">
              HUD
              <input
                className="h-9 w-12 border-2 border-border"
                onChange={(event) =>
                  setDraftLevel({
                    ...draftLevel,
                    hudColor: event.target.value,
                  })
                }
                type="color"
                value={draftLevel.hudColor}
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-xs">
              Accent
              <input
                className="h-9 w-12 border-2 border-border"
                onChange={(event) =>
                  setDraftLevel({
                    ...draftLevel,
                    accentColor: event.target.value,
                  })
                }
                type="color"
                value={draftLevel.accentColor}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
