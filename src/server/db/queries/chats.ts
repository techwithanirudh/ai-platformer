import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/server/db'
import { chatMessages } from '@/server/db/schema/chat-messages'
import { chats } from '@/server/db/schema/chats'

export const getOrCreateChatForSet = async (input: {
  setId: string
  userId: string
}) => {
  const existing = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, input.setId), eq(chats.userId, input.userId)))
    .limit(1)

  if (existing[0]) {
    return existing[0]
  }

  await db.insert(chats).values({
    id: input.setId,
    setId: input.setId,
    userId: input.userId,
  })

  const created = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, input.setId), eq(chats.userId, input.userId)))
    .limit(1)

  return created[0] ?? null
}

export const getChatMessages = (chatId: string) => {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.chatId, chatId))
    .orderBy(asc(chatMessages.createdAt))
}

export const addChatMessage = async (input: {
  chatId: string
  role: 'user' | 'assistant'
  content: string
}) => {
  await db.insert(chatMessages).values({
    id: crypto.randomUUID(),
    chatId: input.chatId,
    role: input.role,
    content: input.content,
  })
}
