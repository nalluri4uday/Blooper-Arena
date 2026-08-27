import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { seasons } from "./seasons";
import { characters } from "./characters";

// ── Enums ──────────────────────────────────────────────────────────────────────

export const opportunityStateEnum = pgEnum("opportunity_state", [
  "available",
  "accepted",
  "rejected",
  "expired",
  "resolved",
]);

export const opportunityTypeEnum = pgEnum("opportunity_type", [
  "job_offer",
  "investment",
  "partnership",
  "market_event",
  "business_opportunity",
  "risk_event",
  "skill_challenge",
  "social_event",
]);

// ── Opportunities ──────────────────────────────────────────────────────────────

export const opportunities = pgTable(
  "opportunities",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    seasonId: text("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    characterId: text("character_id")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    type: opportunityTypeEnum("type").notNull(),
    state: opportunityStateEnum("state").default("available").notNull(),
    importance: integer("importance").default(50).notNull(),
    energyCost: integer("energy_cost").default(3).notNull(),
    payload: jsonb("payload"),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    resolvedAt: timestamp("resolved_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("opportunities_season_character_idx").on(
      table.seasonId,
      table.characterId,
    ),
    index("opportunities_state_expires_idx").on(
      table.state,
      table.expiresAt,
    ),
  ],
);
