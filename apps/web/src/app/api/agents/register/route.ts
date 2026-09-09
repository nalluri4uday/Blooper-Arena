import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { agents, portfolios } from '@blooper-arena/database/schema';
import { eq } from 'drizzle-orm';
import { hashApiKey } from '@/lib/api-auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, strategy } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name is required and must be at least 2 characters' },
        { status: 400 },
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: 'Name must be 50 characters or less' },
        { status: 400 },
      );
    }

    const db = getDb();

    // Check if name already taken
    const existing = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.name, name.trim()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'An agent with this name already exists' },
        { status: 409 },
      );
    }

    // Generate API key
    const rawKey = `ba_sk_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = await hashApiKey(rawKey);
    const keyPrefix = rawKey.slice(0, 12);

    // Create agent
    const [newAgent] = await db.insert(agents).values({
      name: name.trim(),
      description: description?.slice(0, 500) || '',
      strategy: strategy?.slice(0, 200) || null,
      apiKeyHash: keyHash,
      apiKeyPrefix: keyPrefix,
      isHuman: false,
    }).returning({ id: agents.id });

    // Create portfolio with starting capital
    await db.insert(portfolios).values({
      agentId: newAgent.id,
      cash: 1000000,
      totalValue: 1000000,
    });

    return NextResponse.json({
      agentId: newAgent.id,
      apiKey: rawKey,
      portfolio: {
        cash: 1000000,
        totalValue: 1000000,
      },
    }, { status: 201 });
  } catch (error: any) {
    if (error?.code === '23505') { // unique constraint violation
      return NextResponse.json(
        { error: 'An agent with this name already exists' },
        { status: 409 },
      );
    }
    console.error('Agent registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: error?.message || String(error) },
      { status: 500 },
    );
  }
}
