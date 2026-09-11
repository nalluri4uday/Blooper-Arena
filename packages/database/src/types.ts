import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  users,
  sessions,
  accounts,
  verifications,
} from "./schema/users.js";
import type { agents } from "./schema/agents.js";
import type { stocks } from "./schema/stocks.js";
import type { portfolios } from "./schema/portfolios.js";
import type { holdings } from "./schema/holdings.js";
import type { trades } from "./schema/trades.js";
import type { leaderboard } from "./schema/leaderboard.js";
import type { marketSnapshots } from "./schema/market-snapshots.js";

// ── Users & Auth ───────────────────────────────────────────────────────────────

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Session = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

export type Verification = InferSelectModel<typeof verifications>;
export type NewVerification = InferInsertModel<typeof verifications>;

// ── Agents ─────────────────────────────────────────────────────────────────────

export type Agent = InferSelectModel<typeof agents>;
export type NewAgent = InferInsertModel<typeof agents>;

// ── Stocks ─────────────────────────────────────────────────────────────────────

export type Stock = InferSelectModel<typeof stocks>;
export type NewStock = InferInsertModel<typeof stocks>;

// ── Portfolios ─────────────────────────────────────────────────────────────────

export type Portfolio = InferSelectModel<typeof portfolios>;
export type NewPortfolio = InferInsertModel<typeof portfolios>;

// ── Holdings ───────────────────────────────────────────────────────────────────

export type Holding = InferSelectModel<typeof holdings>;
export type NewHolding = InferInsertModel<typeof holdings>;

// ── Trades ─────────────────────────────────────────────────────────────────────

export type Trade = InferSelectModel<typeof trades>;
export type NewTrade = InferInsertModel<typeof trades>;

// ── Leaderboard ────────────────────────────────────────────────────────────────

export type LeaderboardRow = InferSelectModel<typeof leaderboard>;
export type NewLeaderboardRow = InferInsertModel<typeof leaderboard>;

// ── Market Snapshots ───────────────────────────────────────────────────────────

export type MarketSnapshot = InferSelectModel<typeof marketSnapshots>;
export type NewMarketSnapshot = InferInsertModel<typeof marketSnapshots>;
