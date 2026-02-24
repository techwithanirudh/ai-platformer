"use client";

import { experimental_useObject as useObject } from "ai/react";
import { useEffect, useRef, useState } from "react";
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />

      {showPrompt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.78)",
          }}
        >
          <div
            style={{
              background: "#080810",
              border: "3px solid #4a7fff",
              padding: "28px 32px",
              fontFamily: "monospace",
              color: "#e0e0ff",
              width: 500,
              maxWidth: "90vw",
            }}
          >
            {/* Header */}
            <div
              style={{
                marginBottom: 16,
                fontSize: 13,
                color: "#7fbbff",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              &gt; describe your level
            </div>

            {error && (
              <div style={{ color: "#ff6b6b", fontSize: 12, marginBottom: 10 }}>
                ERROR: {error.message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                disabled={isLoading}
                placeholder="a lava cave with spikes and jumping enemies..."
                ref={inputRef}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 12px",
                  background: "#111",
                  border: "1px solid #2a2a4a",
                  color: "#e0e0ff",
                  fontFamily: "monospace",
                  fontSize: 14,
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: isLoading ? "#1a1a2e" : "#4a7fff",
                    color: isLoading ? "#555" : "#fff",
                    border: "none",
                    fontFamily: "monospace",
                    fontSize: 14,
                    letterSpacing: 2,
                    cursor: isLoading ? "default" : "pointer",
                  }}
                  type="submit"
                >
                  {isLoading ? "GENERATING..." : "GENERATE"}
                </button>

                <button
                  onClick={() => setShowPrompt(false)}
                  style={{
                    padding: "10px 18px",
                    background: "#1a1a1a",
                    color: "#888",
                    border: "1px solid #333",
                    fontFamily: "monospace",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                  type="button"
                >
                  CANCEL
                </button>
              </div>
            </form>

            {/* Live level preview while streaming */}
            {isLoading && object?.levelMap && (
              <pre
                style={{
                  marginTop: 14,
                  padding: "8px 10px",
                  background: "#0a0a0a",
                  border: "1px solid #1a1a1a",
                  fontSize: 11,
                  color: "#44ff44",
                  overflowX: "auto",
                  lineHeight: 1.5,
                }}
              >
                {object.levelMap.join("\n")}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
