import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  index,
} from "drizzle-orm/pg-core";
import { seasons } from "./seasons";
import { characters } from "./characters";

// ── Leaderboard Snapshots ──────────────────────────────────────────────────────

export const leaderboardSnapshots = pgTable(
  "leaderboard_snapshots",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    seasonId: text("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    characterId: text("character_id")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    rank: integer("rank").notNull(),
    previousRank: integer("previous_rank"),
    netWorth: integer("net_worth").notNull(),
    score: real("score").notNull(),
    capturedAt: timestamp("captured_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("leaderboard_snapshots_season_captured_idx").on(
      table.seasonId,
      table.capturedAt,
    ),
    index("leaderboard_snapshots_season_captured_rank_idx").on(
      table.seasonId,
      table.capturedAt,
      table.rank,
    ),
  ],
);
