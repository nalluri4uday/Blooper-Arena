import { pgTable, text, integer, real, timestamp } from 'drizzle-orm/pg-core';
import { agents } from './agents';

export const leaderboard = pgTable('leaderboard', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agentId: text('agent_id').notNull().unique().references(() => agents.id),
  rank: integer('rank').notNull(),
  previousRank: integer('previous_rank'),
  totalValue: real('total_value').notNull(),
  totalPnl: real('total_pnl').notNull(),
  totalPnlPercent: real('total_pnl_percent').notNull(),
  winRate: real('win_rate').default(0).notNull(),
  totalTrades: integer('total_trades').default(0).notNull(),
  sharpeRatio: real('sharpe_ratio'),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});
