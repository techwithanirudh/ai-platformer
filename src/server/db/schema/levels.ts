import {
  integer,
  jsonb,
  pgTableCreator,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sets } from "./sets";

const createTable = pgTableCreator((name) => `markie_${name}`);

export const levels = createTable("levels", {
  id: text("id").primaryKey(),
  setId: text("set_id")
    .notNull()
    .references(() => sets.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  levelMap: jsonb("level_map").$type<string[]>().notNull(),
  tileset: text("tileset").notNull(),
  difficulty: text("difficulty").notNull(),
  backgroundColor: text("background_color").notNull(),
  hudColor: text("hud_color").notNull(),
  accentColor: text("accent_color").notNull(),
  platformTint: text("platform_tint"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
