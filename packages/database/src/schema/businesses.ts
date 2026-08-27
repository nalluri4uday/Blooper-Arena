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

export const businessStatusEnum = pgEnum("business_status", [
  "starting",
  "operating",
  "profitable",
  "struggling",
  "bankrupt",
  "sold",
]);

// ── Businesses ─────────────────────────────────────────────────────────────────

export const businesses = pgTable(
  "businesses",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    seasonId: text("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
    ownerCharacterId: text("owner_character_id")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(),
    valuation: integer("valuation").default(0).notNull(),
    revenue: integer("revenue").default(0).notNull(),
    expenses: integer("expenses").default(0).notNull(),
    status: businessStatusEnum("status").default("starting").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("businesses_season_owner_idx").on(
      table.seasonId,
      table.ownerCharacterId,
    ),
  ],
);
