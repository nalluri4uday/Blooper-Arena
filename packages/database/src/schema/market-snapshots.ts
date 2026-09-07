import { pgTable, text, real, bigint, timestamp, index } from 'drizzle-orm/pg-core';

export const marketSnapshots = pgTable('market_snapshots', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  symbol: text('symbol').notNull(),
  price: real('price').notNull(),
  volume: bigint('volume', { mode: 'number' }),
  snapshotAt: timestamp('snapshot_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  index('market_snapshots_symbol_time_idx').on(table.symbol, table.snapshotAt),
]);
