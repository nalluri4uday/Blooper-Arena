import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import * as schema from "./schema/index";

/**
 * Create a serverless Neon database connection with Drizzle ORM.
 * Uses the Neon HTTP driver — best suited for Vercel serverless environments.
 */
export function createServerlessDb(connectionString: string) {
  const sql = neon(connectionString);
  return drizzleNeonHttp(sql, { schema });
}

/**
 * Create a pooled database connection with Drizzle ORM (node-postgres).
 * Best suited for long-running processes like the game worker.
 */
export function createPooledDb(connectionString: string) {
  return drizzleNode({ connection: connectionString, schema });
}

export type ServerlessDb = ReturnType<typeof createServerlessDb>;
export type PooledDb = ReturnType<typeof createPooledDb>;
