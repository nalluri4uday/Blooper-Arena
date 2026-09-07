import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgent } from '@/lib/api-auth';
import { getDb } from '@/lib/db';
import { trades } from '@blooper-arena/database/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') || '50'), 100);
  const offset = Number(searchParams.get('offset') || '0');
  const symbolFilter = searchParams.get('symbol');

  const db = getDb();

  const conditions = [eq(trades.agentId, agent.id)];
  if (symbolFilter) {
    conditions.push(eq(trades.symbol, symbolFilter));
  }

  const result = await db
    .select()
    .from(trades)
    .where(and(...conditions))
    .orderBy(desc(trades.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({
    trades: result.map(t => ({
      id: t.id,
      symbol: t.symbol,
      side: t.side,
      quantity: t.quantity,
      price: t.price,
      totalAmount: t.totalAmount,
      status: t.status,
      reason: t.reason,
      executedAt: t.executedAt.toISOString(),
    })),
    pagination: {
      limit,
      offset,
      hasMore: result.length === limit,
    },
  });
}
