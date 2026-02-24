"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { useDefaultLayout } from "react-resizable-panels";
import { updateLevelAction } from "@/app/(app)/actions/levels";
import GameCanvas from "@/components/game-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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
  const [pendingLevel, setPendingLevel] = useState<Level | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [prompt, setPrompt] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [messages, setMessages] = useState<
    { id: string; role: "user" | "assistant" | "tool"; content: string }[]
  >([]);

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

    setPendingLevel(parsed.data);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Update ready. Review and click Apply update to use it.",
      },
    ]);
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
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: prompt.trim() },
    ]);
    submit({
      instruction: prompt.trim(),
      level: draftLevel,
    });
  };

  const handleIdea = (idea: string) => {
    setPrompt(idea);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: idea },
    ]);
    submit({
      instruction: idea,
      level: draftLevel,
    });
  };

  const saveAction = useAction(updateLevelAction);
  const isSaving = saveAction.status === "executing";

  const handleSave = () => {
    saveAction.execute({
      id: levelId,
      setId,
      title,
      level: draftLevel,
    });
  };

  const handleApplyUpdate = () => {
    if (!pendingLevel) {
      return;
    }
    setDraftLevel(pendingLevel);
    setPendingLevel(null);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "tool",
        content: "tool:updateLevel → applied pending update",
      },
    ]);
  };

  const handleReadLevel = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "tool",
        content: `tool:readLevel → ${JSON.stringify(draftLevel)}`,
      },
    ]);
  };

  const { defaultLayout, onLayoutChange } = useDefaultLayout({
    id: `level-builder-${levelId}`,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  });

  return (
    <ResizablePanelGroup
      className="h-[calc(100vh-220px)] min-h-[520px] w-full border-2 border-border bg-secondary-background shadow-shadow"
      direction="vertical"
      defaultLayout={defaultLayout}
      onLayoutChange={onLayoutChange}
    >
      <ResizablePanel defaultSize={50} minSize={35}>
        <div className="h-full w-full border-border border-b-2 bg-black">
          <GameCanvas level={previewLevel} />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={35}>
        <div className="grid h-full gap-4 overflow-y-auto p-4">
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

          <div className="grid gap-3 border-2 border-border bg-background p-3 shadow-shadow">
            <div className="text-foreground/60 text-xs uppercase tracking-[0.3em]">
              chat
            </div>
            <div className="grid gap-2">
              {messages.length === 0 ? (
                <div className="text-sm text-foreground/60">
                  Ask for edits. The AI will propose an update and you decide
                  when to apply it.
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    className="border-2 border-border bg-secondary-background p-2 text-xs"
                    key={message.id}
                  >
                    <div className="text-foreground/60 uppercase tracking-[0.2em]">
                      {message.role}
                    </div>
                    <div className="mt-1 whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleReadLevel} type="button" variant="neutral">
                Read level
              </Button>
              <Button
                disabled={!pendingLevel}
                onClick={handleApplyUpdate}
                type="button"
                variant="reverse"
              >
                Apply update
              </Button>
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
                {isLoading ? "Updating..." : "Send to AI"}
              </Button>
              <Button
                disabled={isSaving}
                onClick={handleSave}
                variant="neutral"
              >
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
              <label className="flex items-center justify-between gap-2 text-xs">
                Platform
                <input
                  className="h-9 w-12 border-2 border-border"
                  onChange={(event) =>
                    setDraftLevel({
                      ...draftLevel,
                      platformTint: event.target.value,
                    })
                  }
                  type="color"
                  value={draftLevel.platformTint}
                />
              </label>
            </div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
