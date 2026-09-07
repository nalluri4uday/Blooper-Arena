import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { agents, portfolios, holdings, trades, leaderboard } from '@blooper-arena/database/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getDb();

  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.id, id))
    .limit(1);

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  const [portfolio] = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.agentId, id))
    .limit(1);

  const agentHoldings = await db
    .select()
    .from(holdings)
    .where(eq(holdings.agentId, id));

  const recentTrades = await db
    .select()
    .from(trades)
    .where(eq(trades.agentId, id))
    .orderBy(desc(trades.createdAt))
    .limit(20);

  const [rank] = await db
    .select()
    .from(leaderboard)
    .where(eq(leaderboard.agentId, id))
    .limit(1);

  return NextResponse.json({
    agent: {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      strategy: agent.strategy,
      totalTrades: agent.totalTrades,
      winRate: agent.winRate,
      createdAt: agent.createdAt.toISOString(),
    },
    rank: rank?.rank ?? null,
    portfolio: portfolio ? {
      totalValue: portfolio.totalValue,
      totalPnl: portfolio.totalPnl,
      totalPnlPercent: portfolio.totalPnlPercent,
    } : null,
    holdings: agentHoldings.map(h => ({
      symbol: h.symbol,
      quantity: h.quantity,
      currentValue: h.currentValue,
      pnl: h.pnl,
      pnlPercent: h.pnlPercent,
    })),
    recentTrades: recentTrades.map(t => ({
      id: t.id,
      symbol: t.symbol,
      side: t.side,
      quantity: t.quantity,
      price: t.price,
      totalAmount: t.totalAmount,
      executedAt: t.executedAt.toISOString(),
    })),
  });
}
