import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { levelSchema } from "@/lib/level-schema";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { prompt }: { prompt: string } = await req.json();

  const result = streamObject({
    model: openai("gpt-4o-mini"),
    schema: levelSchema,
    system: `You are a creative platformer level designer for a 2D game.

TILE SYMBOLS:
  =  grass ground / platform (solid)
  -  steel platform (solid, floats)
  $  coin (collectible)
  %  prize box (player headbutts to release apple)
  ^  spike (instant death)
  >  ghost enemy (patrols left-right)
  @  player spawn point (exactly ONE per level)
  [space]  empty air

RULES:
- Generate exactly 10 rows
- Each row must be exactly 24 characters wide (pad with spaces)
- The bottom row should be "========================" (solid ground)
- Place '@' exactly once, one row above a '=' tile
- Easy: wide platforms, few gaps, 1-2 enemies, many coins
- Medium: some gaps, 2-3 enemies, moderate coins, a few spikes
- Hard: narrow platforms, big gaps, 4+ enemies, many spikes`,
    prompt: `Generate a platformer level for: ${prompt}`,
  });

  return result.toTextStreamResponse();
}
