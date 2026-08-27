import { pgTable, text, real, index } from "drizzle-orm/pg-core";
import { seasons } from "./seasons";
import { characters } from "./characters";

// ── Relationships ──────────────────────────────────────────────────────────────

export const relationships = pgTable(
  "relationships",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    seasonId: text("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    characterA: text("character_a")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    characterB: text("character_b")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    strength: real("strength").default(0).notNull(),
    trust: real("trust").default(0.5).notNull(),
    rivalry: real("rivalry").default(0).notNull(),
  },
  (table) => [
    index("relationships_season_characters_idx").on(
      table.seasonId,
      table.characterA,
      table.characterB,
    ),
  ],
);
