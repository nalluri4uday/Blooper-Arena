import {
  pgTable,
  text,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { seasons } from "./seasons";
import { characters } from "./characters";

// ── Enums ──────────────────────────────────────────────────────────────────────

export const decisionStatusEnum = pgEnum("decision_status", [
  "pending",
  "submitted",
  "expired",
  "resolved",
]);

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DecisionOption {
  key: string;
  label: string;
  description?: string;
  energyCost?: number;
}

// ── Decisions ──────────────────────────────────────────────────────────────────

export const decisions = pgTable(
  "decisions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    eventId: text("event_id"),
    opportunityId: text("opportunity_id"),
    seasonId: text("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    characterId: text("character_id")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    options: jsonb("options").$type<DecisionOption[]>().notNull(),
    selectedOption: text("selected_option"),
    status: decisionStatusEnum("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    submittedAt: timestamp("submitted_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("decisions_character_status_idx").on(
      table.characterId,
      table.status,
    ),
    index("decisions_status_expires_idx").on(table.status, table.expiresAt),
  ],
);
