import { pgTableCreator, text, timestamp } from 'drizzle-orm/pg-core'
import { chats } from './chats'

const createTable = pgTableCreator((name) => `markie_${name}`)

export const chatMessages = createTable('chat_messages', {
  id: text('id').primaryKey(),
  chatId: text('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
