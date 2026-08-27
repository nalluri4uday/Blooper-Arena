import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@blooper-arena/database/schema';

type Db = ReturnType<typeof drizzle<typeof schema>>;

// Singleton for API routes (serverless connection)
let db: Db;

export function getDb(): Db {
  if (!db) {
    const sql = neon(process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL!);
    db = drizzle(sql, { schema });
  }
  return db;
}
