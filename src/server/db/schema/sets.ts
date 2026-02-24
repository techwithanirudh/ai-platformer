import { pgTableCreator, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth";

const createTable = pgTableCreator((name) => `markie_${name}`);

export const sets = createTable("sets", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  theme: text("theme").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
