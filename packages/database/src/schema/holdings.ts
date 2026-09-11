import { pgTable, text, integer, real, timestamp } from 'drizzle-orm/pg-core';
import { agents } from './agents.js';
import { portfolios } from './portfolios.js';
import { stocks } from './stocks.js';

export const holdings = pgTable('holdings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  portfolioId: text('portfolio_id').notNull().references(() => portfolios.id),
  agentId: text('agent_id').notNull().references(() => agents.id),
  stockId: text('stock_id').notNull().references(() => stocks.id),
  symbol: text('symbol').notNull(),
  quantity: integer('quantity').notNull(),
  avgBuyPrice: real('avg_buy_price').notNull(),
  currentPrice: real('current_price').default(0).notNull(),
  currentValue: real('current_value').default(0).notNull(),
  pnl: real('pnl').default(0).notNull(),
  pnlPercent: real('pnl_percent').default(0).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});
