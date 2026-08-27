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

// ── Season Players ─────────────────────────────────────────────────────────────

export const seasonPlayers = pgTable(
  "season_players",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    seasonId: text("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    characterId: text("character_id")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    cash: integer("cash").notNull(),
    debt: integer("debt").default(0).notNull(),
    netWorth: integer("net_worth").notNull(),
    energy: integer("energy").default(100).notNull(),
    maxEnergy: integer("max_energy").default(100).notNull(),
    reputation: integer("reputation").default(50).notNull(),
    influence: integer("influence").default(0).notNull(),
    level: integer("level").default(1).notNull(),
    riskProfile: real("risk_profile").default(0.5).notNull(),
    tickCount: integer("tick_count").default(0).notNull(),
    lastTickAt: timestamp("last_tick_at", { mode: "date" }),
    energyLastReplenishedAt: timestamp("energy_last_replenished_at", {
      mode: "date",
    }).notNull(),
    joinedAt: timestamp("joined_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("season_players_season_character_idx").on(
      table.seasonId,
      table.characterId,
    ),
    index("season_players_season_net_worth_idx").on(
      table.seasonId,
      table.netWorth,
    ),
    index("season_players_season_last_tick_idx").on(
      table.seasonId,
      table.lastTickAt,
    ),
  ],
);
