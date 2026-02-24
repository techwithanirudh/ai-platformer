import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { env } from '@/env'
import { accounts, sessions, users, verifications } from './schema/auth'
import { levels } from './schema/levels'
import { sets } from './schema/sets'

const sql = neon(env.DATABASE_URL)

const schema = {
  users,
  sessions,
  accounts,
  verifications,
  sets,
  levels,
}

export const db = drizzle({
  client: sql,
  schema,
  casing: 'snake_case',
})
