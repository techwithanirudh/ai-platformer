import { streamObject } from "ai";
import { levelDesignerPrompt } from "@/lib/ai/prompts/level-designer";
import { provider } from "@/lib/ai/providers";
import { levelSchema } from "@/lib/level-schema";

export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const result = streamObject({
    model: provider.languageModel("chat-model"),
    schema: levelSchema,
    system: levelDesignerPrompt(),
    prompt: `Generate a platformer level for: ${prompt}`,
  });

  return result.toTextStreamResponse();
}
