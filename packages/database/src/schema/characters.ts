import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./users";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CharacterAttributes {
  strategy: number;
  negotiation: number;
  riskAppetite: number;
  charisma: number;
  discipline: number;
  creativity: number;
}

export interface CharacterCosmetics {
  [key: string]: unknown;
}

// ── Characters ─────────────────────────────────────────────────────────────────

export const characters = pgTable(
  "characters",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    attributes: jsonb("attributes").$type<CharacterAttributes>().notNull(),
    cosmetics: jsonb("cosmetics").$type<CharacterCosmetics>(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("characters_user_id_idx").on(table.userId),
  ],
);
