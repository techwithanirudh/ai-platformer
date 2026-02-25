import { convertToModelMessages, streamText, tool } from 'ai'
import { z } from 'zod'
import { levelChatPrompt } from '@/lib/ai/prompts/level-chat'
import { provider } from '@/lib/ai/providers'
import { levelSchema } from '@/lib/level-schema'
import { getSession } from '@/server/auth'
import {
  addChatMessage,
  getLevelForUser,
  getOrCreateChatForSet,
  getOwnedSetTheme,
  updateLevelForSet,
} from '@/server/db/queries'

export const runtime = 'edge'

export async function POST(req: Request) {
  const session = await getSession()
  const userId = session?.user?.id
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const {
    messages,
    setId,
    levelId,
  }: { messages: unknown; setId?: string; levelId?: string } = await req.json()

  const hasRequiredFields = Boolean(setId && levelId)
  if (!(hasRequiredFields && Array.isArray(messages))) {
    return new Response('Invalid request', { status: 400 })
  }

  const setRecord = await getOwnedSetTheme({ setId, userId })
  if (!setRecord) {
    return new Response('Set not found', { status: 404 })
  }

  const chat = await getOrCreateChatForSet({ setId, userId })
  if (!chat) {
    return new Response('Chat not found', { status: 404 })
  }

  const lastMessage = messages.at(-1)
  if (lastMessage?.role === 'user') {
    const textPart = lastMessage.parts?.find(
      (part: { type?: string }) => part.type === 'text'
    )
    if (textPart?.text) {
      await addChatMessage({
        chatId: chat.id,
        role: 'user',
        content: textPart.text,
      })
    }
  }

  const result = streamText({
    model: provider.languageModel('chat-model'),
    system: levelChatPrompt(setRecord.theme),
    messages: await convertToModelMessages(messages),
    tools: {
      readLevel: tool({
        description:
          'Read the current level JSON and metadata for a level the user owns.',
        inputSchema: z.object({
          levelId: z.string(),
        }),
        execute: async ({ levelId: requestedId }) => {
          const level = await getLevelForUser({
            levelId: requestedId,
            userId,
          })
          if (!level) {
            return { error: 'Level not found.' }
          }
          return {
            levelId: level.id,
            title: level.title,
            level: {
              levelMap: level.levelMap,
              tileset: level.tileset,
              difficulty: level.difficulty,
              backgroundColor: level.backgroundColor,
              hudColor: level.hudColor,
              accentColor: level.accentColor,
              platformTint: level.platformTint ?? level.accentColor,
            },
          }
        },
      }),
      updateLevel: tool({
        description:
          'Update a level JSON (and optional title) for a level the user owns.',
        inputSchema: z.object({
          levelId: z.string(),
          title: z.string().optional(),
          level: levelSchema,
        }),
        execute: async ({ levelId: requestedId, title, level }) => {
          const existing = await getLevelForUser({
            levelId: requestedId,
            userId,
          })
          if (!existing) {
            return { error: 'Level not found.' }
          }
          await updateLevelForSet({
            levelId: requestedId,
            setId: existing.setId,
            title: title ?? existing.title,
            level,
          })
          return {
            levelId: requestedId,
            title: title ?? existing.title,
            level,
          }
        },
      }),
    },
    onFinish: async ({ text }) => {
      if (text.trim().length === 0) {
        return
      }
      await addChatMessage({
        chatId: chat.id,
        role: 'assistant',
        content: text,
      })
    },
  })

  return result.toUIMessageStreamResponse()
}
