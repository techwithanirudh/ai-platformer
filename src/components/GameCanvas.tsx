"use client";

import { experimental_useObject as useObject } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import { StartGame } from "@/game/game";
import type { Level } from "@/lib/level-schema";
import { levelSchema } from "@/lib/level-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Initialise Kaplay ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const k = StartGame(canvasRef.current);
    return () => k.quit();
  }, []);

  // ── EventBus: Kaplay → React ────────────────────────────────────────────────
  useEffect(() => {
    const onShow = () => {
      setShowPrompt(true);
      // Focus the input after the overlay renders
      setTimeout(() => inputRef.current?.focus(), 80);
    };
    const onHide = () => setShowPrompt(false);

    EventBus.on("show-ai-prompt", onShow);
    EventBus.on("hide-ai-prompt", onHide);
    return () => {
      EventBus.off("show-ai-prompt", onShow);
      EventBus.off("hide-ai-prompt", onHide);
    };
  }, []);

  // ── AI SDK ──────────────────────────────────────────────────────────────────
  const { object, submit, isLoading, error } = useObject({
    api: "/api/generate-level",
    schema: levelSchema,
  });

  // When stream finishes emit into Kaplay
  useEffect(() => {
    if (isLoading || !object?.levelMap?.length) {
      return;
    }

    const level: Level = {
      levelMap: object.levelMap.filter((r): r is string => r !== undefined),
      tileset: object.tileset ?? "jungle",
      difficulty: object.difficulty ?? "easy",
      backgroundColor: object.backgroundColor ?? "#1a1a2e",
    };

    EventBus.emit("load-level", level);
    setShowPrompt(false);
  }, [isLoading, object]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const prompt = inputRef.current?.value?.trim();
    if (!prompt || isLoading) {
      return;
    }
    submit({ prompt });
  }

  return (
    <div className="fixed inset-0 h-screen w-screen">
      <canvas ref={canvasRef} className="block h-full w-full" />

      {showPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-overlay px-4">
          <div className="w-full max-w-lg rounded-base border-2 border-border bg-secondary-background p-6 text-foreground shadow-shadow">
            <div className="mb-3 text-xs font-heading uppercase tracking-[0.35em] text-foreground/70">
              &gt; describe your level
            </div>

            {error && (
              <div className="mb-3 border-2 border-border bg-[#ffeded] px-3 py-2 text-xs text-[#a40000]">
                ERROR: {error.message}
              </div>
            )}

            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input
                disabled={isLoading}
                placeholder="a lava cave with spikes and jumping enemies..."
                ref={inputRef}
                className="h-11 text-base"
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={isLoading}
                  className="flex-1 min-w-[160px] tracking-[0.25em]"
                  type="submit"
                >
                  {isLoading ? "GENERATING..." : "GENERATE"}
                </Button>

                <Button
                  onClick={() => setShowPrompt(false)}
                  type="button"
                  variant="neutral"
                  className="min-w-[120px]"
                >
                  Cancel
                </Button>
              </div>
            </form>

            {isLoading && object?.levelMap && (
              <pre className="mt-4 max-h-48 overflow-x-auto border-2 border-border bg-background px-3 py-2 text-xs leading-5 text-foreground">
                {object.levelMap.join("\n")}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
