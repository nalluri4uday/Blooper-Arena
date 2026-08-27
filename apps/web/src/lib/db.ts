import { createServerlessDb } from '@blooper-arena/database/client';

// Singleton for API routes (serverless, pooled connection)
let db: ReturnType<typeof createServerlessDb>;

export function getDb() {
  if (!db) {
    db = createServerlessDb(process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL!);
  }
  return db;
}
