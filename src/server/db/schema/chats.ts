import { pgTableCreator, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './auth'
import { sets } from './sets'

const createTable = pgTableCreator((name) => `markie_${name}`)

export const chats = createTable('chats', {
  id: text('id').primaryKey(),
  setId: text('set_id')
    .notNull()
    .references(() => sets.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
