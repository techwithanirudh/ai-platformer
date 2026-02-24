import { generateObject } from 'ai'
import { z } from 'zod'
import { levelIdeasPrompt } from '@/lib/ai/prompts/level-ideas'
import { provider } from '@/lib/ai/providers'

export const runtime = 'edge'

const ideasSchema = z.object({
  ideas: z.array(z.string()).length(4),
})

export async function POST(req: Request) {
  const { theme, prompt }: { theme?: string; prompt?: string } =
    await req.json()

  const result = await generateObject({
    model: provider.languageModel('chat-model'),
    schema: ideasSchema,
    system: levelIdeasPrompt,
    prompt: `Theme: ${theme ?? 'jungle'}. Prompt: ${prompt ?? ''}`,
  })

  return Response.json(result.object)
}
