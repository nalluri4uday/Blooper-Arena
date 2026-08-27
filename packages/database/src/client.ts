import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import Pool from "pg";
import * as schema from "./schema/index";

/**
 * Create a serverless Neon database connection with Drizzle ORM.
 * Best suited for Vercel Edge / serverless environments.
 */
export function createServerlessDb(connectionString: string) {
  const sql = neon(connectionString);
  return drizzleNeon({ client: sql, schema });
}

/**
 * Create a pooled database connection with Drizzle ORM (node-postgres).
 * Best suited for long-running processes like the game worker.
 */
export function createPooledDb(connectionString: string) {
  const pool = new Pool.Pool({ connectionString });
  return drizzleNode({ client: pool, schema });
}

export type ServerlessDb = ReturnType<typeof createServerlessDb>;
export type PooledDb = ReturnType<typeof createPooledDb>;
