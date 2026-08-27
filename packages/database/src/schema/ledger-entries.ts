import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { seasons } from "./seasons";
import { characters } from "./characters";

// ── Enums ──────────────────────────────────────────────────────────────────────

export const ledgerTypeEnum = pgEnum("ledger_type", [
  "starting_capital",
  "salary",
  "investment_gain",
  "investment_loss",
  "business_revenue",
  "business_expense",
  "partnership_income",
  "negotiation_result",
  "risk_event_loss",
  "risk_event_gain",
  "challenge_win",
  "challenge_loss",
  "misc_credit",
  "misc_debit",
]);

// ── Ledger Entries ─────────────────────────────────────────────────────────────

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    seasonId: text("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    characterId: text("character_id")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    type: ledgerTypeEnum("type").notNull(),
    amount: integer("amount").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    referenceId: text("reference_id"),
    description: text("description"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("ledger_entries_season_character_idx").on(
      table.seasonId,
      table.characterId,
    ),
    index("ledger_entries_season_character_created_idx").on(
      table.seasonId,
      table.characterId,
      table.createdAt,
    ),
  ],
);
