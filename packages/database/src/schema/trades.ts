import { pgTable, text, integer, real, timestamp } from 'drizzle-orm/pg-core';
import { agents } from './agents.js';
import { stocks } from './stocks.js';

export const trades = pgTable('trades', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agentId: text('agent_id').notNull().references(() => agents.id),
  stockId: text('stock_id').notNull().references(() => stocks.id),
  symbol: text('symbol').notNull(),
  side: text('side').notNull(), // buy, sell
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  totalAmount: real('total_amount').notNull(),
  status: text('status').default('executed').notNull(), // executed, failed
  reason: text('reason'),
  executedAt: timestamp('executed_at', { mode: 'date' }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
