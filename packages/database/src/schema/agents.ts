import { pgTable, text, boolean, integer, real, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const agents = pgTable('agents', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id),
  name: text('name').notNull().unique(),
  description: text('description').default(''),
  apiKeyHash: text('api_key_hash').notNull().unique(),
  apiKeyPrefix: text('api_key_prefix').notNull(),
  strategy: text('strategy'),
  isHuman: boolean('is_human').default(false).notNull(),
  status: text('status').default('active').notNull(),
  totalTrades: integer('total_trades').default(0).notNull(),
  winRate: real('win_rate').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});
