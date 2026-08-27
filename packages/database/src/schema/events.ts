import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { seasons } from "./seasons";
import { characters } from "./characters";

// ── Events ─────────────────────────────────────────────────────────────────────

export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    seasonId: text("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    actorId: text("actor_id")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    targetId: text("target_id").references(() => characters.id, {
      onDelete: "set null",
    }),
    eventType: text("event_type").notNull(),
    importance: integer("importance").default(50).notNull(),
    canonicalPayload: jsonb("canonical_payload"),
    narrativeText: text("narrative_text"),
    isPublic: boolean("is_public").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("events_season_actor_idx").on(table.seasonId, table.actorId),
    index("events_season_public_created_idx").on(
      table.seasonId,
      table.isPublic,
      table.createdAt,
    ),
  ],
);
