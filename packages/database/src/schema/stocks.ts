import { pgTable, text, real, bigint, boolean, timestamp } from 'drizzle-orm/pg-core';

export const stocks = pgTable('stocks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  symbol: text('symbol').notNull().unique(),
  name: text('name').notNull(),
  exchange: text('exchange').notNull(), // NSE, NYSE, NASDAQ
  market: text('market').notNull(), // IN, US
  lastPrice: real('last_price').default(0).notNull(),
  previousClose: real('previous_close').default(0).notNull(),
  dayChangePercent: real('day_change_percent').default(0).notNull(),
  volume: bigint('volume', { mode: 'number' }).default(0).notNull(),
  marketCap: bigint('market_cap', { mode: 'number' }),
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});
