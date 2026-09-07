import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { agents } from '@blooper-arena/database/schema';
import { eq } from 'drizzle-orm';

// Simple in-memory cache with TTL
const agentCache = new Map<string, { agent: typeof agents.$inferSelect; expiresAt: number }>();
const CACHE_TTL = 60_000; // 60 seconds

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function authenticateAgent(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const apiKey = authHeader.slice(7);
  if (!apiKey.startsWith('ba_sk_')) {
    return null;
  }

  // Check cache first
  const cached = agentCache.get(apiKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.agent;
  }

  const hash = await hashApiKey(apiKey);
  const db = getDb();

  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.apiKeyHash, hash))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const agent = result[0];
  if (agent.status !== 'active') {
    return null;
  }

  // Cache it
  agentCache.set(apiKey, { agent, expiresAt: Date.now() + CACHE_TTL });

  return agent;
}

export { hashApiKey };
