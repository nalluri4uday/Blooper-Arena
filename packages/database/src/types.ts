import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  users,
  sessions,
  accounts,
  verifications,
} from "./schema/users";
import type { characters } from "./schema/characters";
import type { seasons } from "./schema/seasons";
import type { seasonPlayers } from "./schema/season-players";
import type { ledgerEntries } from "./schema/ledger-entries";
import type { opportunities } from "./schema/opportunities";
import type { events } from "./schema/events";
import type { decisions } from "./schema/decisions";
import type { leaderboardSnapshots } from "./schema/leaderboard-snapshots";
import type { relationships } from "./schema/relationships";
import type { businesses } from "./schema/businesses";
import type { aiJobs } from "./schema/ai-jobs";

// ── Users & Auth ───────────────────────────────────────────────────────────────

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Session = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

export type Verification = InferSelectModel<typeof verifications>;
export type NewVerification = InferInsertModel<typeof verifications>;

// ── Characters ─────────────────────────────────────────────────────────────────

export type Character = InferSelectModel<typeof characters>;
export type NewCharacter = InferInsertModel<typeof characters>;

// ── Seasons ────────────────────────────────────────────────────────────────────

export type Season = InferSelectModel<typeof seasons>;
export type NewSeason = InferInsertModel<typeof seasons>;

// ── Season Players ─────────────────────────────────────────────────────────────

export type SeasonPlayer = InferSelectModel<typeof seasonPlayers>;
export type NewSeasonPlayer = InferInsertModel<typeof seasonPlayers>;

// ── Ledger Entries ─────────────────────────────────────────────────────────────

export type LedgerEntry = InferSelectModel<typeof ledgerEntries>;
export type NewLedgerEntry = InferInsertModel<typeof ledgerEntries>;

// ── Opportunities ──────────────────────────────────────────────────────────────

export type Opportunity = InferSelectModel<typeof opportunities>;
export type NewOpportunity = InferInsertModel<typeof opportunities>;

// ── Events ─────────────────────────────────────────────────────────────────────

export type Event = InferSelectModel<typeof events>;
export type NewEvent = InferInsertModel<typeof events>;

// ── Decisions ──────────────────────────────────────────────────────────────────

export type Decision = InferSelectModel<typeof decisions>;
export type NewDecision = InferInsertModel<typeof decisions>;

// ── Leaderboard Snapshots ──────────────────────────────────────────────────────

export type LeaderboardSnapshot = InferSelectModel<typeof leaderboardSnapshots>;
export type NewLeaderboardSnapshot = InferInsertModel<
  typeof leaderboardSnapshots
>;

// ── Relationships ──────────────────────────────────────────────────────────────

export type Relationship = InferSelectModel<typeof relationships>;
export type NewRelationship = InferInsertModel<typeof relationships>;

// ── Businesses ─────────────────────────────────────────────────────────────────

export type Business = InferSelectModel<typeof businesses>;
export type NewBusiness = InferInsertModel<typeof businesses>;

// ── AI Jobs ────────────────────────────────────────────────────────────────────

export type AiJob = InferSelectModel<typeof aiJobs>;
export type NewAiJob = InferInsertModel<typeof aiJobs>;
