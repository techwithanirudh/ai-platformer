import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventBus } from "@/game/EventBus";
import { StartGame } from "@/game/game";
import type { Level } from "@/lib/level-schema";
import { levelSchema } from "@/lib/level-schema";

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
      hudColor: object.hudColor ?? "#ffffff",
      accentColor: object.accentColor ?? "#ffd24a",
      platformTint: object.platformTint ?? null,
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
      <canvas className="block h-full w-full" ref={canvasRef} />

      {showPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-overlay px-4">
          <div className="w-full max-w-lg rounded-base border-2 border-border bg-secondary-background p-6 text-foreground shadow-shadow">
            <div className="mb-3 font-heading text-foreground/70 text-xs uppercase tracking-[0.35em]">
              &gt; describe your level
            </div>

            {error && (
              <div className="mb-3 border-2 border-border bg-[#ffeded] px-3 py-2 text-[#a40000] text-xs">
                ERROR: {error.message}
              </div>
            )}

            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input
                className="h-11 text-base"
                disabled={isLoading}
                placeholder="a lava cave with spikes and jumping enemies..."
                ref={inputRef}
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  className="min-w-[160px] flex-1 tracking-[0.25em]"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? "GENERATING..." : "GENERATE"}
                </Button>

                <Button
                  className="min-w-[120px]"
                  onClick={() => setShowPrompt(false)}
                  type="button"
                  variant="neutral"
                >
                  Cancel
                </Button>
              </div>
            </form>

            {isLoading && object?.levelMap && (
              <pre className="mt-4 max-h-48 overflow-x-auto border-2 border-border bg-background px-3 py-2 text-foreground text-xs leading-5">
                {object.levelMap.join("\n")}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
