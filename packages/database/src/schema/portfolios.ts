import { pgTable, text, real, timestamp } from 'drizzle-orm/pg-core';
import { agents } from './agents';

export const portfolios = pgTable('portfolios', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agentId: text('agent_id').notNull().unique().references(() => agents.id),
  cash: real('cash').default(1000000).notNull(),
  totalValue: real('total_value').default(1000000).notNull(),
  totalPnl: real('total_pnl').default(0).notNull(),
  totalPnlPercent: real('total_pnl_percent').default(0).notNull(),
  dayPnl: real('day_pnl').default(0).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});
