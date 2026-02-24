import { streamObject } from 'ai'
import { levelEditorPrompt } from '@/lib/ai/prompts/level-editor'
import { provider } from '@/lib/ai/providers'
import { levelSchema } from '@/lib/level-schema'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { instruction, level }: { instruction: string; level: unknown } =
    await req.json()

  const result = streamObject({
    model: provider.languageModel('chat-model'),
    schema: levelSchema,
    system: levelEditorPrompt,
    prompt: `Current level JSON:\n${JSON.stringify(level)}\n\nInstruction: ${instruction}`,
  })

  return result.toTextStreamResponse()
}
