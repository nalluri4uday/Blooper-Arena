import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────────────────

export const seasonStatusEnum = pgEnum("season_status", [
  "upcoming",
  "registration",
  "active",
  "completed",
  "archived",
]);

// ── Seasons ────────────────────────────────────────────────────────────────────

export const seasons = pgTable("seasons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  ruleVersion: text("rule_version").notNull(),
  seed: text("seed").notNull(),
  startingCapital: integer("starting_capital").default(100_000).notNull(),
  targetNetWorth: integer("target_net_worth").default(10_000_000).notNull(),
  startsAt: timestamp("starts_at", { mode: "date" }).notNull(),
  endsAt: timestamp("ends_at", { mode: "date" }).notNull(),
  status: seasonStatusEnum("status").default("upcoming").notNull(),
  maxPlayers: integer("max_players").default(10_000).notNull(),
  tickIntervalMinutes: integer("tick_interval_minutes").default(30).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
